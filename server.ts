import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

// Process-level error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

// Import Routes
import authRoutes from './server/routes/authRoutes';
import patientRoutes from './server/routes/patientRoutes';
import doctorRoutes from './server/routes/doctorRoutes';
import bedRoutes from './server/routes/bedRoutes';
import pharmacyRoutes from './server/routes/pharmacyRoutes';
import analyticsRoutes from './server/routes/analyticsRoutes';
import departmentRoutes from './server/routes/departmentRoutes';
import messageRoutes from './server/routes/messageRoutes';
import adminRoutes from './server/routes/adminRoutes';
import medicalRecordRoutes from './server/routes/medicalRecordRoutes';
import labReportRoutes from './server/routes/labReportRoutes';
import labAppointmentRoutes from './server/routes/labAppointmentRoutes';
import wardRoutes from './server/routes/wardRoutes';
import taskRoutes from './server/routes/taskRoutes';
import ehrRoutes from './server/routes/ehrRoutes';
import medicineInventoryRoutes from './server/routes/medicineInventoryRoutes';
import appointmentRoutes from './server/routes/appointmentRoutes';
import advancedFeaturesRoutes from './server/routes/advancedFeaturesRoutes';
import iotRoutes from './server/routes/iotRoutes';
import cdssRoutes from './server/routes/cdssRoutes';
import chatbotRoutes from './server/routes/chatbotRoutes';
import productRoutes from './server/routes/productRoutes';
import verificationRoutes from './server/routes/verificationRoutes';
import commissionRoutes from './server/routes/commissionRoutes';
import { seedDatabase } from './server/seed';
import { initVerificationCron } from './server/services/verificationService';

async function startServer() {
  const app = express();
  
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Make io accessible to routes
  app.set('io', io);

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('trigger_emergency', (data) => {
      io.emit('emergency_alert', data);
    });

    socket.on('driver_location_update', (data) => {
      io.emit('ambulance_location_changed', data);
    });

    socket.on('rider_location_update', (data) => {
      io.emit('rider_location_changed', data);
    });

    // Video Call Signaling
    socket.on('join-video-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined video room ${roomId}`);
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('offer', ({ target, offer, roomId }) => {
      socket.to(target).emit('offer', { from: socket.id, offer });
    });

    socket.on('answer', ({ target, answer }) => {
      socket.to(target).emit('answer', { from: socket.id, answer });
    });

    socket.on('ice-candidate', ({ target, candidate }) => {
      socket.to(target).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('send-chat-message', ({ roomId, message, senderName }) => {
      io.to(roomId).emit('receive-chat-message', {
        id: Date.now().toString(),
        text: message,
        sender: senderName,
        senderId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('leave-video-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  mongoose.set('bufferCommands', false);
  
  if (MONGODB_URI && MONGODB_URI !== "mongodb+srv://<username>:<password>@cluster.mongodb.net/hospital") {
    mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
      .then(() => {
        console.log('✅ Connected to MongoDB');
        initVerificationCron();
        seedDatabase();
      })
      .catch(err => {
        console.error('❌ MongoDB connection error. Please check your MONGODB_URI environment variable:', err.message);
      });
  } else {
    console.error('❌ MONGODB_URI is missing or invalid in environment variables. The backend requires a valid MongoDB connection string to function.');
  }

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/beds', bedRoutes);
  app.use('/api/pharmacy', pharmacyRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/medical-records', medicalRecordRoutes);
  app.use('/api/lab-reports', labReportRoutes);
  app.use('/api/lab-appointments', labAppointmentRoutes);
  app.use('/api/wards', wardRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/ehr', ehrRoutes);
  app.use('/api/medicine-inventory', medicineInventoryRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/advanced', advancedFeaturesRoutes);
  app.use('/api/iot', iotRoutes);
  app.use('/api/cdss', cdssRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/verification', verificationRoutes);
  app.use('/api/commissions', commissionRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Global Error Handler:', err);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Synapse Health Server running at http://localhost:${PORT}`);
  });
}

startServer();
