const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mapRoutes = require('./routes/mapRoutes');
const clientRoutes = require('./routes/clientRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const productRoutes = require('./routes/productsRoutes'); // Adjust the path as necessary
const pendingTasksRoutes = require('./routes/pendingTaskRoutes');

const collectorRoutes = require('./routes/collectorRoutes');


// Import middleware
const authenticate = require('./middleware/authenticate');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Setup CORS to allow all connections
app.use(cors());

const io = socketio(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO connections
    methods: ["GET", "POST"] // Specify methods to allow
  }
});
require('./configurations/socket')(io);

// JSON parsing middleware
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/maps', mapRoutes); // Assuming mapRoutes expects '/api/maps'
app.use('/api/clients', clientRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/pendingtasks', pendingTasksRoutes);
app.use('/api/products', productRoutes);
app.use('/api/collectors', collectorRoutes);



// Static directory for uploads
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
