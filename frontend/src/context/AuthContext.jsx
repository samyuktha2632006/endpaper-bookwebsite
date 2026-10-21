import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CHECK CURRENT LOGIN
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        // Remove token only when JWT is actually invalid
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ==========================================
  // NORMAL LOGIN
  // ==========================================

  const login = async (email, password) => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);

    setUser(res.data.user);

    return res.data.user;
  };

  // ==========================================
  // SIGNUP
  // ==========================================

  const signup = async (name, email, password) => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);

    setUser(res.data.user);

    return res.data.user;
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  const googleLogin = async (credential) => {
    if (!credential) {
      throw new Error("Google credential is missing");
    }

    const res = await api.post("/auth/google", {
      credential,
    });

    localStorage.setItem("token", res.data.token);

    setUser(res.data.user);

    return res.data.user;
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
  return useContext(AuthContext);
};