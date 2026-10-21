import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import "./Reader.css";

const Reader = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError("");

        // Get book details
        const res = await api.get(`/books/${id}`);

        if (cancelled) return;

        setBook(res.data);

        if (!res.data.bookFile) {
          setError("No file has been uploaded for this book yet.");
          return;
        }

        // Get actual book file
        const fileRes = await api.get(`/books/${id}/read`, {
          responseType: "blob",
        });

        if (cancelled) return;

        objectUrl = URL.createObjectURL(fileRes.data);
        setBlobUrl(objectUrl);
      } catch (err) {
        if (cancelled) return;

        console.error("Reader error:", err);

        if (err.response?.status === 401) {
          setError("Please log in to read this book.");
        } else {
          setError("Couldn't open this book.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  const isText = book?.bookFile
    ?.toLowerCase()
    .endsWith(".txt");

  // Hide PDF toolbar
  const viewerUrl =
    blobUrl && !isText
      ? `${blobUrl}#toolbar=0&navpanes=0`
      : blobUrl;

  return (
    <div className="reader-page">

      {/* Reader Header */}
      <div className="reader-bar">
        <Link
          to={`/books/${id}`}
          className="reader-back"
        >
          ← {book?.title || "Back"}
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="container">
          <p className="empty-note reader-status">
            Opening book…
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="container">
          <p className="state-banner error reader-status">
            {error}
          </p>
        </div>
      )}

      {/* Book Reader */}
      {!loading && !error && blobUrl && (
        <div className="reader-frame-wrap">
          <iframe
            title={book?.title || "Reader"}
            src={viewerUrl}
            className="reader-frame"
          />
        </div>
      )}
    </div>
  );
};

export default Reader;