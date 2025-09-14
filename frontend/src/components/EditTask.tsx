import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskForm from './TaskForm';
import AttachmentsList from './AttachmentList.tsx'
import { getTask, updateTask, addAttachment } from '../services/api';
import type { Status, Task } from '../types';

const EditTask: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (id) {
            getTask(id).then(setTask).catch(() => alert('Failed to load task:'));
        }
    }, [id]);

    const refreshTask = () => {
        if (id) getTask(id).then(setTask);
    };

    const handleUpdate = async (data: { title: string; description?: string; dueDate?: string; status?: Status }) => {
        if (id) {
            await updateTask(id, data);
            refreshTask(); 
        }
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file || !id) return;
        await addAttachment(id, file);
        setFile(null);
        refreshTask();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    if (!task) return <div>Loading...</div>;

    return (
        <div>
            <TaskForm
                onSubmit={handleUpdate}
                initialValues={{ title: task.title, description: task.description, dueDate: task.dueDate, status: task.status }}
                submitLabel="Save Changes"
                isEdit
            />
            {task.attachments.length > 0 && (
                <AttachmentsList attachments={task.attachments} taskId={id!} onRefresh={refreshTask} />
            )}
            <form onSubmit={handleUpload} className="upload-inline" style={{ marginTop: '12px' }}>
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" className="small">Upload File</button>
            </form>
            <button onClick={() => navigate('/')} className="secondary" style={{ marginTop: '12px' }}>
                Cancel
            </button>
        </div>
    );
};

export default EditTask;