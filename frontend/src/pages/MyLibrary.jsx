import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import "./MyLibrary.css";

const MyLibrary = () => {
  const [likedBooks, setLikedBooks] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD USER LIBRARY
  // ==========================================
  const loadLibrary = async () => {
    try {
      setLoading(true);

      const res = await api.get("/user-books/library");

      setLikedBooks(res.data.likedBooks || []);
      setHistory(res.data.history || []);

    } catch (error) {
      console.error(
        "Library loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOAD WHEN PAGE OPENS
  // ==========================================
  useEffect(() => {
    loadLibrary();
  }, []);


  // ==========================================
  // 🗑️ CLEAR ALL HISTORY
  // ==========================================
  const clearHistory = async () => {

    const confirmed = window.confirm(
      "Are you sure you want to clear your entire reading history?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        "/user-books/history"
      );

      // Remove history from UI
      setHistory([]);

    } catch (error) {

      console.error(
        "Clear history error:",
        error
      );

      alert(
        "Could not clear reading history."
      );
    }
  };


  // ==========================================
  // 🗑️ DELETE ONE HISTORY BOOK
  // ==========================================
  const deleteHistoryBook = async (
    bookId
  ) => {

    const confirmed = window.confirm(
      "Remove this book from your reading history?"
    );

    if (!confirmed) {
      return;
    }

    try {

      await api.delete(
        `/user-books/history/${bookId}`
      );


      // Remove only this book
      setHistory((currentHistory) =>
        currentHistory.filter(
          (item) =>
            item.book._id !== bookId
        )
      );

    } catch (error) {

      console.error(
        "Delete history error:",
        error
      );

      alert(
        "Could not remove this book."
      );
    }
  };


  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="container library-page">

        <div className="library-loading">
          Loading your library...
        </div>

      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================
  return (
    <div className="container library-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="library-header">

        <h1>
          My Library
        </h1>

        <p>
          Your books, likes and reading history.
        </p>

      </div>


      {/* =====================================
          ❤️ LIKED BOOKS
      ====================================== */}

      <section className="library-section">

        <div className="section-heading">

          <div>
            <h2>
              ❤️ Liked Books
            </h2>
          </div>

        </div>


        {likedBooks.length === 0 ? (

          <div className="library-empty">

            <p>
              You haven't liked any books yet.
            </p>

            <Link
              to="/explore"
              className="btn btn-primary"
            >
              Explore Books
            </Link>

          </div>

        ) : (

          <div className="library-grid">

            {likedBooks.map((book) => (

              <Link
                to={`/books/${book._id}`}
                className="library-book"
                key={book._id}
              >

                {book.coverImage ? (

                  <img
                    src={book.coverImage}
                    alt={book.title}
                  />

                ) : (

                  <div className="library-cover-placeholder">
                    📖
                  </div>

                )}


                <h3>
                  {book.title}
                </h3>


                <p>
                  {book.author}
                </p>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* =====================================
          📖 READING HISTORY
      ====================================== */}

      <section className="library-section">

        <div className="section-heading">

          <div>

            <h2>
              📖 Reading History
            </h2>

            <p>
              Books you have opened recently.
            </p>

          </div>


          {/* CLEAR HISTORY */}

          {history.length > 0 && (

            <button
              className="clear-history"
              onClick={clearHistory}
            >
              Clear History
            </button>

          )}

        </div>


        {/* EMPTY HISTORY */}

        {history.length === 0 ? (

          <div className="library-empty">

            <p>
              Your reading history is empty.
            </p>

            <Link
              to="/explore"
              className="btn btn-primary"
            >
              Start Reading
            </Link>

          </div>

        ) : (

          <div className="library-grid">

            {history.map((item) => {

              const book = item.book;

              return (

                <div
                  className="history-book"
                  key={book._id}
                >

                  {/* BOOK */}

                  <Link
                    to={`/books/${book._id}`}
                    className="library-book"
                  >

                    {book.coverImage ? (

                      <img
                        src={book.coverImage}
                        alt={book.title}
                      />

                    ) : (

                      <div className="library-cover-placeholder">
                        📖
                      </div>

                    )}


                    <h3>
                      {book.title}
                    </h3>


                    <p>
                      {book.author}
                    </p>

                  </Link>


                  {/* LAST READ */}

                  <div className="history-bottom">

                    <span className="last-read">

                      Last read:{" "}

                      {new Date(
                        item.lastReadAt
                      ).toLocaleDateString()}

                    </span>


                    {/* DELETE ONE */}

                    <button
                      className="delete-history"
                      onClick={() =>
                        deleteHistoryBook(
                          book._id
                        )
                      }
                    >
                      🗑 Remove
                    </button>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </div>
  );
};

export default MyLibrary;