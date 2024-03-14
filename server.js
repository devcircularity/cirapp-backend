const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mapRoutes = require('./routes/mapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const clientRoutes = require('./routes/clientRoutes');
const pendingTasksRoutes = require('./routes/pendingTaskRoutes');

// Import middleware
const authenticate = require('./middleware/authenticate');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3000", "https://vulgo-6d8e3.web.app"], // Allow multiple frontend origins
    methods: ["GET", "POST"] // Allow only these methods for socket.io
  }
});
require('./configurations/socket')(io);

// CORS configuration
const whitelist = ['http://localhost:3000', 'https://vulgo-6d8e3.web.app'];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS options here
app.use(cors(corsOptions));

// JSON parsing middleware
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/pendingtasks', pendingTasksRoutes);
app.use(mapRoutes);

// Static directory for uploads
app.use('/uploads', express.static('uploads'));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions)); // Enable pre-flight request for CORS

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
