import express from 'express';
import { 
  getQueue, addToQueue, updateQueueStatus, getMyQueueStatus,
  getSchedules, createSchedule, 
  getAmbulances, updateAmbulanceLocation, requestAmbulance, getMyAmbulanceRequests, getAllAmbulanceRequests, updateAmbulanceRequestStatus, simulateAmbulance,
  getBills, getMyBills, createBill, processPayment,
  getIoTDevices, createIoTDevice, updateIoTDevice, getMyIoTDevices,
  getCampaigns, createCampaign, donateToCampaign,
  getBloodDonors, registerAsDonor,
  getMyVaccinations, addVaccination,
  getResourceStatus,
  interpretLabReportController,
  getDigitalHealthID,
  getMedicineInventory, addMedicineToInventory, updateMedicineStock,
  getExpenses, addExpense,
  getChallenges, getMyChallenges, joinChallenge, updateChallengeProgress,
  registerOrganDonor, getOrganDonors,
  getOptimizedAppointmentTime
} from '../controllers/advancedFeaturesController';
import { 
  analyzePrescriptionAI, 
  analyzeMoodAI, 
  generateNutritionPlanAI,
  checkSymptomsAI
} from '../services/aiService';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// AI Features
router.post('/ai/analyze-prescription', authenticate, async (req, res) => {
  try {
    const { image, lang } = req.body;
    const result = await analyzePrescriptionAI(image, lang);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/analyze-mood', authenticate, async (req, res) => {
  try {
    const { journal, mood, lang } = req.body;
    const result = await analyzeMoodAI(journal, mood, lang);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/generate-nutrition', authenticate, async (req, res) => {
  try {
    const { conditions, preferences, lang } = req.body;
    const result = await generateNutritionPlanAI(conditions, preferences, lang);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai/check-symptoms', authenticate, async (req, res) => {
  try {
    const { symptoms, lang } = req.body;
    const result = await checkSymptomsAI(symptoms, lang);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Blood Hub Routes
router.get('/blood-donors', authenticate, getBloodDonors);
router.post('/blood-donors/register', authenticate, registerAsDonor);

// Vaccination Routes
router.get('/vaccinations/me', authenticate, getMyVaccinations);
router.post('/vaccinations', authenticate, addVaccination);

// Resource Status Routes
router.get('/resources/status', authenticate, getResourceStatus);

// Lab Report Interpreter Routes
router.post('/lab-reports/:reportId/interpret', authenticate, interpretLabReportController);

// Digital Health ID Routes
router.get('/health-id/me', authenticate, getDigitalHealthID);

// Medicine Inventory Routes
router.get('/medicine-inventory', authenticate, getMedicineInventory);
router.post('/medicine-inventory', authenticate, addMedicineToInventory);
router.put('/medicine-inventory/:id', authenticate, updateMedicineStock);

// Health Wallet Routes
router.get('/expenses', authenticate, getExpenses);
router.post('/expenses', authenticate, addExpense);

// Gamified Health Challenges Routes
router.get('/challenges', authenticate, getChallenges);
router.get('/challenges/me', authenticate, getMyChallenges);
router.post('/challenges/join', authenticate, joinChallenge);
router.put('/challenges/:id/progress', authenticate, updateChallengeProgress);

// Organ Donation Routes
router.get('/organ-donors', authenticate, getOrganDonors);
router.post('/organ-donors/register', authenticate, registerOrganDonor);

// AI Appointment Optimizer Route
router.get('/appointments/optimize', authenticate, getOptimizedAppointmentTime);

// Queue Routes
router.get('/queue', authenticate, getQueue);
router.get('/queue/me', authenticate, getMyQueueStatus);
router.post('/queue', authenticate, authorize(['Admin', 'Staff', 'Doctor']), addToQueue);
router.put('/queue/:id', authenticate, authorize(['Admin', 'Staff', 'Doctor']), updateQueueStatus);

// Schedule Routes
router.get('/schedules', authenticate, getSchedules);
router.post('/schedules', authenticate, authorize(['Admin', 'Staff']), createSchedule);

// Ambulance Routes
router.get('/ambulances', authenticate, getAmbulances);
router.put('/ambulances/:id', authenticate, authorize(['Admin', 'Staff']), updateAmbulanceLocation);
router.post('/ambulances/request', authenticate, authorize(['Patient']), requestAmbulance);
router.get('/ambulances/my-requests', authenticate, authorize(['Patient']), getMyAmbulanceRequests);
router.get('/ambulances/all-requests', authenticate, authorize(['Admin', 'Staff', 'Driver']), getAllAmbulanceRequests);
router.put('/ambulances/requests/:id', authenticate, authorize(['Admin', 'Staff', 'Driver']), updateAmbulanceRequestStatus);
router.post('/ambulances/:id/simulate', authenticate, simulateAmbulance);

// Billing Routes
router.get('/billing', authenticate, getBills);
router.get('/billing/me', authenticate, getMyBills);
router.post('/billing', authenticate, authorize(['Admin', 'Staff']), createBill);
router.post('/billing/:id/pay', authenticate, processPayment);

// IoT Device Routes
router.get('/iot-devices', authenticate, authorize(['Admin', 'Doctor', 'Staff']), getIoTDevices);
router.get('/iot-devices/me', authenticate, authorize(['Patient']), getMyIoTDevices);
router.post('/iot-devices', authenticate, authorize(['Admin', 'Staff']), createIoTDevice);
router.put('/iot-devices/:id', authenticate, authorize(['Admin', 'Staff']), updateIoTDevice);

// Campaign Routes
router.get('/campaigns', authenticate, getCampaigns);
router.post('/campaigns', authenticate, authorize(['Admin']), createCampaign);
router.post('/campaigns/:id/donate', authenticate, donateToCampaign);

export default router;
