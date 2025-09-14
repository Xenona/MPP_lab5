import { v4 as uuidv4 } from 'uuid';
import {Task, Attachment, TaskFilter, TimeFilter} from '../models/task';

export class TaskService {
    private tasks: Task[] = [];

    getAllTasksForUser(userId: string, filter: TaskFilter = 'all', timeFilter: TimeFilter = 'any'): Task[] {
        let result = this.tasks.filter(t => t.ownerId === userId);

        if (filter === 'active') result = result.filter(t => t.status !== 'done');
        if (filter === 'completed') result = result.filter(t => t.status === 'done');

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        if (timeFilter && timeFilter !== 'any') {
            result = result.filter(task => {
                if (!task.dueDate) return false;
                const d = new Date(task.dueDate);
                switch (timeFilter) {
                    case 'overdue': return d < startOfToday;
                    case 'today': return d >= startOfToday && d < endOfToday;
                    case 'week': {
                        const end = new Date(startOfToday); end.setDate(end.getDate() + 7);
                        return d >= startOfToday && d < end;
                    }
                    case 'month': {
                        const end = new Date(startOfToday); end.setMonth(end.getMonth() + 1);
                        return d >= startOfToday && d < end;
                    }
                    default: return true;
                }
            });
        }

        return result;
    }

    getTaskByIdForUser(id: string, userId: string): Task | undefined {
        return this.tasks.find(t => t.id === id && t.ownerId === userId);
    }

    createTaskForUser(userId: string, data: Omit<Task, 'id' | 'ownerId' | 'attachments'>): Task {
        const newTask: Task = { id: uuidv4(), ownerId: userId, attachments: [], ...data };
        this.tasks.push(newTask);
        return newTask;
    }

    updateTaskForUser(id: string, userId: string, updates: Partial<Omit<Task, 'id' | 'ownerId'>>): Task | undefined {
        const idx = this.tasks.findIndex(t => t.id === id && t.ownerId === userId);
        if (idx === -1) return undefined;
        this.tasks[idx] = { ...this.tasks[idx], ...updates };
        return this.tasks[idx];
    }

    deleteTaskForUser(id: string, userId: string): boolean {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter(t => !(t.id === id && t.ownerId === userId));
        return this.tasks.length !== before;
    }

    addAttachmentForUser(taskId: string, userId: string, att: Attachment): boolean {
        const t = this.getTaskByIdForUser(taskId, userId);
        if (!t) return false;
        t.attachments.push(att);
        return true;
    }

    deleteAttachmentForUser(taskId: string, userId: string, filename: string): boolean {
        const t = this.getTaskByIdForUser(taskId, userId);
        if (!t) return false;
        const before = t.attachments.length;
        t.attachments = t.attachments.filter(a => a.filename !== filename);
        return t.attachments.length !== before;
    }
}

const taskService = new TaskService();
export default taskService;
