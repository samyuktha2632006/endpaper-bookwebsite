import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Signup = () => {
  const { signup, googleLogin } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

  // Normal signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await signup(
        form.name,
        form.email,
        form.password
      );

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't create your account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Google signup/login
  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setGoogleSubmitting(true);

    try {
      await googleLogin(
        credentialResponse.credential
      );

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google sign up failed. Please try again."
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign up failed. Please try again.");
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-visual">

          <p className="auth-visual-lead">
            Join our community of book lovers
          </p>

          <p className="auth-visual-list">
            Discover amazing books
            <br />
            Build your personal library
            <br />
            Track your reading progress
          </p>

        </div>

        <div className="auth-form-side">

          <h1>Create Account</h1>

          <p className="auth-sub">
            Start your reading journey today
          </p>

          {error && (
            <p className="state-banner error">
              {error}
            </p>
          )}

          {/* Normal Signup */}
          <form onSubmit={handleSubmit}>

            <div className="auth-field">
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

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
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </div>

            <button
              className="btn btn-primary auth-submit"
              type="submit"
              disabled={submitting || googleSubmitting}
            >
              {submitting
                ? "Creating account…"
                : "Sign Up"}
            </button>

          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google */}
          <div className="google-login">

            {googleSubmitting ? (
              <p>Creating your account…</p>
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
            Already have an account?{" "}
            <Link to="/login">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Signup;