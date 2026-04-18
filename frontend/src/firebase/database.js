import { ref, set, remove, onValue, off } from "firebase/database";
import { db } from "./config";

export const addUserToDatabase = async (uid, name, email) => {
  await set(ref(db, `users/${uid}`), {
    name,
    email,
    uid,
    createdAt: Date.now(),
  });
};

export const addActiveUser = async (uid, name, email) => {
  await set(ref(db, `activeUsers/${uid}`), {
    name,
    email,
    uid,
    loginAt: Date.now(),
  });
};

export const removeActiveUser = async (uid) => {
  await remove(ref(db, `activeUsers/${uid}`));
};

export const listenActiveUsers = (callback) => {
  const activeRef = ref(db, "activeUsers");
  onValue(activeRef, (snapshot) => {
    const data  = snapshot.val();
    const users = data ? Object.values(data) : [];
    callback(users);
  });
  return () => off(activeRef);
};