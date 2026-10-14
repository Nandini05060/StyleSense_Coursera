import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { getDatabaseStatus } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import outfitRoutes from './routes/outfitRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wardrobeRoutes from './routes/wardrobeRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(cookieParser());

// Static file serving for safe uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logger
app.use((req, res, next) => {
  if (config.isDev && !req.path.startsWith('/api/health')) {
    console.log(`[HTTP] ${req.method} ${req.path}`);
  }
  next();
});

// Health & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.status(200).json({
    status: 'online',
    appName: 'StyleSense AI Fashion Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wardrobe', wardrobeRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/advisor', advisorRoutes);

// 404 Fallback for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
