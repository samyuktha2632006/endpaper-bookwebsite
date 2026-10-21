import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">📖</span>
          Endpaper
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/categories">Categories</Link>
         {user && user.role !== "admin" && (
  <Link to="/library">My Library</Link>
)}
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-ghost-dark" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost-dark">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-accent">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
