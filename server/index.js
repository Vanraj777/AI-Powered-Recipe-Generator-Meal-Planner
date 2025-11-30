const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Log environment variables (without exposing sensitive data)
console.log('🔧 Environment Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   PORT:', process.env.PORT || 5000);
console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.length} chars)` : 'NOT SET');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'recipe_generator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Make pool available for routes
global.pool = pool;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Initialize passport
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const mealPlanRoutes = require('./routes/mealPlans');
const ingredientRoutes = require('./routes/ingredients');
const nutritionRoutes = require('./routes/nutrition');
const shoppingListRoutes = require('./routes/shoppingList');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Recipe Generator API is running' });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// WebSocket connection for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('cooking-assistance', (data) => {
    // Real-time cooking assistance
    socket.emit('cooking-tip', { tip: 'Add ingredients gradually for better mixing' });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your database configuration in server/.env');
  });

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Production mode: Serving React app from /public`);
  }
});

// Export for testing
module.exports = { app, pool, io };

