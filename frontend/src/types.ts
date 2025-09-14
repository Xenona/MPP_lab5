export interface Attachment {
    filename: string;
    originalName: string;
}

export type Status = 'todo' | 'in progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: string; 
    attachments: Attachment[];
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type TimeFilter = 'any' | 'overdue' | 'today' | 'week' | 'month';

export interface User
{
    id: string;
    username: string;
}