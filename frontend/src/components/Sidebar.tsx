import React from 'react';
import { App as AppType } from '../types';

interface Props {
    apps: AppType[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onCreateClick: () => void;
}

const Sidebar: React.FC<Props> = ({ apps, selectedId, onSelect, onCreateClick }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🔐</div>
                    <div>
                        <h1>LocalAuth</h1>
                        <span>Dev Auth Provider</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-apps">
                <div className="sidebar-section-title">Your Apps</div>
                {apps.length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px', lineHeight: 1.5 }}>
                        No apps yet. Create one to get started.
                    </p>
                )}
                {apps.map((app) => (
                    <div
                        key={app.id}
                        className={`app-item${selectedId === app.id ? ' active' : ''}`}
                        onClick={() => onSelect(app.id)}
                    >
                        <div className="app-item-icon">📱</div>
                        <div className="app-item-info">
                            <div className="app-item-name">{app.name}</div>
                            <div className="app-item-meta">
                                {app.user_count} user{app.user_count !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <button className="btn btn-primary btn-full" onClick={onCreateClick} id="create-app-btn">
                    + New App
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
