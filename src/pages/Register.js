import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../services/api';

function Register() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        email: '',
        contactNum: '',
        street: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const userData = {
            ...form,
            street: form.street || null,
            city: form.city || null,
            state: form.state || null,
            zipCode: form.zipCode || null,
        };

        registerUser(userData)
            .then(() => {
                toast.success('Registration successful! Please login.');
                navigate('/login');
            })
            .catch(err => {
                setLoading(false);
                if (err.response?.data?.errors) {
                    Object.values(err.response.data.errors)
                        .forEach(msg => toast.error(msg));
                } else if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Registration failed');
                }
            });
    };

    return (
        <div className="row justify-content-center mt-3">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header bg-success text-white text-center">
                        <h3>📝 Register</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>

                            <div className="card mb-3">
                                <div className="card-header bg-primary text-white">Login Credentials</div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Username *</label>
                                            <input type="text" className="form-control" name="username"
                                                   value={form.username} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Password *</label>
                                            <input type="password" className="form-control" name="password"
                                                   value={form.password} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-3">
                                <div className="card-header bg-info text-white">Personal Info</div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name *</label>
                                        <input type="text" className="form-control" name="name"
                                               value={form.name} onChange={handleChange} required />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email *</label>
                                            <input type="email" className="form-control" name="email"
                                                   value={form.email} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Contact Number *</label>
                                            <input type="text" className="form-control" name="contactNum"
                                                   value={form.contactNum} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card mb-3">
                                <div className="card-header bg-secondary text-white">Address (Optional)</div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <label className="form-label">Street</label>
                                        <input type="text" className="form-control" name="street"
                                               value={form.street} onChange={handleChange} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">City</label>
                                            <input type="text" className="form-control" name="city"
                                                   value={form.city} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">State</label>
                                            <input type="text" className="form-control" name="state"
                                                   value={form.state} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label">Zip Code</label>
                                            <input type="text" className="form-control" name="zipCode"
                                                   value={form.zipCode} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-muted text-center mb-3">
                                🔒 You will be registered as a <strong>USER</strong>.
                                Contact admin for elevated access.
                            </p>

                            <button type="submit" className="btn btn-success w-100" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                        <p className="text-center mt-3">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;