import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await auth.login(username, password);
            navigate('/');
        } catch (e: any) {
            setErr(e.message || 'Login failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome back</h2>
                <p className="muted">Sign in to your account</p>
                {err && <div className="error">{err}</div>}
                <form onSubmit={submit}>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                    <div className="form-actions">
                        <button type="submit" className="primary">Login</button>
                    </div>
                </form>
                <p style={{ marginTop: 12 }}>No account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
};

export default Login;
