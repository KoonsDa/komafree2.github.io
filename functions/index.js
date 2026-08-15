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

function studentLoginFailed() {
  return new HttpsError(
      "invalid-argument",
      "Student login could not be verified.",
  );
}

async function getVerifiedStudentContext(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Student authentication is required.");
  }
  const uid = request.auth.uid;
  const db = getFirestore();
  const accountSnapshot = await db.doc(`studentAccounts/${uid}`).get();
  const account = accountSnapshot.exists ? accountSnapshot.data() : null;
  const classId = typeof account?.classId === "string" ? account.classId : "";
  const studentId = typeof account?.studentId === "string" ?
    account.studentId : "";
  if (!account || account.uid !== uid || account.active !== true ||
      !classId || !studentId) {
    throw new HttpsError("permission-denied", "Student session is not active.");
  }

  const [classSnapshot, studentSnapshot] = await Promise.all([
    db.doc(`classes/${classId}`).get(),
    db.doc(`classes/${classId}/students/${studentId}`).get(),
  ]);
  const student = studentSnapshot.exists ? studentSnapshot.data() : null;
  if (!classSnapshot.exists || !student || student.id !== studentId ||
      student.active === false) {
    throw new HttpsError("permission-denied", "Student session is not active.");
  }
  return {
    uid,
    classId,
    studentId,
    account,
    classData: classSnapshot.data(),
    student,
  };
}

function seoulDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

exports.resolveStudentLogin = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      const classId = requiredInputString(request.data?.classId, "classId");
      const loginId = requiredInputString(request.data?.loginId, "loginId");
      const loginIdNormalized = loginId.toLocaleLowerCase("en-US");
      const db = getFirestore();
      const loginIndexSnapshot = await db.doc(
          `studentLoginIndex/${studentLoginKey(classId, loginIdNormalized)}`,
      ).get();
      if (!loginIndexSnapshot.exists) throw studentLoginFailed();

      const loginIndex = loginIndexSnapshot.data();
      const uid = typeof loginIndex?.uid === "string" ? loginIndex.uid : "";
      const studentId = typeof loginIndex?.studentId === "string" ?
        loginIndex.studentId : "";
      const internalEmail = typeof loginIndex?.internalEmail === "string" ?
        loginIndex.internalEmail : "";
      if (loginIndex?.classId !== classId ||
          loginIndex?.loginIdNormalized !== loginIdNormalized ||
          loginIndex?.active !== true || !uid || !studentId || !internalEmail) {
        throw studentLoginFailed();
      }

      const [accountSnapshot, studentSnapshot] = await Promise.all([
        db.doc(`studentAccounts/${uid}`).get(),
        db.doc(`classes/${classId}/students/${studentId}`).get(),
      ]);
      const account = accountSnapshot.exists ? accountSnapshot.data() : null;
      const student = studentSnapshot.exists ? studentSnapshot.data() : null;
      const currentLoginIdNormalized = typeof student?.loginId === "string" ?
        student.loginId.trim().toLocaleLowerCase("en-US") : "";
      if (!account || account.uid !== uid || account.classId !== classId ||
          account.studentId !== studentId || account.active !== true ||
          !student || student.id !== studentId || student.active === false ||
          currentLoginIdNormalized !== loginIdNormalized) {
        throw studentLoginFailed();
      }

      return {ok: true, internalEmail};
    },
);

exports.getStudentSession = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      const {classId, studentId, classData, student} =
        await getVerifiedStudentContext(request);

      return {
        ok: true,
        student: {
          classId,
          studentId,
          name: typeof student.name === "string" ? student.name : "",
          number: Number(student.number) || 0,
          loginId: typeof student.loginId === "string" ? student.loginId : "",
        },
        className: typeof classData?.className === "string" ?
          classData.className : "",
      };
    },
);

