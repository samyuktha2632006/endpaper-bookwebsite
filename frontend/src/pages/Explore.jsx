import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import BookCard from "../components/BookCard";
import "./Explore.css";

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category") || "";

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);

  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= CATEGORIES =================

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // ================= LOAD BOOKS =================

  useEffect(() => {
    setLoading(true);
    setError("");

    const params = {
      page: searchParams.get("page") || 1,

      // Show 14 books per page
      limit: 14,
    };

    if (category) {
      params.category = category;
    }

    if (searchParams.get("search")) {
      params.search = searchParams.get("search");
    }

    api
      .get("/books/explore", { params })
      .then((res) => {
        setBooks(res.data.books);

        setPageInfo({
          page: res.data.page,
          pages: res.data.pages,
          total: res.data.total,
        });
      })
      .catch(() => {
        setError("Couldn't load books right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, category]);

  // ================= UPDATE URL PARAMETERS =================

  const updateParams = (next) => {
    const params = Object.fromEntries(searchParams.entries());

    Object.assign(params, next);

    if (!params.category) {
      delete params.category;
    }

    if (!params.search) {
      delete params.search;
    }

    setSearchParams(params);
  };

  // ================= CATEGORY CHANGE =================

  const handleCategoryChange = (e) => {
    updateParams({
      category: e.target.value,
      page: 1,
    });
  };

  // ================= SEARCH =================

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    updateParams({
      search: searchInput,
      page: 1,
    });
  };

  // ================= PAGINATION =================

  const goToPage = (p) => {
    updateParams({
      page: p,
    });
  };

  // ================= UI =================

  return (
    <div className="container explore-page">

      {/* ================= HEADER ================= */}

      <div className="explore-head">
        <h1>Explore Books</h1>

        <p className="explore-sub">
          Discover your next favorite book
        </p>
      </div>


      {/* ================= SEARCH + CATEGORY ================= */}

      <div className="explore-controls">

        {/* Category Dropdown */}

        <select
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">
            All Categories
          </option>

          {categories.map((c) => (
            <option
              key={c._id}
              value={c.slug}
            >
              {c.name}
            </option>
          ))}
        </select>


        {/* Search */}

        <form
          className="explore-search"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="search"
            placeholder="Search title, author…"
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>
        </form>

      </div>


      {/* ================= RESULTS ================= */}

      <div className="explore-results">

        {/* Error */}

        {error && (
          <p className="state-banner error">
            {error}
          </p>
        )}


        {/* No Books */}

        {!loading &&
          !error &&
          books.length === 0 && (
            <p className="empty-note">
              No books match that yet — try another
              category or search.
            </p>
          )}


        {/* ================= BOOK GRID ================= */}

        <div className="book-grid">

          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
            />
          ))}

        </div>


        {/* ================= PAGINATION ================= */}

        {pageInfo.pages > 1 && (

          <div className="pagination">

            {/* Previous */}

            <button
              className="pagination-arrow"
              disabled={pageInfo.page <= 1}
              onClick={() =>
                goToPage(pageInfo.page - 1)
              }
            >
              ‹
            </button>


            {/* Page Numbers */}

            {Array.from(
              {
                length: pageInfo.pages,
              },
              (_, i) => i + 1
            ).map((p) => (

              <button
                key={p}
                className={`pagination-dot ${
                  p === pageInfo.page
                    ? "pagination-dot-active"
                    : ""
                }`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>

            ))}


            {/* Next */}

            <button
              className="pagination-arrow"
              disabled={
                pageInfo.page >= pageInfo.pages
              }
              onClick={() =>
                goToPage(pageInfo.page + 1)
              }
            >
              ›
            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default Explore;