import React, { useState } from 'react';

interface Props {
    onClose: () => void;
    onCreate: (name: string, description: string) => void;
}

const CreateAppModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onCreate(name.trim(), description.trim());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Create New App</h3>
                <p>Each app gets its own API key and isolated user database.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="app-name">App Name</label>
                        <input
                            id="app-name"
                            type="text"
                            placeholder="My Awesome App"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="app-description">Description (optional)</label>
                        <textarea
                            id="app-description"
                            placeholder="A brief description of your app..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!name.trim() || loading}
                            id="submit-create-app"
                        >
                            {loading ? 'Creating...' : '+ Create App'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAppModal;
