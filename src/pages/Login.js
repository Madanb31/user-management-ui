import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        loginUser(form)
            .then(res => {
                login(res.data);  // Store token + user info
                toast.success(`Welcome ${res.data.username}!`);
                navigate('/');     // Go to dashboard
            })
            .catch(err => {
                setLoading(false);
                if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Login failed');
                }
            });
    };

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-5">
                <div className="card">
                    <div className="card-header bg-primary text-white text-center">
                        <h3>🔐 Login</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input type="text" className="form-control" name="username"
                                       value={form.username} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-control" name="password"
                                       value={form.password} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <p className="text-center mt-3">
                            Don't have an account? <Link to="/register">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;