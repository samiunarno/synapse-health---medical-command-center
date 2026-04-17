import { Request, Response } from 'express';
import Task from '../models/Task';

export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      createdBy: req.user.id
    });
    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username');
      
    req.app.get('io')?.emit('task_created', populatedTask);
      
    res.status(201).json(populatedTask);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req: any, res: Response) => {
  try {
    // Admins can see all tasks, others see tasks assigned to them or created by them
    let query = {};
    if (req.user.role !== 'Admin') {
      query = { $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }] };
    }
    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName username')
      .populate('createdBy', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, dueDate, priority, status, assignedTo },
      { new: true }
    ).populate('assignedTo', 'fullName username')
     .populate('createdBy', 'fullName username');
     
    if (!task) return res.status(404).json({ error: 'Task not found' });
     
    req.app.get('io')?.emit('task_updated', task);

    if (status === 'Completed') {
      req.app.get('io')?.emit('new_activity', {
        user: req.user.username || 'System',
        action: `Completed task: ${task.title}`,
        time: new Date().toLocaleTimeString(),
        icon: 'CheckCircle2',
        color: 'blue'
      });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    req.app.get('io')?.emit('task_deleted', id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
