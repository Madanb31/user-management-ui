import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRole } from '../services/api';

function RoleForm() {
    const [roleName, setRoleName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        createRole({ roleName })
            .then(() => {
                toast.success('Role created!');
                navigate('/roles');
            })
            .catch(err => {
                setLoading(false);
                if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Failed to create role');
                }
            });
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6">
                <h2 className="mb-4">Add New Role</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Role Name *</label>
                        <input type="text" className="form-control"
                               placeholder="e.g., ADMIN, USER, MODERATOR"
                               value={roleName}
                               onChange={(e) => setRoleName(e.target.value)}
                               required />
                    </div>
                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Role'}
                        </button>
                        <button type="button" className="btn btn-secondary"
                                onClick={() => navigate('/roles')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoleForm;