import { Request, Response } from 'express';
import Department from '../models/Department';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, associated_ward_id } = req.body;
    const department = await Department.create({ name, description, associated_ward_id });
    res.status(201).json(department);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
