import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "./config";
import { addUserToDatabase, addActiveUser, removeActiveUser } from "./database";

// Sign up
export const signup = async (name, email, password) => {
  // set session persistence before signup
  await setPersistence(auth, browserSessionPersistence);

  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await addUserToDatabase(result.user.uid, name, email);
  await addActiveUser(result.user.uid, name, email);
  return result.user;
};

// Login
export const login = async (email, password) => {
  // set session persistence before login
  // this ensures session is tab-specific only
  await setPersistence(auth, browserSessionPersistence);

  const result = await signInWithEmailAndPassword(auth, email, password);
  await addActiveUser(
    result.user.uid,
    result.user.displayName,
    result.user.email
  );
  return result.user;
};

// Logout
export const logout = async (uid) => {
  await removeActiveUser(uid);
  await signOut(auth);
};