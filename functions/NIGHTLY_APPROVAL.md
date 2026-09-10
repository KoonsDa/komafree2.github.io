# 밤 9시 자동 승인 — 로컬 구현, 미배포

## 대상과 기존 저장 구조

- `classes/{classId}/dailyRoleAssignments`: `date`, ISO `appliedAt`, `status: waiting`인 당일 신청을 `completed`로 처리. 기존 `roleSnapshot.points`, 카드 능력 보너스, 일일 보너스 상한, `studentPointStates`, `pointHistory` 형식을 따른다.
- `classes/{classId}/pointUseRequests`: `date`, Timestamp `createdAt`, `approvalRequired: true`, `status: pending`인 포인트 상품 신청만 처리. 기존 `resolvePointUseRequest`에서 분리한 **같은** `resolvePointUse` 트랜잭션을 호출한다. 포인트 지급이 아니라 상품 가격 차감이다. 잔액/재고/개인 한도/상품 가격/활성 학생 검증을 그대로 유지한다.
- 과제의 `assignmentStudentStates.status: review`는 이번 대상에 포함하지 않는다. 새로운 승인 컬렉션이나 상태, Firestore Rules/인덱스 변경은 없다.
- 실제 신청 설정은 하루 1~5개를 허용한다. 자동 완료도 `roleSettings/current.dailyRoleApplicationLimit`을 따르며, 당일 수동·자동 완료 개수를 합산하여 남은 한도만 처리한다. 설정과 완료 개수를 같은 트랜잭션에서 재확인한다. 설정이 없거나 유효하지 않으면 자동 지급하지 않는다.
- 취소/완료/거절/삭제된 항목과 완료 취소(`pointAward.revokedAt`) 이력은 건너뛴다. 기존 `roleDailyUsage` 신청 수는 완료 처리 시 변경하지 않는다.

## 실행과 일관성

- `autoApproveDaily`: Firebase Functions v2 `onSchedule`, `0 21 * * *`, `Asia/Seoul`, `asia-northeast3`.
- `approval-date.js`는 KST 자정~21:00 범위와 저장된 `date`를 모두 검사한다. 21시 이후 새 신청은 그날 작업의 재시도에서도 제외한다. 다음 한국 날짜로 넘어간 재시도는 이전 날짜를 처리하지 않는다.
- 학급 문서의 `autoApproveAt21 !== false`가 기본 ON. 교사 학급 정보에서 ON/OFF 저장 가능. 각 트랜잭션에서 설정과 현재 상태를 다시 읽는다.
- 학급별 문서 경로만 사용한다. 포인트 요청의 `classId`도 일치 여부를 검사한다.
- 상태/잔액/이력을 한 트랜잭션에서 기록한다. 기존 수동 역할 트랜잭션도 상태/잔액 충돌을 검출하므로 중복 지급하지 않는다. 카드 일일 상한 계산에 기존 학생별 포인트 이력을 읽는다.
- 역할 `pointAward.autoApproved`, 포인트 요청 `autoApproved`, 이력 `entry.autoApproved`를 기록한다. 기존 승인/완료 timestamp 필드를 사용한다. 교사 목록에 ‘자동 완료’, 상품 신청 현황에 ‘자동 승인’ 표시.
- 업무 조건 불충족은 미처리 상태로 보존한다. 예기치 않은 오류는 기존 Functions 로그에 남기고 다른 항목 처리를 계속한 뒤 실패시켜 재시도한다. 별도 로그 저장소는 없다.

## 로컬 검증

프로젝트 루트에서:

```powershell
node --test functions/test/nightly-approval.test.js
```

실제 구현을 오프라인 메모리 트랜잭션 하네스로 실행한다. 낙관적 충돌/재시도, 수동 웹 트랜잭션과의 동시 실행, 완료 취소, KST 경계, 과거/처리된 데이터 제외, 학급 분리, OFF, 잔액/상품/재고/개인 한도를 검사한다. 웹의 실제 `completeRole`과 카드 보너스 함수도 실행하여 결과를 비교한다.

운영 DB 쓰기, 실계정 로그인, Firestore Emulator 통합 테스트, 실제 Cloud Scheduler 실행은 하지 않았다. 이 PC에서는 Java/Firebase CLI가 PATH에 없어 Emulator를 실행하지 않았다. 실제 다중 사용자 서버 실행 검증은 배포 전 스테이징에서 수행할 수 있다.

## 배포 전 확인 및 명령 (이번 작업에서는 실행 금지)

1. `our-class-quest`의 실제 Blaze 요금제와 Cloud Scheduler API 활성화 여부를 콘솔에서 확인한다. 현재 계정/요금제는 로컬 파일만으로 확인하지 못했다.
2. 공식 요구 조건: [Functions 배포는 Blaze 필요](https://firebase.google.com/docs/functions/get-started), [예약 함수와 API](https://firebase.google.com/docs/functions/schedule-functions). [Scheduler 가격](https://cloud.google.com/scheduler/pricing)은 작업당 월 USD 0.10, 결제 계정당 3개 무료. Functions 실행/배포 아티팩트 및 Firestore 읽기·쓰기 사용량은 별도이며 실제 무료 할당 잔여량은 미확인.
3. 승인 후 Firebase CLI를 준비하고, 프로젝트 루트에서 아래 두 함수만 배포한다. Scheduler 작업은 Firebase CLI가 생성/갱신한다.

```powershell
firebase deploy --only "functions:autoApproveDaily,functions:resolvePointUseRequest" --project our-class-quest
```

4. 교사 설정 및 자동 처리 표시를 위해 수정한 `our-class-quest/script.js`, `firebase-client.js`, `point-shop.js`를 기존 웹앱 배포 방식으로 반영해야 한다. Functions만 배포하면 기존 학급은 기본 ON이지만 웹 설정 UI는 아직 보이지 않는다.
5. 배포 후 Scheduler의 시간대/일정과 Functions 로그, 테스트 학급의 수동/자동 승인 결과를 확인한다. Rules, desktop-whiteboard, 멀티 모니터, EXE 재빌드는 필요 없다.

commit / push / deploy는 수행하지 않았다.
