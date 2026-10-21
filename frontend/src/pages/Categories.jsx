import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/client";
import BookCard from "../components/BookCard";
import "./Categories.css";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("category") || "";

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
        if (!activeSlug && res.data.length > 0) {
          setSearchParams({ category: res.data[0].slug });
        }
      })
      .catch(() => setError("Couldn't load categories right now."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    setBooksLoading(true);
    api
      .get("/books/explore", { params: { category: activeSlug, limit: 10 } })
      .then((res) => setBooks(res.data.books))
      .catch(() => {})
      .finally(() => setBooksLoading(false));
  }, [activeSlug]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <div className="categories-page">
      <aside className="categories-sidebar">
        <p className="categories-sidebar-title">All Categories</p>
        <Link to="/explore" className="categories-sidebar-item">
          All Books
        </Link>
        {categories.map((c) => (
          <button
            key={c._id}
            className={`categories-sidebar-item ${c.slug === activeSlug ? "categories-sidebar-item-active" : ""}`}
            onClick={() => setSearchParams({ category: c.slug })}
          >
            {c.name}
          </button>
        ))}
      </aside>

      <div className="categories-content">
        {error && <p className="state-banner error">{error}</p>}
        {!loading && categories.length === 0 && (
          <p className="empty-note">No categories yet — an admin can add some from the dashboard.</p>
        )}

        {activeCategory && (
          <>
            <h1 className="categories-active-name">{activeCategory.name}</h1>
            <p className="categories-active-count">{activeCategory.bookCount} books</p>

            <div className="categories-banner">
              <span>Every shelf tells a different story.</span>
            </div>

            {!booksLoading && books.length === 0 && (
              <p className="empty-note">No books in this category yet.</p>
            )}
            <div className="book-grid">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
