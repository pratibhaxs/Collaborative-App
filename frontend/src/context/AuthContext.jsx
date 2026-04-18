import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { removeActiveUser } from "../firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged respects browserSessionPersistence
    // so new tabs will have no session — user will be null
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // remove from activeUsers if tab is closed
    const handleUnload = () => {
      if (auth.currentUser) {
        removeActiveUser(auth.currentUser.uid);
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      unsub();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);