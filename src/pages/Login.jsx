import React, { useState } from "react";
import PropTypes from "prop-types";
import { Lock, User, Eye, EyeOff } from "lucide-react";

/**
 * Login
 * - Uses <form onSubmit> with proper button type="submit"
 * - Better a11y (labels, aria-invalid, aria-live, focus rings)
 * - Auto-complete hints for browsers & password managers
 * - Show/Hide password toggle is keyboard-accessible
 * - Basic validation + loading state
 * - NOTE: Do NOT ship hardcoded credentials in production; this is demo-only.
 */
export default function Login({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!credentials.username.trim()) return "Username is required";
    if (!credentials.password) return "Password is required";
    if (credentials.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setIsLoading(true);

    // Simulated async login (replace with real API call)
    setTimeout(() => {
      const isDemoMatch =
        credentials.username === "admin" && credentials.password === "ema@11420";

      if (isDemoMatch) {
        // Demo-only. Prefer a real token from your backend and use httpOnly cookies.
        sessionStorage.setItem("ema_admin_authenticated", "true");
        sessionStorage.setItem("ema_admin_login_time", String(Date.now()));
        onLoginSuccess?.();
      } else {
        setError("Invalid username or password");
      }
      setIsLoading(false);
    }, 500);
  };

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-[70vh] flex items-start sm:items-center justify-center px-4 pt-8 pb-16 bg-white">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="mx-auto h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Login</h1>
        </div>

        {/* Card */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={credentials.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter username"
                    aria-invalid={Boolean(error) && !credentials.username ? "true" : "false"}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter password"
                    aria-invalid={Boolean(error) && !credentials.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3" role="alert" aria-live="polite">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLoginSuccess: PropTypes.func,
};
