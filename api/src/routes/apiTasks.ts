import express from 'express';
import taskService, {TaskService} from '../services/taskService';
import {upload, uploadsPathExport} from '../utils/storage';
import path from "path";
import fs from "fs";
import {TaskFilter, TimeFilter} from "../models/task";
import {emit} from "../socket";

const router = express.Router();

router.get('/', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filter = (req.query.filter as TaskFilter) ?? 'all';
    const timeFilter = (req.query.time as TimeFilter) ?? 'any';
    const tasks = taskService.getAllTasksForUser(user.id, filter, timeFilter);
    res.status(200).json(tasks);
});

router.post('/', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, dueDate, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTask = taskService.createTaskForUser(user.id, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: status || 'todo'
    });

    emit('task:created', {
        id: newTask.id,
        title: newTask.title,
        ownerId: newTask.ownerId,
        username: user.username,
        dueDate: newTask.dueDate
    });

    res.status(201).json(newTask);
});

router.get('/:id', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const task = taskService.getTaskByIdForUser(req.params.id, user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(task);
});

router.put('/:id', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, dueDate, status } = req.body;
    const updatedTask = taskService.updateTaskForUser(req.params.id, user.id, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        status
    });

    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json(updatedTask);
});

router.delete('/:id', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const deleted = taskService.deleteTaskForUser(req.params.id, user.id);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
});

router.post('/:id/attachments', upload.single('attachment'), (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const added = taskService.addAttachmentForUser(req.params.id, user.id, {
        filename: req.file.filename,
        originalName: req.file.originalname
    });

    if (!added) return res.status(404).json({ error: 'Task not found' });

    res.status(201).json({ message: 'Attachment added' });
});

router.get('/:id/attachments/:filename', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const task = taskService.getTaskByIdForUser(req.params.id, user.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachment = task.attachments.find(a => a.filename === req.params.filename);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.resolve(uploadsPathExport, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    return res.download(filePath);
});

router.delete('/:id/attachments/:filename', (req: any, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const filePath = path.resolve(uploadsPathExport, req.params.filename);
    const deleted = taskService.deleteAttachmentForUser(req.params.id, user.id, req.params.filename);
    if (!deleted) return res.status(404).json({ error: 'Attachment not found' });

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error('Failed to remove file', filePath, e);
            return res.status(500).json({ error: 'Failed to delete file' });
        }
    }

    res.status(204).send();
});

export default router;
