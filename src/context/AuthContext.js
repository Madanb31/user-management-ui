import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        // Check localStorage on app load
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');

        if (token && username && role) {
            return { token, username, role };
        }
        return null;
    });

    // LOGIN — store user data
    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        setUser(data);
    };

    // LOGOUT — clear user data
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setUser(null);
    };

    // Check if user is logged in
    const isLoggedIn = () => user !== null;

    // Check if user is admin
    const isAdmin = () => user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth anywhere
export function useAuth() {
    return useContext(AuthContext);
}