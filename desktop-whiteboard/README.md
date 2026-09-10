# 우리반 퀘스트 전자칠판 · Windows 첫 버전

저장소 전체를 받은 상태에서 `desktop-whiteboard` 폴더를 열고 실행합니다. Node.js 22.12 이상이 필요합니다.

```sh
npm install
npm start
```

`npm start`가 기존 웹 소스와 함께 빌드한 후 Electron을 실행합니다. Electron 실행 파일이 없다고 안내되면 `npx install-electron`으로 공식 실행 파일을 준비합니다.

- 시작은 **화면 조작** 모드입니다. 필기를 누르면 기본 화면 전체에 그릴 수 있습니다.
- **ESC**는 필기에서 화면 조작으로 돌아갑니다. 오른쪽 조작 패널은 항상 클릭할 수 있습니다.
- 펜 3색, 굵기 3/6/10, 투명 지우개, stroke 단위 실행 취소, 전체 지우기만 제공합니다.
- 제목 부분을 끌어 패널을 옮길 수 있습니다. 접어도 모드 전환과 종료 버튼은 남습니다.
- 종료하면 두 창과 Google 로그인 창이 모두 닫힙니다. 필기는 저장하지 않습니다.

## 교실 연결

교사 로그인 후 본인 소유 학급을 선택합니다. `classes`의 `ownerUid == 현재 교사 uid` 조건으로 목록을 읽고 선택 시 서버에서 소유자를 다시 확인합니다. 기존 Firestore Rules와 callable의 권한 검사를 그대로 사용합니다. 임의 classId로 타 교사의 학급을 읽는 기능은 없습니다.

기존 Firebase Google `signInWithPopup`을 사용합니다. Electron의 loopback HTTP origin에서 원래의 Firebase 검증을 수행하며 도메인·User-Agent를 위장하지 않습니다. Electron/Google 또는 authorized domain 제한으로 실패하면 오류 코드를 표시하고 연결을 중단합니다. 대체 인증·custom token·service account·Auth 정책 변경은 구현하지 않았습니다. 브라우저 로그인 상태를 가져오지도 않습니다. Google 로그인 완료 가능 여부는 실제 환경에서 별도로 확인해야 합니다.

Firebase 인증은 `inMemoryPersistence`, Electron은 비영구 session partition을 사용합니다. 앱이 토큰·비밀번호를 파일에 기록하지 않습니다. 로컬 설정 파일에는 선택한 classId만 저장합니다. 학급 데이터는 메모리에만 보관합니다.

## 기존 로직 재사용

`tools/shared-source.mjs`는 기존 `our-class-quest/firebase-client.js`를 AST로 읽고 public config, `groupScoreTransactionFields`, `groupScoreError`, `applyGroupScoreChange`를 **원문 그대로** 빌드에 포함합니다. 전자칠판용 transaction 복사본을 수동으로 관리하지 않습니다. 원본 API가 사라지면 빌드를 실패시킵니다. 기존 웹 파일을 수정하지 않습니다.

| 패널 | 실제 데이터와 처리 |
| --- | --- |
| 오늘 1인1역 | 같은 학급의 `dailyRoleAssignments`를 서울 오늘 날짜로 구독. waiting 먼저, completed 다음, cancelled 제외. `students`, `roleSettings`로 표시 |
| 역할 완료 | 미구현. 기존 `completeRole → cardBonusAward → applyStudentPointChange`와 카드 보너스/pointAward 검증이 교사 화면 상태에 연결돼 있어 독립적으로 복제하지 않음 |
| 포인트 | 기존 `getPointShopData(mode: teacher)`를 4초 간격으로 조회. `studentPointStates` 잔액 구독. 승인·거절은 `resolvePointUseRequest`만 호출. 로컬에서 잔액/재고/상태를 직접 저장하지 않음 |
| 모둠 | 기존 `groups`, `groupScoreStates` 구독. +1/-1만 기존 `applyGroupScoreChange` 호출. 같은 transaction이 `groupScoreTransactions`와 점수 저장. 0 미만 금지, expectedScore 충돌 시 최신 점수 확인 후 재시도 안내 |

모둠별/신청별 처리 중 버튼을 비활성화하며 학급 전환도 잠급니다. 실패한 쓰기를 임의로 반복하지 않습니다. 서버 충돌로 거절된 터치는 점수를 더하지 않습니다. 날짜가 바뀌면 구독을 다시 연결합니다. 학급 선택 변경·로그아웃·창 종료 시 listener와 polling을 정리합니다.

## 검증

```sh
npm test
npm run test:electron
```

테스트는 모의 transaction과 실제 로컬 Electron renderer를 사용하며 운영 데이터를 변경하지 않습니다. 물리적 터치·펜, PPT/한글 위 동작, Windows 고DPI 설정과 운영 학급의 인증·신청 반영은 실제 교실에서 확인해야 합니다. 테스트의 모의 학급은 앱에 연결되지 않습니다.

참고: [Electron 보안](https://www.electronjs.org/docs/latest/tutorial/security), [Firebase Google 로그인](https://firebase.google.com/docs/auth/web/google-signin), [Google embedded user-agent 정책](https://developers.google.com/identity/protocols/oauth2/policies).

설치 프로그램, 자동 업데이트, 자동 시작, 여러 모니터 설정은 포함하지 않습니다. 기존 웹 UI, Functions, Rules, Auth 설정은 변경하지 않습니다.
