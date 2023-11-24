// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const http = require('http');

const firebaseAdmin = require('./firebaseAdmin');
const taskRoutes = require('./routes/taskRoutes'); // Make sure this path is correct
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mapRoutes = require('./routes/mapRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const clientRoutes = require('./routes/clientRoutes'); 
const pendingTasksRoutes = require('./routes/pendingTaskRoutes'); // Update path as needed
const corsOptions = {
  origin: 'https://jutdo-7b90f.web.app',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const authenticate = require('./middleware/authenticate');

require('dotenv').config();
console.log(process.env.PORT);

const corsMiddleware = cors(corsOptions);

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app); // Step 3: Create an HTTP server
const io = socketio(server, {
  cors: {
    origin: "https://jutdo-7b90f.web.app/", // Replace with your front-end URL
    methods: ["GET", "POST"]
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
  console.log('Cloudinary API Key:', process.env.CLOUDINARY_API_KEY);

});

// Step 5: Setup socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Handle chat message event
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // This will emit the event to all connected sockets
  });
});


// Use routes for users
app.use('/api/users', userRoutes);
// Use routes for tasks
app.use('/api/tasks', taskRoutes); 

app.use('/api/jobs', jobRoutes);

app.use('/api/reports', corsMiddleware, reportRoutes); // Apply CORS only to this route

app.use('/uploads', express.static('uploads'));

app.use('/api/chats', chatRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/clients', clientRoutes);

app.use('/api', pendingTasksRoutes);

app.use(mapRoutes);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
