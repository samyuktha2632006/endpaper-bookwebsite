import { useEffect, useState } from "react";
import api from "../api/client";
import "./AdminDashboard.css";

const emptyForm = {
  title: "",
  author: "",
  description: "",
  category: "",
  featured: false,
};

const AdminDashboard = () => {
  const [tab, setTab] = useState("books");

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [newCategory, setNewCategory] = useState("");

  const loadAll = () => {
    setLoading(true);
    Promise.all([api.get("/books/admin/all"), api.get("/categories")])
      .then(([booksRes, catRes]) => {
        setBooks(booksRes.data);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    setBookFile(null);
    setEditingId(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || "",
      category: book.category?._id || "",
      featured: book.featured,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book? This can't be undone.")) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter((b) => b._id !== id));
    } catch (err) {
      setMessage({ type: "error", text: "Couldn't delete that book." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("author", form.author);
    payload.append("description", form.description);
    payload.append("category", form.category);
    payload.append("featured", form.featured);
    if (coverFile) payload.append("coverImage", coverFile);
    if (bookFile) payload.append("bookFile", bookFile);

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage({ type: "success", text: "Book updated." });
      } else {
        await api.post("/books", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage({ type: "success", text: "Book added." });
      }
      resetForm();
      loadAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Couldn't save the book." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post("/categories", { name: newCategory.trim() });
      setNewCategory("");
      loadAll();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Couldn't add category." });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadAll();
    } catch (err) {
      setMessage({ type: "error", text: "Couldn't delete that category." });
    }
  };

  return (
    <div className="container admin-page">
      <p className="eyebrow">Admin</p>
      <h1>Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "books" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("books")}
        >
          Books
        </button>
        <button
          className={`admin-tab ${tab === "categories" ? "admin-tab-active" : ""}`}
          onClick={() => setTab("categories")}
        >
          Categories
        </button>
      </div>

      {message && <p className={`state-banner ${message.type}`}>{message.text}</p>}

      {tab === "books" && (
        <div className="admin-grid">
          <form className="admin-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit book" : "Add a book"}</h2>

            <div className="admin-field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" required value={form.title} onChange={handleFormChange} />
            </div>

            <div className="admin-field">
              <label htmlFor="author">Author</label>
              <input id="author" name="author" required value={form.author} onChange={handleFormChange} />
            </div>

            <div className="admin-field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required value={form.category} onChange={handleFormChange}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleFormChange}
              />
            </div>

            <div className="admin-field-row">
              <label className="admin-checkbox">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} />
                Feature on home page
              </label>
            </div>

            <div className="admin-field">
              <label htmlFor="coverImage">Cover image {editingId && "(leave blank to keep current)"}</label>
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="bookFile">Book file (.pdf, .epub, .txt) {editingId && "(leave blank to keep current)"}</label>
              <input
                id="bookFile"
                type="file"
                accept=".pdf,.epub,.txt"
                onChange={(e) => setBookFile(e.target.files[0])}
              />
            </div>

            <div className="admin-form-actions">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Saving…" : editingId ? "Save changes" : "Add book"}
              </button>
              {editingId && (
                <button className="btn btn-ghost" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="admin-list">
            <h2>All books ({books.length})</h2>
            {loading && <p className="empty-note">Loading…</p>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.category?.name || "—"}</td>
                    <td>{b.views ?? 0}</td>
                    <td className="admin-row-actions">
                      <button className="btn-link" onClick={() => handleEdit(b)}>
                        Edit
                      </button>
                      <button className="btn-link btn-link-danger" onClick={() => handleDelete(b._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="admin-grid">
          <form className="admin-form" onSubmit={handleAddCategory}>
            <h2>Add a category</h2>
            <div className="admin-field">
              <label htmlFor="newCategory">Name</label>
              <input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Historical Fiction"
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Add category
            </button>
          </form>

          <div className="admin-list">
            <h2>All categories ({categories.length})</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td className="admin-row-actions">
                      <button className="btn-link btn-link-danger" onClick={() => handleDeleteCategory(c._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
