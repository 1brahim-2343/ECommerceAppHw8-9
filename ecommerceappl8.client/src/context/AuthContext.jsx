import { createContext, useContext, useEffect, useState } from "react";

import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    const userData = localStorage.getItem("user");

    if (accessToken && userData) {
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest({
      email,
      password,
    });

    localStorage.setItem("accessToken", data.accessToken);

    localStorage.setItem("refreshToken", data.refreshToken);

    const userData = {
      userId: data.userId,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return data;
  };

  const register = async (firstName, lastName, email, password) => {
    return await registerRequest({
      firstName,
      lastName,
      email,
      password,
    });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
