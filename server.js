const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mapRoutes = require('./routes/mapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const clientRoutes = require('./routes/clientRoutes');
const pendingTasksRoutes = require('./routes/pendingTaskRoutes');

// Import middleware
const authenticate = require('./middleware/authenticate');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const whitelist = ['http://localhost:3000', 'https://jutdo-7b90f.web.app'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS options here
app.use(cors(corsOptions));

// JSON parsing middleware
app.use(express.json());

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
app.use('/api/messages', messageRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/pendingtasks', pendingTasksRoutes);
app.use(mapRoutes);

// Static directory for uploads
app.use('/uploads', express.static('uploads'));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
