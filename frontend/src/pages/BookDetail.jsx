import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { gradientFor } from "../components/BookCard";
import "./BookDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [readLoading, setReadLoading] = useState(false);
  const [error, setError] = useState("");

  // Load book details
  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError("");

        const bookRes = await api.get(`/books/${id}`);
        setBook(bookRes.data);

        // Only check like status if user is logged in
        if (user) {
          try {
            const statusRes = await api.get(`/user-books/status/${id}`);
            setLiked(statusRes.data.liked);
          } catch (statusError) {
            console.error("Status error:", statusError);
            setLiked(false);
          }
        } else {
          setLiked(false);
        }
      } catch (err) {
        console.error("Book loading error:", err);
        setError("This book couldn't be found.");
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id, user]);

  // Like / Unlike
  const handleLike = async () => {
    if (!user || likeLoading) return;

    try {
      setLikeLoading(true);

      const res = await api.post(`/user-books/like/${id}`);

      setLiked(res.data.liked);
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Read Now
  const handleRead = async () => {
    if (!user) {
      // If user is not logged in, send them to login
      navigate("/login");
      return;
    }

    if (readLoading) return;

    try {
      setReadLoading(true);

      // Mark this book as read/history
      const res = await api.post(`/user-books/history/${id}`);

      // Update the displayed views immediately
      if (res.data?.views !== undefined) {
        setBook((prev) => ({
          ...prev,
          views: res.data.views,
        }));
      }

      // Only navigate after the API request succeeds
      navigate(`/books/${book._id}/read`);
    } catch (error) {
      console.error("Read history error:", error);

      // Still allow the user to open the book
      navigate(`/books/${book._id}/read`);
    } finally {
      setReadLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="container detail-loading">
        Opening cover…
      </div>
    );
  }

  // Error
  if (error || !book) {
    return (
      <div className="container detail-loading">
        <p className="state-banner error">
          {error || "Book not found."}
        </p>

        <Link
          to="/explore"
          className="btn btn-ghost"
          style={{ marginTop: 16 }}
        >
          ← Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="container book-detail">
      {/* Back */}
      <Link to="/explore" className="back-link">
        ← Back to Explore
      </Link>

      <div className="detail-grid">

        {/* ================= COVER ================= */}
        <div className="detail-cover-col">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="detail-cover"
            />
          ) : (
            <div
              className="detail-cover detail-cover-placeholder"
              style={{
                background: gradientFor(book.title || book._id),
              }}
            />
          )}

          {/* ================= READ BUTTON ================= */}
          {book.bookFile ? (
            <button
              type="button"
              onClick={handleRead}
              className="btn btn-primary detail-read-btn"
              disabled={readLoading}
            >
              {readLoading ? "Opening…" : "📖 Read Now"}
            </button>
          ) : (
            <button
              className="btn btn-ghost detail-read-btn"
              disabled
            >
              No file uploaded yet
            </button>
          )}
        </div>

        {/* ================= BOOK INFO ================= */}
        <div className="detail-info">

          {/* Category */}
          {book.category?.name && (
            <span className="detail-badge">
              {book.category.name.toUpperCase()}
            </span>
          )}

          {/* Title */}
          <h1>{book.title}</h1>

          {/* Author */}
          <p className="detail-author">
            by {book.author}
          </p>

          {/* ================= STATS ================= */}
          <div className="detail-stats">
            <span>
              📖 {book.views ?? 0} reads
            </span>
          </div>

          {/* ================= LIKE ================= */}
          {user && (
            <button
              type="button"
              className={`like-button ${liked ? "liked" : ""}`}
              onClick={handleLike}
              disabled={likeLoading}
            >
              {likeLoading
                ? "..."
                : liked
                ? "❤️ Liked"
                : "♡ Like"}
            </button>
          )}

          {/* Description */}
          {book.description && (
            <p className="detail-description">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;