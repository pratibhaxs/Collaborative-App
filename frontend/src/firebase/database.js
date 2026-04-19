import { ref, set, remove, onValue, off } from "firebase/database";
import { db } from "./config";

// ── Active Users ──────────────────────────────────────────

export const addUserToDatabase = async (uid, name, email) => {
  await set(ref(db, `users/${uid}`), {
    name, email, uid, createdAt: Date.now(),
  });
};

export const addActiveUser = async (uid, name, email) => {
  await set(ref(db, `activeUsers/${uid}`), {
    name, email, uid, loginAt: Date.now(),
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

// ── Text Sync ─────────────────────────────────────────────

export const updateDocText = async (docId, text) => {
  await set(ref(db, `docs/${docId}/text`), text);
};

export const listenDocText = (docId, callback) => {
  const docRef = ref(db, `docs/${docId}/text`);
  onValue(docRef, (snapshot) => {
    callback(snapshot.val() || "");
  });
  return () => off(docRef);
};

// ── Cursor Tracking ───────────────────────────────────────

export const updateCursor = async (docId, uid, cursorData) => {
  await set(ref(db, `docs/${docId}/cursors/${uid}`), cursorData);
};

export const removeCursor = async (docId, uid) => {
  await remove(ref(db, `docs/${docId}/cursors/${uid}`));
};

export const listenCursors = (docId, callback) => {
  const cursorRef = ref(db, `docs/${docId}/cursors`);
  onValue(cursorRef, (snapshot) => {
    const data    = snapshot.val();
    const cursors = data ? Object.values(data) : [];
    callback(cursors);
  });
  return () => off(cursorRef);
};

// ── Typing Indicator ──────────────────────────────────────

export const setTypingStatus = async (docId, uid, name, isTyping) => {
  if (isTyping) {
    await set(ref(db, `docs/${docId}/typing/${uid}`), { name, uid });
  } else {
    await remove(ref(db, `docs/${docId}/typing/${uid}`));
  }
};

export const listenTyping = (docId, callback) => {
  const typingRef = ref(db, `docs/${docId}/typing`);
  onValue(typingRef, (snapshot) => {
    const data   = snapshot.val();
    const typing = data ? Object.values(data) : [];
    callback(typing);
  });
  return () => off(typingRef);
};