export interface Attachment {
    filename: string;
    originalName: string;
}

export type Status = 'todo' | 'in progress' | 'done';

export interface Task {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    status: Status;
    dueDate?: string;
    attachments: Attachment[];
}

export type TimeFilter = 'any' | 'overdue' | 'today' | 'week' | 'month';
export type TaskFilter = 'all' | 'active' | 'completed';