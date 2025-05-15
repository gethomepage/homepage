import { signIn } from "next-auth/react";
import { useState } from "react";

// Check ENABLE_SSO environment variable (defaults to false if not set)
const isSSOEnabled = process.env.ENABLE_SSO === "true";

export default function LoginForm() {
  const [password, setPassword] = useState("");

  // Password-based login (optional)
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        window.location.href = "/";
      } else {
        alert("Invalid password");
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  // OIDC login
  const handleOidcLogin = () => {
    signIn("keycloak");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-50 dark:bg-theme-800">
      <div className="w-full max-w-md rounded-lg bg-theme-100 dark:bg-theme-900 p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-theme-800 dark:text-theme-200">Login to Homepage</h2>
        {/* Password form (always shown as fallback) */}
        <form onSubmit={handlePasswordLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mb-4 w-full rounded border border-theme-300 dark:border-theme-600 p-2 bg-theme-50 dark:bg-theme-800 text-theme-800 dark:text-theme-200"
          />
          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Login with Password
          </button>
        </form>
        {/* OIDC button (shown only if ENABLE_SSO is true) */}
        {isSSOEnabled && (
          <button
            onClick={handleOidcLogin}
            className="mt-4 w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Sign in with Keycloak
          </button>
        )}
      </div>
    </div>
  );
}