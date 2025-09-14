import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AttachmentsList from './AttachmentList';
import {updateTask, addAttachment, deleteTask} from '../services/api';
import type { Task, Status } from '../types';

interface TaskItemProps {
    task: Task;
    onUpdate: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate }) => {
    const [showDescription, setShowDescription] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const statusClass = task.status.replace(/\s+/g, '-');
    const humanStatus = task.status === 'todo' ? 'To do' : task.status === 'in progress' ? 'In progress' : 'Completed';

    const handleStatusChange = async () => {
        let newStatus: Status = 'todo';
        if (task.status === 'todo') newStatus = 'in progress';
        else if (task.status === 'in progress') newStatus = 'done';
        await updateTask(task.id, { ...task, status: newStatus });
        onUpdate();
    };

    const handleDelete = async () => {
        if (confirm('Are you sure?')) {
            await deleteTask(task.id);
            onUpdate();
        }
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;
        await addAttachment(task.id, file);
        setFile(null);
        onUpdate();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    return (
        <div className={`task ${statusClass}`}>
            <div className="meta">
                <div className="title-wrap">
                    <h3 className="task-title">{task.title}</h3>
                    {task.dueDate && <div className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                </div>
                <div className="right-meta">
                    <div className="status-badge">{humanStatus}</div>
                    <button type="button" className="toggle-desc" onClick={() => setShowDescription(!showDescription)}>
                        Description
                    </button>
                </div>
            </div>
            {showDescription && <p className="description">{task.description || '— No description —'}</p>}
            {task.attachments.length > 0 && (
                <AttachmentsList attachments={task.attachments} taskId={task.id} onRefresh={onUpdate} />
            )}
            <form onSubmit={handleUpload} className="upload-inline">
                <input type="file" onChange={handleFileChange} required />
                <button type="submit" className="small">Upload File</button>
            </form>
            <div className="actions">
                <button onClick={handleStatusChange} className={task.status === 'done' ? 'secondary' : 'primary'}>
                    {task.status === 'todo' ? 'Start' : task.status === 'in progress' ? 'Complete' : 'Reset'}
                </button>
                <Link to={`/tasks/${task.id}/edit`}>
                    <button type="button" className="secondary">Edit</button>
                </Link>
                <button onClick={handleDelete} className="danger">Delete</button>
            </div>
        </div>
    );
};

export default TaskItem;