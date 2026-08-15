const {createHash} = require("node:crypto");
const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

initializeApp();
setGlobalOptions({maxInstances: 10});

const STUDENT_EMAIL_DOMAIN = "students.our-class-quest.invalid";

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function studentAuthUid(classId, studentId) {
  return `stu_${sha256(`${classId}:${studentId}`).slice(0, 48)}`;
}

function studentLoginKey(classId, loginIdNormalized) {
  return sha256(`${classId}:${loginIdNormalized}`);
}

function requiredInputString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${fieldName} is required.`);
  }
  return value.trim();
}

function isAuthUserNotFound(error) {
  return error?.code === "auth/user-not-found";
}

function isAuthUserAlreadyExists(error) {
  return error?.code === "auth/uid-already-exists" ||
    error?.code === "auth/email-already-exists";
}

async function authUserByUid(auth, uid) {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    if (isAuthUserNotFound(error)) return null;
    throw error;
  }
}

function assertMatchingMapping(value, expected, label) {
  if (!value) return;
  if (value.uid !== expected.uid ||
      value.classId !== expected.classId ||
      value.studentId !== expected.studentId) {
    throw new HttpsError(
        "already-exists",
        `${label} is already connected to another student.`,
    );
  }
  if (value.loginIdNormalized !== expected.loginIdNormalized ||
      value.internalEmail !== expected.internalEmail) {
    throw new HttpsError(
        "failed-precondition",
        `${label} does not match the current student login ID.`,
    );
  }
}

exports.createStudentAccount = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Teacher authentication is required.",
        );
      }

      const classId = requiredInputString(request.data?.classId, "classId");
      const studentId = requiredInputString(
          request.data?.studentId,
          "studentId",
      );
      const password = request.data?.password;
      if (typeof password !== "string" || password.length < 6) {
        throw new HttpsError(
            "invalid-argument",
            "Password must be at least 6 characters.",
        );
      }

      const db = getFirestore();
      const auth = getAuth();
      const classRef = db.doc(`classes/${classId}`);
      const classSnapshot = await classRef.get();
      if (!classSnapshot.exists ||
          classSnapshot.data()?.ownerUid !== request.auth.uid) {
        throw new HttpsError(
            "permission-denied",
            "Only the class owner can create student accounts.",
        );
      }

      const studentRef = classRef.collection("students").doc(studentId);
      const studentSnapshot = await studentRef.get();
      if (!studentSnapshot.exists) {
        throw new HttpsError("not-found", "Student was not found.");
      }

      const student = studentSnapshot.data();
      const loginId = typeof student?.loginId === "string" ?
        student.loginId : "";
      const loginIdNormalized = loginId.trim().toLocaleLowerCase("en-US");
      const name = typeof student?.name === "string" ?
        student.name.trim() : "";
      if (student?.id !== studentId || !loginIdNormalized || !name) {
        throw new HttpsError(
            "failed-precondition",
            "Student account information is invalid.",
        );
      }
      if (student.active === false) {
        throw new HttpsError(
            "failed-precondition",
            "Inactive students cannot receive an account.",
        );
      }

      const uid = studentAuthUid(classId, studentId);
      const internalEmail = `${uid}@${STUDENT_EMAIL_DOMAIN}`;
      const hashedLoginKey = studentLoginKey(classId, loginIdNormalized);
      const accountRef = db.doc(`studentAccounts/${uid}`);
      const loginIndexRef = db.doc(`studentLoginIndex/${hashedLoginKey}`);
      const expected = {
        uid,
        classId,
        studentId,
        loginIdNormalized,
        internalEmail,
      };

      const [accountSnapshot, loginIndexSnapshot] = await Promise.all([
        accountRef.get(),
        loginIndexRef.get(),
      ]);
      assertMatchingMapping(
          accountSnapshot.exists ? accountSnapshot.data() : null,
          expected,
          "Student account mapping",
      );
      assertMatchingMapping(
          loginIndexSnapshot.exists ? loginIndexSnapshot.data() : null,
          expected,
          "Student login ID",
      );

      let authUser = await authUserByUid(auth, uid);
      let created = false;
      if (authUser) {
        if (authUser.email !== internalEmail || authUser.disabled) {
          throw new HttpsError(
              "failed-precondition",
              "The existing student authentication account is not usable.",
          );
        }
      } else {
        try {
          authUser = await auth.createUser({
            uid,
            email: internalEmail,
            password,
            displayName: name,
            disabled: false,
          });
          created = true;
        } catch (error) {
          if (!isAuthUserAlreadyExists(error)) {
            throw new HttpsError(
                "internal",
                "Student authentication account could not be created.",
            );
          }
          authUser = await authUserByUid(auth, uid);
          if (!authUser || authUser.email !== internalEmail || authUser.disabled) {
            throw new HttpsError(
                "already-exists",
                "A conflicting authentication account already exists.",
            );
          }
        }
      }

      try {
        await db.runTransaction(async (transaction) => {
          const [currentAccount, currentLoginIndex] = await Promise.all([
            transaction.get(accountRef),
            transaction.get(loginIndexRef),
          ]);
          assertMatchingMapping(
              currentAccount.exists ? currentAccount.data() : null,
              expected,
              "Student account mapping",
          );
          assertMatchingMapping(
              currentLoginIndex.exists ? currentLoginIndex.data() : null,
              expected,
              "Student login ID",
          );

          const timestamp = FieldValue.serverTimestamp();
          transaction.set(accountRef, {
            uid,
            classId,
            studentId,
            loginId,
            loginIdNormalized,
            internalEmail,
            active: true,
            createdAt: currentAccount.exists &&
              currentAccount.data()?.createdAt ?
              currentAccount.data().createdAt : timestamp,
            updatedAt: timestamp,
          });
          transaction.set(loginIndexRef, {
            uid,
            classId,
            studentId,
            loginIdNormalized,
            internalEmail,
            active: true,
            createdAt: currentLoginIndex.exists &&
              currentLoginIndex.data()?.createdAt ?
              currentLoginIndex.data().createdAt : timestamp,
            updatedAt: timestamp,
          });
        });
      } catch (error) {
        if (error instanceof HttpsError) throw error;
        throw new HttpsError(
            "internal",
            "Student account mapping could not be saved.",
        );
      }

      return {
        ok: true,
        created,
        uid: authUser.uid,
        studentId,
        loginId,
      };
    },
);

exports.getStudentAccountStatuses = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Teacher authentication is required.",
        );
      }

      const classId = requiredInputString(request.data?.classId, "classId");
      const db = getFirestore();
      const classSnapshot = await db.doc(`classes/${classId}`).get();
      if (!classSnapshot.exists ||
          classSnapshot.data()?.ownerUid !== request.auth.uid) {
        throw new HttpsError(
            "permission-denied",
            "Only the class owner can view student account statuses.",
        );
      }

      const accountSnapshots = await db.collection("studentAccounts")
          .where("classId", "==", classId)
          .get();
      const accounts = {};
      accountSnapshots.forEach((snapshot) => {
        const value = snapshot.data();
        const studentId = typeof value?.studentId === "string" ?
          value.studentId : "";
        if (!studentId) return;
        accounts[studentId] = {
          exists: true,
          active: value.active === true,
          loginId: typeof value.loginId === "string" ? value.loginId : "",
        };
      });

      return {ok: true, accounts};
    },
);

exports.resetStudentPassword = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "Teacher authentication is required.",
        );
      }

      const classId = requiredInputString(request.data?.classId, "classId");
      const studentId = requiredInputString(
          request.data?.studentId,
          "studentId",
      );
      const password = request.data?.password;
      if (typeof password !== "string" || password.length < 6) {
        throw new HttpsError(
            "invalid-argument",
            "Password must be at least 6 characters.",
        );
      }

      const db = getFirestore();
      const classRef = db.doc(`classes/${classId}`);
      const classSnapshot = await classRef.get();
      if (!classSnapshot.exists ||
          classSnapshot.data()?.ownerUid !== request.auth.uid) {
        throw new HttpsError(
            "permission-denied",
            "Only the class owner can reset student passwords.",
        );
      }

      const studentSnapshot = await classRef.collection("students")
          .doc(studentId)
          .get();
      if (!studentSnapshot.exists) {
        throw new HttpsError("not-found", "Student was not found.");
      }
      const student = studentSnapshot.data();
      if (student?.id !== studentId) {
        throw new HttpsError(
            "failed-precondition",
            "Student account information is invalid.",
        );
      }
      if (student.active === false) {
        throw new HttpsError(
            "failed-precondition",
            "Inactive student passwords cannot be reset.",
        );
      }

      const uid = studentAuthUid(classId, studentId);
      const accountSnapshot = await db.doc(`studentAccounts/${uid}`).get();
      if (!accountSnapshot.exists) {
        throw new HttpsError("not-found", "Student account was not found.");
      }
      const account = accountSnapshot.data();
      if (account?.uid !== uid ||
          account?.classId !== classId ||
          account?.studentId !== studentId ||
          account?.active !== true) {
        throw new HttpsError(
            "failed-precondition",
            "Student account mapping is invalid or inactive.",
        );
      }

      try {
        await getAuth().updateUser(uid, {password});
      } catch (error) {
        if (isAuthUserNotFound(error)) {
          throw new HttpsError(
              "not-found",
              "Student authentication account was not found.",
          );
        }
        throw new HttpsError(
            "internal",
            "Student password could not be reset.",
        );
      }

      return {ok: true, studentId};
    },
);
