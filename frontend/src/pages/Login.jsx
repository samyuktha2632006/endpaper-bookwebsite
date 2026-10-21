import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const { login, googleLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message;
  const redirectTo = location.state?.from || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      navigate(redirectTo);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't log you in. Check your email and password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setGoogleSubmitting(true);

    try {
      await googleLogin(credentialResponse.credential);
      navigate(redirectTo);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google login failed. Please try again."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-visual">
          <p className="auth-visual-quote">
            "A good book is a friend that never lets you down."
          </p>
        </div>

        <div className="auth-form-side">

          <h1>Welcome Back!</h1>

          <p className="auth-sub">
            Sign in to continue your reading journey
          </p>

          {redirectMessage && !error && (
            <p className="state-banner">
              {redirectMessage}
            </p>
          )}

          {error && (
            <p className="state-banner error">
              {error}
            </p>
          )}

          {/* Normal Login */}
          <form onSubmit={handleSubmit}>

            <div className="auth-field">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <button
              className="btn btn-primary auth-submit"
              type="submit"
              disabled={submitting || googleSubmitting}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>

          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google Login */}
          <div className="google-login">
            {googleSubmitting ? (
              <p>Signing in with Google…</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="300"
              />
            )}
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/signup">
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;