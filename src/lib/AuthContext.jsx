import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check existing password-based auth
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser({ name: "Password User" });
        }
      })
      .catch(() => {});

    // Check OIDC session
    if (status === "authenticated") {
      setIsAuthenticated(true);
      setUser(session.user);
    } else if (status === "unauthenticated" && !isAuthenticated) {
      setIsAuthenticated(false);
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isAuthenticated]);

  const login = async (password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      setIsAuthenticated(true);
      setUser({ name: "Password User" });
    } else {
      throw new Error("Invalid password");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    await signOut({ redirect: false });
    setIsAuthenticated(false);
    setUser(null);
  };

  const oidcLogin = () => {
    signIn("keycloak");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        oidcLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}