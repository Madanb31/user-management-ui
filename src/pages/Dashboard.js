import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, getAllRoles } from '../services/api';

function Dashboard() {
    const [userCount, setUserCount] = useState(0);
    const [roleCount, setRoleCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAllUsers(), getAllRoles()])
            .then(([usersRes, rolesRes]) => {
                setUserCount(usersRes.data.length);
                setRoleCount(rolesRes.data.length);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div>
            <h2 className="mb-4">Dashboard</h2>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <div className="card text-white bg-primary">
                        <div className="card-body text-center">
                            <h1 className="display-4 fw-bold">{userCount}</h1>
                            <h5>Total Users</h5>
                            <Link to="/users" className="btn btn-light mt-2">View Users</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card text-white bg-success">
                        <div className="card-body text-center">
                            <h1 className="display-4 fw-bold">{roleCount}</h1>
                            <h5>Total Roles</h5>
                            <Link to="/roles" className="btn btn-light mt-2">View Roles</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;