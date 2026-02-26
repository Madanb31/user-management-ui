import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllRoles } from '../services/api';
import { useAuth } from '../context/AuthContext';

function RolesList() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        getAllRoles()
            .then(res => {
                setRoles(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load roles');
            });
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Roles</h2>
                {isAdmin() && (
                    <Link to="/roles/add" className="btn btn-success">+ Add Role</Link>
                )}
            </div>

            <table className="table table-hover table-bordered">
                <thead className="table-success">
                    <tr>
                        <th>ID</th>
                        <th>Role Name</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.length === 0 ? (
                        <tr>
                            <td colSpan="2" className="text-center text-muted">No roles found</td>
                        </tr>
                    ) : (
                        roles.map(role => (
                            <tr key={role.id}>
                                <td className="text-muted" style={{ fontSize: '12px' }}>{role.id}</td>
                                <td><span className="badge bg-success">{role.roleName}</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default RolesList;