exports.getStudentHomeData = onCall(
    {region: "asia-northeast3"},
    async (request) => {
      const {classId, studentId, classData, student} =
        await getVerifiedStudentContext(request);
      const db = getFirestore();
      const today = seoulDateKey();
      const classRef = db.doc(`classes/${classId}`);
      const [pointSnapshot, assignmentsSnapshot, statesSnapshot,
        roleSettingsSnapshot, roleUsageSnapshot, roleApplicationsSnapshot] =
        await Promise.all([
          classRef.collection("studentPointStates").doc(studentId).get(),
          classRef.collection("assignments").get(),
          classRef.collection("assignmentStudentStates")
              .where("studentId", "==", studentId).get(),
          classRef.collection("roleSettings").doc("current").get(),
          classRef.collection("roleDailyUsage").doc(today).get(),
          classRef.collection("dailyRoleAssignments")
              .where("studentId", "==", studentId).get(),
        ]);

      const statusByAssignmentId = new Map();
      statesSnapshot.forEach((snapshot) => {
        const value = snapshot.data();
        if (value?.studentId !== studentId ||
            typeof value.assignmentId !== "string") return;
        const status = ["missing", "review", "submitted"].includes(value.status) ?
          value.status : "missing";
        statusByAssignmentId.set(value.assignmentId, status);
      });
      const assignments = assignmentsSnapshot.docs.map((snapshot) => {
        const value = snapshot.data();
        const id = snapshot.id;
        return {
          id,
          title: typeof value?.title === "string" ? value.title : "",
          subject: typeof value?.subject === "string" ? value.subject : "",
          description: typeof value?.description === "string" ?
            value.description : "",
          dueDate: typeof value?.dueDate === "string" ? value.dueDate : "",
          points: Number(value?.points) || 0,
          important: value?.important === true,
          assignmentState: value?.assignmentState === "completed" ?
            "completed" : "active",
          status: statusByAssignmentId.get(id) || "missing",
          deleted: value?.deleted === true,
        };
      }).filter((assignment) =>
        !assignment.deleted && assignment.assignmentState === "active",
      ).map(({deleted, ...assignment}) => assignment);

      const roleSettings = roleSettingsSnapshot.exists ?
        roleSettingsSnapshot.data() : {};
      const usage = roleUsageSnapshot.exists ? roleUsageSnapshot.data() : {};
      const roleCounts = usage?.roleCounts &&
        typeof usage.roleCounts === "object" &&
        !Array.isArray(usage.roleCounts) ? usage.roleCounts : {};
      const roles = (Array.isArray(roleSettings?.currentRoles) ?
        roleSettings.currentRoles : []).map((role) => ({
        id: typeof role?.id === "string" ? role.id : "",
        name: typeof role?.name === "string" ? role.name : "",
        points: Number(role?.points) || 0,
        capacity: Math.max(1, Number(role?.capacity) || 1),
        description: typeof role?.description === "string" ?
          role.description : "",
        currentCount: Math.max(0, Number(roleCounts[role?.id]) || 0),
      })).filter((role) => role.id && role.name);
      const myRoleApplications = roleApplicationsSnapshot.docs.map((snapshot) => {
        const value = snapshot.data();
        return {
          id: snapshot.id,
          roleId: typeof value?.roleId === "string" ? value.roleId : "",
          status: ["waiting", "completed", "cancelled"].includes(value?.status) ?
            value.status : "waiting",
          date: typeof value?.date === "string" ? value.date : "",
        };
      }).filter((application) => application.date === today && application.roleId);
      const rawLimit = Number(roleSettings?.dailyRoleApplicationLimit);
      const dailyLimit = Number.isInteger(rawLimit) && rawLimit >= 1 &&
        rawLimit <= 5 ? rawLimit : 1;
      const pointValue = Number(pointSnapshot.data()?.points);
      const featureSource = classData?.features &&
        typeof classData.features === "object" &&
        !Array.isArray(classData.features) ? classData.features : {};

      return {
        ok: true,
        profile: {
          studentId,
          name: typeof student.name === "string" ? student.name : "",
          number: Number(student.number) || 0,
          loginId: typeof student.loginId === "string" ? student.loginId : "",
        },
        classInfo: {
          className: typeof classData?.className === "string" ?
            classData.className : "",
          appName: typeof classData?.appName === "string" ?
            classData.appName : "",
          features: {
            assignments: featureSource.assignments !== false,
            roles: featureSource.roles !== false,
            points: featureSource.points !== false,
          },
        },
        points: Number.isFinite(pointValue) ? pointValue : 0,
        assignments,
        roleSettings: {dailyLimit, roles},
        myRoleApplications,
      };
    },
);
