import { Request, Response } from 'express';
import MedicineInventory from '../models/MedicineInventory';

export const getMyInventory = async (req: any, res: Response) => {
  try {
    const inventory = await MedicineInventory.find({ userId: req.user.id });
    res.json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMedicineToInventory = async (req: any, res: Response) => {
  try {
    const medicine = new MedicineInventory({
      ...req.body,
      userId: req.user.id
    });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInventoryStock = async (req: any, res: Response) => {
  try {
    const { delta } = req.body;
    const item = await MedicineInventory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    item.currentStock = Math.max(0, item.currentStock + delta);
    await item.save();
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFromInventory = async (req: any, res: Response) => {
  try {
    await MedicineInventory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
