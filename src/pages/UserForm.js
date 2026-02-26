import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateUser, getUserById, getAllRoles } from '../services/api';

function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        contactNum: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        roleIds: []
    });

    useEffect(() => {
        // Load all roles for checkboxes
        getAllRoles()
            .then(res => setRoles(res.data))
            .catch(() => toast.error('Failed to load roles'));

        // Load user data
        getUserById(id)
            .then(res => {
                const user = res.data;
                setForm({
                    name: user.name || '',
                    email: user.email || '',
                    contactNum: user.contactNum || '',
                    street: user.street || '',
                    city: user.city || '',
                    state: user.state || '',
                    zipCode: user.zipCode || '',
                    roleIds: user.roleIds || []
                });
            })
            .catch(() => toast.error('Failed to load user'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRoleToggle = (roleId) => {
        setForm(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(rid => rid !== roleId)
                : [...prev.roleIds, roleId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const userData = {
            name: form.name,
            email: form.email,
            contactNum: form.contactNum,
            street: form.street || null,
            city: form.city || null,
            state: form.state || null,
            zipCode: form.zipCode || null,
            roleIds: form.roleIds,
        };

        updateUser(id, userData)
            .then(() => {
                toast.success('User updated!');
                navigate('/users');
            })
            .catch(err => {
                setLoading(false);
                if (err.response?.data?.errors) {
                    const errors = Object.values(err.response.data.errors);
                    errors.forEach(msg => toast.error(msg));
                } else if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Failed to update user');
                }
            });
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <h2 className="mb-4">Edit User</h2>
                <form onSubmit={handleSubmit}>

                    <div className="card mb-3">
                        <div className="card-header bg-primary text-white">Basic Info</div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Name *</label>
                                <input type="text" className="form-control" name="name"
                                       value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-control" name="email"
                                       value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Contact Number *</label>
                                <input type="text" className="form-control" name="contactNum"
                                       value={form.contactNum} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-header bg-success text-white">Address</div>
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

                    <div className="card mb-3">
                        <div className="card-header bg-info text-white">Roles</div>
                        <div className="card-body">
                            {roles.length === 0 ? (
                                <p className="text-muted">No roles available.</p>
                            ) : (
                                roles.map(role => (
                                    <div className="form-check form-check-inline" key={role.id}>
                                        <input className="form-check-input" type="checkbox"
                                               checked={form.roleIds.includes(role.id)}
                                               onChange={() => handleRoleToggle(role.id)} />
                                        <label className="form-check-label">{role.roleName}</label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Update User'}
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={() => navigate('/users')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserForm;