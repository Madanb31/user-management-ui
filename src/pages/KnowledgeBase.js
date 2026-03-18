import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function KnowledgeBase() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            await axios.post('http://localhost:8080/ai/docs/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success("Document uploaded & indexed!");
            setFile(null);
        } catch (err) {
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>📚 Knowledge Base</h2>
            <div className="card mt-3">
                <div className="card-body">
                    <h5>Upload Policy Documents</h5>
                    <p className="text-muted">Upload PDF or Text files. The AI will read and learn from them.</p>
                    
                    <form onSubmit={handleUpload}>
                        <div className="mb-3">
                            <input type="file" className="form-control" onChange={handleFileChange} accept=".pdf,.txt,.md" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
                            {uploading ? 'Uploading...' : 'Upload & Index'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBase;