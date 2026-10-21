import { Link } from "react-router-dom";
import "./BookCard.css";

// Deterministic gradient per book so placeholder covers (no upload yet)
// still look varied and intentional, matching the style of real covers.
const GRADIENTS = [
  ["#7a9e8e", "#2e4a3b"],
  ["#c9a15a", "#7a5c2a"],
  ["#5c7fa6", "#243e56"],
  ["#a65c5c", "#4a2323"],
  ["#8e6ca6", "#402a56"],
  ["#6c8e6c", "#2c3e2c"],
  ["#b08a5a", "#5a3e1e"],
  ["#5c5c86", "#26264a"],
];

export const gradientFor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const [a, b] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return `linear-gradient(160deg, ${a}, ${b})`;
};

const BookCard = ({ book }) => {
  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-cover-wrap">
        {book.coverImage ? (
          <img src={book.coverImage} alt={`${book.title} cover`} className="book-cover" />
        ) : (
          <div
            className="book-cover book-cover-placeholder"
            style={{ background: gradientFor(book.title || book._id) }}
          />
        )}
      </div>
      <div className="book-meta">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
      </div>
    </Link>
  );
};

export default BookCard;
