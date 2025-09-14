import React, { useState, type FormEvent } from 'react';
import type { Status } from '../types';

interface TaskFormProps {
    onSubmit: (data: { title: string; description?: string; dueDate?: string; status?: Status }) => Promise<void>;
    initialValues?: { title: string; description?: string; dueDate?: string; status?: Status };
    submitLabel: string;
    isEdit?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
                                               onSubmit,
                                               initialValues = { title: '', description: '', dueDate: '', status: 'todo' },
                                               submitLabel,
                                               isEdit = false,
                                           }) => {
    const [title, setTitle] = useState(initialValues.title);
    const [description, setDescription] = useState(initialValues.description || '');
    const [dueDate, setDueDate] = useState(initialValues.dueDate || '');
    const [status, setStatus] = useState<Status>(initialValues.status || 'todo');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit({ title, description, dueDate, status });
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <h2>{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description" />
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
            />
            {isEdit && (
                <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                    <option value="todo">To do</option>
                    <option value="in progress">In progress</option>
                    <option value="done">Done</option>
                </select>
            )}
            <div className="form-actions">
                <button type="submit">{submitLabel}</button>
            </div>
        </form>
    );
};

export default TaskForm;