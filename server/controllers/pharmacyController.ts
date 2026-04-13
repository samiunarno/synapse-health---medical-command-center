import { Request, Response } from 'express';
import Medicine from '../models/Medicine';
import Prescription from '../models/Prescription';
import MedicineOrder from '../models/MedicineOrder';
import Patient from '../models/Patient';

export const createMedicineOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { medicines, total_price, delivery_address, delivery_location, service_type } = req.body;
    
    const patient = await Patient.findOne({ patient_id: user.reference_id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const order = new MedicineOrder({
      patient_id: patient._id,
      user_id: user.id,
      medicines,
      total_price,
      delivery_address,
      service_type: service_type || 'Standard',
      rider_location: delivery_location // Initial rider location (at pharmacy)
    });

    await order.save();
    req.app.get('io')?.emit('new_medicine_order', order);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyMedicineOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const orders = await MedicineOrder.find({ user_id: user.id })
      .populate('medicines.medicine_id')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllMedicineOrders = async (req: Request, res: Response) => {
  try {
    const orders = await MedicineOrder.find()
      .populate('patient_id')
      .populate('medicines.medicine_id')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMedicineOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rider_id, rider_status } = req.body;
    const user = (req as any).user;

    // If a rider is accepting, check if they already have an active order
    if (rider_id && user.role === 'Rider' && status !== 'Delivered' && status !== 'Cancelled') {
      const activeOrder = await MedicineOrder.findOne({
        rider_id: user.id,
        status: { $in: ['Processing', 'Shipped'] }
      });
      if (activeOrder && activeOrder._id.toString() !== id) {
        return res.status(400).json({ error: 'You already have an active delivery order. Complete it before accepting another.' });
      }
    }

    const order = await MedicineOrder.findByIdAndUpdate(id, { status, rider_id, rider_status }, { new: true })
      .populate('medicines.medicine_id')
      .populate('rider_id', 'fullName username');
    
    req.app.get('io')?.emit('medicine_order_updated', order);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    let query = {};
    if (q) {
      query = {
        $or: [
          { brand_name: { $regex: q, $options: 'i' } },
          { generic_name: { $regex: q, $options: 'i' } },
          { aliases: { $regex: q, $options: 'i' } }
        ]
      };
    }
    const medicines = await Medicine.find(query).populate('associated_department_id');
    res.json(medicines);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    
    req.app.get('io')?.emit('pharmacy_updated');
    
    res.status(201).json(medicine);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient_id')
      .populate('doctor_id')
      .populate('medicines.medicine_id');
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const dispensePrescription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prescription: any = await Prescription.findById(id).populate('medicines.medicine_id');
    if (!prescription || prescription.status === 'Dispensed') {
      return res.status(400).json({ error: 'Prescription not found or already dispensed' });
    }
    for (const item of prescription.medicines) {
      await Medicine.findByIdAndUpdate(item.medicine_id._id, { $inc: { stock_quantity: -1 } });
    }
    await Prescription.findByIdAndUpdate(id, { status: 'Dispensed' });
    
    req.app.get('io')?.emit('pharmacy_updated');
    req.app.get('io')?.emit('prescription_updated');
    
    res.json({ message: 'Prescription dispensed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    const medicine = await Medicine.findByIdAndUpdate(id, { stock_quantity }, { new: true });
    
    req.app.get('io')?.emit('pharmacy_updated');
    
    res.json(medicine);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByIdAndUpdate(id, req.body, { new: true });
    
    req.app.get('io')?.emit('pharmacy_updated');
    
    res.json(medicine);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const simulateRider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { target_lat, target_lng } = req.body;
    
    const order = await MedicineOrder.findById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Simulate movement: move 15% closer to target
    const currentLat = order.rider_location?.lat || 23.8103;
    const currentLng = order.rider_location?.lng || 90.4125;
    
    const newLat = currentLat + (target_lat - currentLat) * 0.15;
    const newLng = currentLng + (target_lng - currentLng) * 0.15;
    
    const updatedOrder = await MedicineOrder.findByIdAndUpdate(id, {
      rider_location: { lat: newLat, lng: newLng }
    }, { new: true }).populate('medicines.medicine_id');

    req.app.get('io')?.emit('medicine_order_updated', updatedOrder);
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const checkInteractions = async (req: Request, res: Response) => {
  try {
    const { medicineName, searchTerm } = req.body;
    
    // In a real app, this would query a drug interaction database or use an AI model.
    // For now, we'll use the logic previously in the frontend but on the backend.
    const dangerousCombinations = [
      { drugs: ['Aspirin', 'Warfarin'], message: 'High risk of bleeding. Avoid combination.' },
      { drugs: ['Lisinopril', 'Potassium'], message: 'Risk of hyperkalemia. Monitor closely.' },
      { drugs: ['Simvastatin', 'Amiodarone'], message: 'Increased risk of myopathy/rhabdomyolysis.' }
    ];

    const match = dangerousCombinations.find(combo => 
      combo.drugs.some(d => d.toLowerCase() === medicineName?.toLowerCase()) ||
      combo.drugs.some(d => d.toLowerCase() === searchTerm?.toLowerCase())
    );

    if (match) {
      res.json({
        message: `Automated Interaction Alert: ${match.message} (Involves ${match.drugs.join(' and ')})`,
        severity: 'danger'
      });
    } else {
      res.json(null);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
