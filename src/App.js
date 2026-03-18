import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UsersList from './pages/UsersList';
import UserForm from './pages/UserForm';
import RolesList from './pages/RolesList';
import RoleForm from './pages/RoleForm';
import Login from './pages/Login';
import Register from './pages/Register';
import AiChat from './pages/AiChat';
import Approvals from './pages/Approvals';
import KnowledgeBase from './pages/KnowledgeBase';

// Protected Route — redirects to login if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// Admin Route — only ADMIN can access
function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

// Public route guard: if already logged in, redirect away from /login or /register
function PublicOnlyRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn() ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes (only when logged OUT) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes — any logged in user */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute>
            <RolesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AiChat />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes — only ADMIN */}
      <Route
        path="/users/edit/:id"
        element={
          <AdminRoute>
            <UserForm />
          </AdminRoute>
        }
      />
      <Route
        path="/roles/add"
        element={
          <AdminRoute>
            <RoleForm />
          </AdminRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <AdminRoute>
            <Approvals />
          </AdminRoute>
        }
      />
      <Route path="/knowledge" element={<AdminRoute><KnowledgeBase /></AdminRoute>} />


      {/* Fallback: any unknown route → go home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mt-4">
          <AppRoutes />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;