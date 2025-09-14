import type { Task, TaskFilter, TimeFilter, Status } from '../types';

const API_BASE = 'http://localhost:4000/api/tasks';
const API_BASE_AUTH = 'http://localhost:4000/api/auth';

async function fetchJson(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, { ...init, credentials: 'include' });
    if (res.status === 401) {
        const err = new Error('Unauthorized');
        (err as any).status = 401;
        throw err;
    }
    const text = await res.text();
    try {
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.error || 'Request failed');
        return data;
    } catch {
        if (!res.ok) throw new Error('Request failed');
        return null;
    }
}

export async function getTasks(filter: TaskFilter = 'all', timeFilter: TimeFilter = 'any') {
    const query = `
        query GetTasks($filter: TaskFilter = all, $time: TimeFilter = any) {
            tasks(filter: $filter, time: $time) {
                id
                ownerId
                title
                description
                status
                dueDate
                attachments {
                    filename
                    originalName
                }
            }
        }
    `;

    const variables = {
        filter,
        time: timeFilter
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                query,
                variables
            }),
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data.tasks;
    } catch (error) {
        console.error('Ошибка при получении задач:', error);
        throw error;
    }
}

export async function getTask(id: string): Promise<Task> {
    const query = `
        query GetTask($id: ID!) {
            task(id: $id) {
                id
                ownerId
                title
                description
                status
                dueDate
                attachments {
                    filename
                    originalName
                }
            }
        }
    `;

    const variables = {
        id
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include' 
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data.task;
    } catch (error) {
        console.error('Ошибка при получении задачи:', error);
        throw error;
    }
}

// export async function getTask(id: string): Promise<Task> {
//     return fetchJson(`${API_BASE}/${id}`);
// }

// export async function createTask(data: { title: string; description?: string; dueDate?: string; status?: Status }): Promise<Task> {
//     return fetchJson(API_BASE, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//     });
// }

export async function createTask(data: { title: string; description?: string; dueDate?: string; status?: Status }): Promise<Task> {
    const query = `
        mutation CreateTask($input: TaskInput!) {
            createTask(input: $input) {
                id
                ownerId
                title
                description
                status
                dueDate
                attachments {
                    filename
                    originalName
                }
            }
        }
    `;

    let status = ''
    if (data.status == "done") {
        status = "DONE"
    } else if (data.status == 'in progress') {
        status = "IN_PROGRESS"
    } else if (data.status == "todo") {
        status = "TODO"
    }

    const variables = {
        input: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            status: status
        }
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include'
        });

        const responseJson = await response.json();

        if (responseJson.errors) {
            throw new Error(responseJson.errors[0].message);
        }

        return responseJson.data.createTask;
    } catch (error) {
        console.error('Ошибка при создании задачи:', error);
        throw error;
    }
}

// export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
//     return fetchJson(`${API_BASE}/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(updates),
//     });
// }

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const query = `
        mutation UpdateTask($id: ID!, $input: TaskInput!) {
            updateTask(id: $id, input: $input) {
                id
                ownerId
                title
                description
                status
                dueDate
                attachments {
                    filename
                    originalName
                }
            }
        }
    `;

    let status = ''
    if (updates.status == "done") {
        status = "DONE"
    } else if (updates.status == 'in progress') {
        status = "IN_PROGRESS"
    } else if (updates.status == "todo") {
        status = "TODO"
    }

    const variables = {
        id,
        input: {
            title: updates.title,
            description: updates.description,
            dueDate: updates.dueDate,
            status: "TODO"
        }
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data.updateTask;
    } catch (error) {
        console.error('Ошибка при обновлении задачи:', error);
        throw error;
    }
}

// export async function deleteTask(id: string): Promise<void> {
//     await fetchJson(`${API_BASE}/${id}`, { method: 'DELETE' });
// }

export async function deleteTask(id: string): Promise<void> {
    const query = `
        mutation DeleteTask($id: ID!) {
            deleteTask(id: $id)
        }
    `;

    const variables = {
        id
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        if (!data.data.deleteTask) {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        throw error;
    }
}

export async function addAttachment(taskId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('attachment', file);
    await fetchJson(`${API_BASE}/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
    });
}

export async function deleteAttachment(taskId: string, filename: string): Promise<void> {
    await fetchJson(`${API_BASE}/${taskId}/attachments/${filename}`, {
        method: 'DELETE',
    });
}

export function getAttachmentUrl(taskId: string, filename: string): string {
    return `${API_BASE}/${taskId}/attachments/${filename}`;
}

export async function downloadAttachment(taskId: string, filename: string, originalName: string) {
    const url = getAttachmentUrl(taskId, filename);
    const res = await fetch(url, { credentials: 'include' });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to download');

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = originalName || filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
}

// export async function registerUser(username: string, password: string) {
//     return fetchJson(`${API_BASE_AUTH}/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//     });
// }

export async function registerUser(username: string, password: string) {
    const query = `
        mutation Register($username: String!, $password: String!) {
            register(username: $username, password: $password) {
                id
                username
                createdAt
            }
        }
    `;

    const variables = {
        username,
        password
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        if (!data.data.register) {
            throw new Error('Failed to register user');
        }

        return data.data.register;
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        throw error;
    }
}   

// export async function loginUser(username: string, password: string) {
//     return fetchJson(`${API_BASE_AUTH}/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, password }),
//     });
// }

export async function loginUser(username: string, password: string) {
    const query = `
        mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
                id
                username
            }
        }
    `;

    const variables = {
        username,
        password
    };

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        if (!data.data.login) {
            throw new Error('Login failed');
        }

        return data.data.login;
    } catch (error) {
        console.error('Ошибка при входе пользователя:', error);
        throw error;
    }
}

// export async function logoutUser() {
    // return fetchJson(`${API_BASE_AUTH}/logout`, {
        // method: 'POST',
    // });
// }

export async function logoutUser() {
    const query = `
        mutation Logout {
            logout
        }
    `;

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data.logout;
    } catch (error) {
        console.error('Ошибка при выходе пользователя:', error);
        throw error;
    }
}

// export async function getCurrentUser() {
//     return fetchJson(`${API_BASE_AUTH}/me`, { method: 'GET' });
// }

export async function getCurrentUser() {
    const query = `
        query GetCurrentUser {
            me {
                id
                username
                createdAt
            }
        }
    `;

    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data.me;
    } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
        throw error;
    }
}