import { useState, useEffect, useCallback } from 'react';
import { App as AppType } from './types';
import { api } from './api';
import Sidebar from './components/Sidebar';
import AppDetail from './components/AppDetail';
import CreateAppModal from './components/CreateAppModal';

function App() {
    const [apps, setApps] = useState<AppType[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const loadApps = useCallback(async () => {
        try {
            const data = await api.getApps();
            setApps(data.apps);
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    }, []);

    useEffect(() => {
        loadApps();
    }, [loadApps]);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreate = async (name: string, description: string) => {
        try {
            const data = await api.createApp({ name, description });
            setApps((prev) => [data.app, ...prev]);
            setSelectedId(data.app.id);
            setShowCreate(false);
            showToast(`"${name}" created successfully`, 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const handleDelete = () => {
        setApps((prev) => prev.filter((a) => a.id !== selectedId));
        setSelectedId(null);
    };

    const selectedApp = apps.find((a) => a.id === selectedId) || null;

    return (
        <div className="app-layout">
            <Sidebar
                apps={apps}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCreateClick={() => setShowCreate(true)}
            />

            {selectedApp ? (
                <AppDetail
                    key={selectedApp.id}
                    app={selectedApp}
                    onDelete={handleDelete}
                    onToast={showToast}
                />
            ) : (
                <div className="main-content">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔐</div>
                        <h2>Welcome to LocalAuth</h2>
                        <p>
                            Your local authentication provider for development. Create an app to get started
                            — each app gets its own API key and isolated user database.
                        </p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 20 }}
                            onClick={() => setShowCreate(true)}
                            id="empty-create-btn"
                        >
                            + Create Your First App
                        </button>
                    </div>
                </div>
            )}

            {showCreate && (
                <CreateAppModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
            )}

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}
        </div>
    );
}

export default App;
