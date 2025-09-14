import React, {type JSX} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import TaskList from './components/TaskList';
import EditTask from './components/EditTask';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import Notifications from "./components/Notifications/Notifications.tsx";
import {SocketProvider, useSocket} from "./context/SocketContext";

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" replace />;
};

const HeaderBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { onlineCount } = useSocket();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="header" style={{ display: 'flex', justifyContent:
                'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Task Manager</h1>
            <div className="header-right" style={{ display: 'flex', gap: 12,
                alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#666' }}>Online:
                    {onlineCount}</div>
                {user ? (
                    <>
                        <div className="header-username">Hello,
                            {user.username}</div>
                        <button className="secondary" onClick={handleLogout}
                        >Logout</button>
                    </>
                ) : null}
            </div>
        </div>
    );

};

const App: React.FC = () => (
    <AuthProvider>
        <SocketProvider>
            <div className="container">
                <Router>
                    <HeaderBar />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={
                            <PrivateRoute>
                                <TaskList />
                            </PrivateRoute>} />
                        <Route path="/tasks/:id/edit" element={
                            <PrivateRoute>
                                <EditTask />
                            </PrivateRoute>} />
                    </Routes>
                </Router>
                <Notifications />
            </div>
        </SocketProvider>
    </AuthProvider>
);

export default App;
