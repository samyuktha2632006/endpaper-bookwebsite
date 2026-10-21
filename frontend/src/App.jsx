import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import BookDetail from "./pages/BookDetail";
import Reader from "./pages/Reader";
import AdminDashboard from "./pages/AdminDashboard";
import MyLibrary from "./pages/MyLibrary";
function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute message="Sign in to see this book.">
                <BookDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/read"
            element={
              <ProtectedRoute message="Sign in to read this book.">
                <Reader />
              </ProtectedRoute>
            }
          />
          <Route
  path="/library"
  element={
    <ProtectedRoute>
      <MyLibrary />
    </ProtectedRoute>
  }
/>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
