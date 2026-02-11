import React, { useEffect, useState, useCallback } from 'react';
import { App as AppType, User } from '../types';
import { api } from '../api';

interface Props {
    app: AppType;
    onDelete: () => void;
    onToast: (msg: string, type: 'success' | 'error') => void;
}

const AppDetail: React.FC<Props> = ({ app, onDelete, onToast }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [tab, setTab] = useState<'keys' | 'users' | 'quickstart'>('keys');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            const data = await api.getUsers(app.id);
            setUsers(data.users);
        } catch {
            /* ignore */
        }
    }, [app.id]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const copyToClipboard = async (text: string, label: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(label);
        onToast(`${label} copied to clipboard`, 'success');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await api.deleteUser(app.id, userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            onToast('User deleted', 'success');
        } catch (err: any) {
            onToast(err.message, 'error');
        }
    };

    const handleDeleteApp = async () => {
        setLoading(true);
        try {
            await api.deleteApp(app.id);
            onDelete();
            onToast('App deleted', 'success');
        } catch (err: any) {
            onToast(err.message, 'error');
        } finally {
            setLoading(false);
            setConfirmDelete(false);
        }
    };

    const formatDate = (d: string | null) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const quickStartCode = `// 1. Sign Up a User
const res = await fetch('http://localhost:3001/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${app.api_key}',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'securepassword',
    fullName: 'John Doe',
    phone: '+1234567890',
  }),
});
const { user, token } = await res.json();

// 2. Sign In
const loginRes = await fetch('http://localhost:3001/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${app.api_key}',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword',
  }),
});
const { token: authToken } = await loginRes.json();

// 3. Get Current User
const meRes = await fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'x-api-key': '${app.api_key}',
    'Authorization': \`Bearer \${authToken}\`,
  },
});
const { user: currentUser } = await meRes.json();`;

    return (
        <div className="main-content">
            {/* Header */}
            <div className="app-header">
                <div className="app-header-top">
                    <div>
                        <h2>{app.name}</h2>
                        {app.description && <p className="description">{app.description}</p>}
                    </div>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmDelete(true)}
                        id="delete-app-btn"
                    >
                        🗑 Delete App
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat">
                    <div className="stat-value">
                        {users.filter((u) => u.last_sign_in).length}
                    </div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat">
                    <div className="stat-value" style={{ fontSize: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                        {app.api_key.slice(0, 12)}…
                    </div>
                    <div className="stat-label">API Key</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab${tab === 'keys' ? ' active' : ''}`} onClick={() => setTab('keys')}>
                    🔑 API Keys
                </button>
                <button className={`tab${tab === 'users' ? ' active' : ''}`} onClick={() => { setTab('users'); loadUsers(); }}>
                    👥 Users <span className="badge" style={{ marginLeft: 4 }}>{users.length}</span>
                </button>
                <button className={`tab${tab === 'quickstart' ? ' active' : ''}`} onClick={() => setTab('quickstart')}>
                    🚀 Quick Start
                </button>
            </div>

            {/* Keys Tab */}
            {tab === 'keys' && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>🔑 API Credentials</div>
                    <div className="key-group">
                        <div className="key-label">API Key (use in x-api-key header)</div>
                        <div className="key-value">
                            <code>{app.api_key}</code>
                            <button
                                className={`copy-btn${copiedKey === 'API Key' ? ' copied' : ''}`}
                                onClick={() => copyToClipboard(app.api_key, 'API Key')}
                                title="Copy"
                            >
                                {copiedKey === 'API Key' ? '✓' : '📋'}
                            </button>
                        </div>
                    </div>
                    <div className="key-group">
                        <div className="key-label">Secret Key (used for JWT signing — keep safe)</div>
                        <div className="key-value">
                            <code>{app.secret_key}</code>
                            <button
                                className={`copy-btn${copiedKey === 'Secret' ? ' copied' : ''}`}
                                onClick={() => copyToClipboard(app.secret_key, 'Secret')}
                                title="Copy"
                            >
                                {copiedKey === 'Secret' ? '✓' : '📋'}
                            </button>
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
                        Use the <strong>API Key</strong> in your app's requests as the <code style={{ color: 'var(--color-accent)' }}>x-api-key</code> header.
                        The Secret Key is used internally to sign JWTs—you don't need it in your app.
                    </p>
                </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">👥 Users</div>
                        <button className="btn btn-ghost btn-sm" onClick={loadUsers}>↻ Refresh</button>
                    </div>
                    {users.length === 0 ? (
                        <div className="no-users">
                            <p>No users yet. Use the Quick Start tab to register your first user via the API.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Phone</th>
                                        <th>Created</th>
                                        <th>Last Sign In</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.email}</td>
                                            <td>{user.username || '—'}</td>
                                            <td>{user.full_name || '—'}</td>
                                            <td>{user.phone || '—'}</td>
                                            <td>{formatDate(user.created_at)}</td>
                                            <td>{formatDate(user.last_sign_in)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-danger btn-sm btn-icon"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete user"
                                                >
                                                    ✕
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Start Tab */}
            {tab === 'quickstart' && (
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>🚀 Quick Start</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                        Use these code snippets in your app to integrate LocalAuth. All requests require the{' '}
                        <code style={{ color: 'var(--color-accent)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                            x-api-key
                        </code>{' '}
                        header.
                    </p>
                    <div className="code-block">
                        <button
                            className="copy-code-btn"
                            onClick={() => copyToClipboard(quickStartCode, 'Code')}
                        >
                            {copiedKey === 'Code' ? '✓ Copied' : 'Copy'}
                        </button>
                        {quickStartCode}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
                    <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete "{app.name}"?</h3>
                        <p>
                            This will permanently delete the app and all its users. This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDeleteApp}
                                disabled={loading}
                                id="confirm-delete-btn"
                            >
                                {loading ? 'Deleting...' : 'Yes, Delete App'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppDetail;
