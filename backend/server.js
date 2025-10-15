const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Load environment variables
dotenv.config();

// Import utilities
const logger = require('./utils/logger');

// Import routes
const taskRoutes = require('./routes/tasks');

// Initialize express app
const app = express();

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Task Planner API',
      version: '1.0.0',
      description: 'AI-powered task planning and management system',
      contact: {
        name: 'Smart Task Planner',
        email: 'support@smarttaskplanner.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Tasks',
        description: 'Task management operations'
      },
      {
        name: 'Goals', 
        description: 'Goal management operations'
      },
      {
        name: 'Dashboard',
        description: 'Analytics and dashboard data'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for Swagger UI
}));

// Performance middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));

// Custom request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logAPIRequest(req, res, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Smart Task Planner API',
  customfavIcon: '/favicon.ico'
}));

// API Routes
app.use('/api/tasks', taskRoutes);

// API Testing Dashboard Route
app.get('/api-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Task Planner - API Testing Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background-color: #f8f9fa; }
            .api-card { border-left: 4px solid #007bff; }
            .method-GET { color: #28a745; }
            .method-POST { color: #007bff; }
            .method-PUT { color: #fd7e14; }
            .method-PATCH { color: #ffc107; }
            .method-DELETE { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="container mt-5">
            <h1 class="text-center mb-5">🚀 Smart Task Planner API</h1>
            <div class="row">
                <div class="col-md-6">
                    <div class="card api-card mb-4">
                        <div class="card-header">
                            <h5><span class="method-POST">POST</span> /api/tasks/generate</h5>
                        </div>
                        <div class="card-body">
                            <p>Generate AI-powered tasks from a goal</p>
                            <textarea class="form-control mb-2" rows="4" placeholder='{"goalText": "Launch a mobile app", "category": "project", "priority": "high"}'></textarea>
                            <button class="btn btn-primary" onclick="testAPI('POST', '/api/tasks/generate', this.previousElementSibling.value)">Test</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card api-card mb-4">
                        <div class="card-header">
                            <h5><span class="method-GET">GET</span> /api/tasks/goals</h5>
                        </div>
                        <div class="card-body">
                            <p>Get all goals</p>
                            <button class="btn btn-success" onclick="testAPI('GET', '/api/tasks/goals')">Test</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card api-card mb-4">
                        <div class="card-header">
                            <h5><span class="method-GET">GET</span> /api/tasks/dashboard/analytics</h5>
                        </div>
                        <div class="card-body">
                            <p>Get dashboard analytics</p>
                            <button class="btn btn-success" onclick="testAPI('GET', '/api/tasks/dashboard/analytics')">Test</button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card api-card mb-4">
                        <div class="card-header">
                            <h5><span class="method-GET">GET</span> /health</h5>
                        </div>
                        <div class="card-body">
                            <p>Health check</p>
                            <button class="btn btn-success" onclick="testAPI('GET', '/health')">Test</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4">
                <h3>API Response:</h3>
                <pre id="response" class="bg-dark text-light p-3 rounded" style="max-height: 400px; overflow-y: auto;">Click any "Test" button to see API responses here...</pre>
            </div>
            
            <div class="text-center mt-4">
                <a href="/api-docs" class="btn btn-outline-primary me-3">📚 Full API Documentation</a>
                <a href="http://localhost:3000" class="btn btn-outline-success">🎯 Frontend Application</a>
            </div>
        </div>

        <script>
            async function testAPI(method, endpoint, body = null) {
                const response = document.getElementById('response');
                response.textContent = 'Loading...';
                
                try {
                    const options = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    };
                    
                    if (body && method !== 'GET') {
                        options.body = body;
                    }
                    
                    const res = await fetch(endpoint, options);
                    const data = await res.json();
                    
                    response.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    response.textContent = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Serve static files in production (Railway deployment)
if (process.env.NODE_ENV === 'production') {
  // Serve React build files
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing - send all non-API routes to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/api-docs') || req.path.startsWith('/api-test') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  logger.warn('404 - API Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({
    success: false,
    message: 'API route not found',
    path: req.originalUrl 
  });
});

// 404 handler for other routes  
app.use('*', (req, res) => {
  logger.warn('404 - Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: {
      'API Documentation': '/api-docs',
      'API Testing': '/api-test', 
      'Health Check': '/health',
      'Generate Tasks': 'POST /api/tasks/generate',
      'Get Goals': 'GET /api/tasks/goals',
      'Analytics': 'GET /api/tasks/dashboard/analytics'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.logError(error, { 
    url: req.originalUrl, 
    method: req.method,
    body: req.body 
  });
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { error: error.message })
  });
});

// MongoDB connection with enhanced logging
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-task-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ MongoDB connected successfully', {
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  });
})
.catch(err => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Smart Task Planner API Server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      'Frontend': `http://localhost:3000`,
      'API Docs': `http://localhost:${PORT}/api-docs`,
      'API Test': `http://localhost:${PORT}/api-test`,
      'Health': `http://localhost:${PORT}/health`
    }
  });
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    logger.logError(error, { context: 'Server startup' });
    throw error;
  }
});

module.exports = app;