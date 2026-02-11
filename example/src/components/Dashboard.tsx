import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
    const { user, logout, updateProfile, error, clearError } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.full_name || '',
        phone: user?.phone || '',
        username: user?.username || '',
    });
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleSave = async () => {
        clearError();
        setLoading(true);
        try {
            await updateProfile({
                fullName: formData.fullName || undefined,
                phone: formData.phone || undefined,
                username: formData.username || undefined,
            });
            setEditing(false);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <button onClick={logout} className="logout-btn">
                    Sign Out
                </button>
            </header>

            <div className="dashboard-content">
                <div className="user-card">
                    <h2>Profile</h2>
                    {error && <div className="error-message">{error}</div>}

                    {editing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Email</label>
                                <input type="text" value={user.email} disabled />
                            </div>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, username: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="button-group">
                                <button onClick={handleSave} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditing(false)} className="cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="user-info">
                            <div className="info-row">
                                <span className="label">Email:</span>
                                <span className="value">{user.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Full Name:</span>
                                <span className="value">{user.full_name || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Username:</span>
                                <span className="value">{user.username || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Phone:</span>
                                <span className="value">{user.phone || '-'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Created:</span>
                                <span className="value">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label">Last Sign In:</span>
                                <span className="value">
                                    {user.last_sign_in
                                        ? new Date(user.last_sign_in).toLocaleDateString()
                                        : '-'}
                                </span>
                            </div>
                            <button onClick={() => setEditing(true)} className="edit-btn">
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
