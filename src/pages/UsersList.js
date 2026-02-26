import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUsersPaginated, searchUsersByName, deleteUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState('');
    const { isAdmin } = useAuth();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [sortBy, setSortBy] = useState('name');
    const [direction, setDirection] = useState('asc');

    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, [currentPage, pageSize, sortBy, direction]);

    const loadUsers = () => {
        setLoading(true);
        getUsersPaginated(currentPage, pageSize, sortBy, direction)
            .then(res => {
                setUsers(res.data.users || []);
                setCurrentPage(res.data.currentPage);
                setTotalPages(res.data.totalPages);
                setTotalItems(res.data.totalItems);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                toast.error('Failed to load users');
            });
    };

    const handleSearch = () => {
        if (!searchName.trim()) {
            loadUsers();
            return;
        }
        setLoading(true);
        searchUsersByName(searchName)
            .then(res => {
                const formatted = res.data.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    contactNum: u.contactNum,
                    city: u.address ? u.address.city : null,
                    roles: u.roles ? u.roles.map(r => r.roleName) : []
                }));
                setUsers(formatted);
                setTotalPages(1);
                setTotalItems(formatted.length);
                setLoading(false);
            })
            .catch(() => {
                setUsers([]);
                setLoading(false);
                toast.error('No users found');
            });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        deleteUser(id)
            .then(() => {
                toast.success('User deleted successfully');
                loadUsers();
            })
            .catch(() => toast.error('Failed to delete user'));
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(0);
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Users</h2>
            </div>

            {/* Search Bar */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search by name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                        <button className="btn btn-secondary" onClick={() => { setSearchName(''); setCurrentPage(0); loadUsers(); }}>
                            Clear
                        </button>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="d-flex gap-2 justify-content-end">
                        <select className="form-select form-select-sm w-auto" value={pageSize} onChange={handlePageSizeChange}>
                            <option value="5">5 / page</option>
                            <option value="10">10 / page</option>
                            <option value="20">20 / page</option>
                        </select>
                        <select className="form-select form-select-sm w-auto" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(0); }}>
                            <option value="name">Sort: Name</option>
                            <option value="email">Sort: Email</option>
                        </select>
                        <select className="form-select form-select-sm w-auto" value={direction} onChange={(e) => { setDirection(e.target.value); setCurrentPage(0); }}>
                            <option value="asc">A → Z</option>
                            <option value="desc">Z → A</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <table className="table table-hover table-bordered">
                <thead className="table-primary">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Contact</th>
                        <th>City</th>
                        <th>Roles</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center text-muted">No users found</td>
                        </tr>
                    ) : (
                        users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.contactNum}</td>
                                <td>{user.city || '-'}</td>
                                <td>
                                    {user.roles && user.roles.map((role, i) => (
                                        <span key={i} className="badge bg-primary me-1">{role}</span>
                                    ))}
                                </td>
                                <td>
                                    {isAdmin() && (
                                        <>
                                            <button className="btn btn-sm btn-warning me-1"
                                                onClick={() => navigate(`/users/edit/${user.id}`)}>
                                                Edit
                                            </button>
                                            <button className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(user.id)}>
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center gap-2">
                    <button className="btn btn-outline-primary btn-sm"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}>
                        ← Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i}
                            className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setCurrentPage(i)}>
                            {i + 1}
                        </button>
                    ))}
                    <button className="btn btn-outline-primary btn-sm"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(currentPage + 1)}>
                        Next →
                    </button>
                </div>
            )}
            <p className="text-center text-muted mt-2">
                Page {currentPage + 1} of {totalPages} | Total: {totalItems} users
            </p>
        </div>
    );
}

export default UsersList;