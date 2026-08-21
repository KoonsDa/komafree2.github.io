// 우리반 퀘스트 v1.5.2 customization addon
// 기존 index.js의 모든 함수를 그대로 다시 export하고, 학생 화면용 학급 커스터마이징 조회 함수만 추가합니다.
Object.assign(exports, require("./index.js"));

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {getFirestore} = require("firebase-admin/firestore");

function safePointName(value) {
  if (typeof value !== "string") return "P";
  const text = value.trim().replace(/\s+/g, " ").slice(0, 12);
  return text || "P";
}

exports.getStudentCustomization = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Student authentication is required.",
        );
      }

      const uid = request.auth.uid;
      const db = getFirestore();
      const accountSnapshot = await db.doc(`studentAccounts/${uid}`).get();
      const account = accountSnapshot.exists ? accountSnapshot.data() : null;
      const classId = typeof account?.classId === "string" ? account.classId : "";
      const studentId = typeof account?.studentId === "string" ? account.studentId : "";

      if (!account || account.uid !== uid || account.active !== true ||
          !classId || !studentId) {
        throw new HttpsError(
            "permission-denied",
            "Student session is not active.",
        );
      }

      const [classSnapshot, studentSnapshot] = await Promise.all([
        db.doc(`classes/${classId}`).get(),
        db.doc(`classes/${classId}/students/${studentId}`).get(),
      ]);
      const student = studentSnapshot.exists ? studentSnapshot.data() : null;

      if (!classSnapshot.exists || !student || student.id !== studentId ||
          student.active === false) {
        throw new HttpsError(
            "permission-denied",
            "Student session is not active.",
        );
      }

      return {
        ok: true,
        pointName: safePointName(classSnapshot.data()?.pointName),
      };
    },
);
