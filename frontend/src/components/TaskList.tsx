import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { getTasks, createTask } from '../services/api';
import type { Task, TaskFilter, TimeFilter } from '../types';

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<TaskFilter>('all');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('any');

    const fetchTasks = async () => {
        try {
            const data = await getTasks(filter, timeFilter);
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filter, timeFilter]);

    const handleCreate = async (data: { title: string; description?: string; dueDate?: string }) => {
        await createTask(data);
        fetchTasks();
    };

    return (
        <div>
            <div className="filters">
                <div className="form-inline">
                    <label>
                        Filter:
                        <select value={filter} onChange={(e) => setFilter(e.target.value as TaskFilter)}>
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <label>
                        Time:
                        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}>
                            <option value="any">Any</option>
                            <option value="overdue">Overdue</option>
                            <option value="today">Today</option>
                            <option value="week">Next 7 days</option>
                            <option value="month">Next 30 days</option>
                        </select>
                    </label>
                </div>
            </div>
            <TaskForm onSubmit={handleCreate} submitLabel="Add Task" />
            <div className="tasks">
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} onUpdate={fetchTasks} />
                ))}
            </div>
        </div>
    );
};

export default TaskList;