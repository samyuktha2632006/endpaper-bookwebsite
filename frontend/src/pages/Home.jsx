import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Compass,
  Bookmark,
  ArrowRight,
  Mail,
} from "lucide-react";

import api from "../api/client";
import BookCard from "../components/BookCard";
import "./Home.css";
import heroIllustration from "../assets/hero-illustration.svg";

const Home = () => {
  const [data, setData] = useState({
    featured: [],
    recent: [],
  });

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Load books
    api
      .get("/books/home")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Books error:", err);
        setError("Couldn't load the books right now.");
      })
      .finally(() => {
        setLoading(false);
      });

    // Load categories
    api
      .get("/categories")
      .then((res) => {
        console.log("Categories from API:", res.data);
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Categories error:", err);
        setCategories([]);
      });
  }, []);

  // Remove duplicate books and show only 6
  const popular = Array.from(
    new Map(
      [...(data.featured || []), ...(data.recent || [])].map((book) => [
        book._id,
        book,
      ])
    ).values()
  ).slice(0, 7);

  // Show first 5 categories returned by backend
  const displayedCategories = categories.slice(0, 5);

  // Search
  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/explore");
      return;
    }

    navigate(`/explore?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="home-page">

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="container hero-inner">

          <div className="hero-copy">

            <h1 className="hero-title">
              A library
              <br />
              without walls.
            </h1>

            <p className="hero-sub">
              Read. Explore. Discover. Books for everyone,
              everywhere.
            </p>

            <Link
              to="/explore"
              className="btn btn-primary hero-button"
            >
              Explore Books
              <ArrowRight size={18} />
            </Link>

          </div>

          <div className="hero-art">
            <img
              src={heroIllustration}
              alt="Cozy reading area with books, lamp and plant"
            />
          </div>

        </div>
      </section>


      {/* ================= MAIN ================= */}

      <main className="container home-container">

        {error && (
          <p className="state-banner error home-error">
            {error}
          </p>
        )}


        {/* ================= SEARCH ================= */}

        <section className="home-search-section">

          <form
            className="home-search"
            onSubmit={handleSearch}
          >

            <div className="search-input-wrapper">

              <Search
                size={21}
                className="search-icon"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books, authors, or categories..."
                aria-label="Search books, authors, or categories"
              />

            </div>

            <button
              type="submit"
              className="search-button"
            >
              Search
            </button>

          </form>

        </section>


        {/* ================= POPULAR BOOKS ================= */}

        <section className="home-section">

          <div className="section-head">

            <h2>Popular Books</h2>

            <Link
              to="/explore"
              className="section-link"
            >
              View all
              <ArrowRight size={15} />
            </Link>

          </div>

          {!loading && popular.length === 0 && (
            <p className="empty-note">
              No books available yet.
            </p>
          )}

          <div className="book-grid home-book-grid">

            {popular.map((book) => (
              <BookCard
                key={book._id}
                book={book}
              />
            ))}

          </div>

        </section>


        {/* ================= CATEGORIES ================= */}

        <section className="home-section home-categories">

          <div className="section-head">

            <h2>Categories</h2>

            <Link
              to="/categories"
              className="section-link"
            >
              View all
              <ArrowRight size={15} />
            </Link>

          </div>


          {displayedCategories.length > 0 ? (

            <div className="home-category-grid">

              {displayedCategories.map((category) => (

                <Link
                  key={category._id}
                  to={`/explore?category=${category.slug}`}
                  className="home-category-card"
                >

                  <span>
                    {category.name}
                  </span>

                  <ArrowRight
                    size={18}
                    className="category-arrow"
                  />

                </Link>

              ))}

            </div>

          ) : (

            <p className="empty-note category-empty">
              No categories available yet.
            </p>

          )}

        </section>


        {/* ================= WHY ENDPAPER ================= */}

        <section className="home-section why-endpaper">

          <div className="why-heading">

            <h2>Why Endpaper?</h2>

            <p>
              A simple space to discover, explore,
              and read books freely.
            </p>

          </div>


          <div className="features-grid">

            {/* Free to Read */}

            <div className="feature-card">

              <div className="feature-icon">
                <BookOpen size={23} />
              </div>

              <h3>
                Free to Read
              </h3>

              <p>
                Explore our collection and read available
                books online without a paid subscription.
              </p>

            </div>


            {/* Discover */}

            <div className="feature-card">

              <div className="feature-icon">
                <Compass size={23} />
              </div>

              <h3>
                Discover &amp; Explore
              </h3>

              <p>
                Find stories and books across different
                categories and interests.
              </p>

            </div>


            {/* Simple Reading */}

            <div className="feature-card">

              <div className="feature-icon">
                <Bookmark size={23} />
              </div>

              <h3>
                Simple Reading
              </h3>

              <p>
                A clean, distraction-free experience
                designed to keep you focused on the book.
              </p>

            </div>

          </div>

        </section>


        {/* ================= CTA ================= */}

        <section className="home-cta">

          <div className="cta-content">

            <h2>
              Ready to start your reading journey?
            </h2>

            <p>
              Discover new stories and start reading today.
            </p>

          </div>

          <Link
            to="/signup"
            className="btn btn-accent"
          >
            Sign In / Sign Up
          </Link>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="home-footer">

        <div className="container footer-container">

          {/* Brand */}

          <div className="footer-brand">

            <h2>
              <BookOpen size={21} />
              Endpaper
            </h2>

            <p className="footer-tagline">
              A library without walls.
            </p>

            <p className="footer-about-text">
              Endpaper is a free online reading platform
              created by Samyuktha to make discovering
              and reading books simple and accessible.
            </p>

          </div>


          {/* About */}

          <div className="footer-column">

            <h3>About</h3>

            <Link to="/about">
              About Us
            </Link>

          </div>


          {/* Explore */}

          <div className="footer-column">

            <h3>Explore</h3>

            <Link to="/">
              Home
            </Link>

            <Link to="/explore">
              Explore
            </Link>

            <Link to="/categories">
              Categories
            </Link>

          </div>


          {/* Contact */}

          <div className="footer-column">

            <h3>Contact</h3>

            <a href="mailto:hello@endpaper.com">
              <Mail size={15} />
              hello@endpaper.com
            </a>

          </div>

        </div>


        {/* Footer Bottom */}

        <div className="container footer-bottom">

          <p>
            © 2026 Endpaper. All rights reserved.
          </p>

          <p>
            Made by Samyuktha
          </p>

        </div>

      </footer>

    </div>
  );
};

export default Home;