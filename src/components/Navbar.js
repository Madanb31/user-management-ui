import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();

    // Active link helper (supports nested routes too)
    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/')
            ? 'nav-link active'
            : 'nav-link';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    👤 User Management
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    {isLoggedIn() ? (
                        <>
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <Link className={isActive('/')} to="/">
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className={isActive('/users')} to="/users">
                                        Users
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <Link className={isActive('/roles')} to="/roles">
                                        Roles
                                    </Link>
                                </li>

                                {/* Admin-only link */}
                                {isAdmin() && (
                                    <li className="nav-item">
                                        <Link className={isActive('/approvals')} to="/approvals">
                                            Approvals
                                        </Link>
                                    </li>
                                )}
                                {isAdmin() && (
                                    <li className="nav-item">
                                        <Link className={isActive('/roles/add')} to="/roles/add">
                                            Add Role
                                        </Link>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <Link className={isActive('/chat')} to="/chat">
                                        AI Chat
                                    </Link>
                                </li>
                            </ul>

                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <span className="nav-link">
                                        👋 {user?.username}
                                        {user?.role && (
                                            <span className="badge bg-light text-primary ms-2">
                                                {user.role}
                                            </span>
                                        )}
                                    </span>
                                </li>

                                <li className="nav-item">
                                    <button
                                        className="btn btn-outline-light btn-sm mt-1"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </>
                    ) : (
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link className={isActive('/login')} to="/login">
                                    Login
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className={isActive('/register')} to="/register">
                                    Register
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;