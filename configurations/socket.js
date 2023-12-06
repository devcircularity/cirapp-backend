// configurations/socket.js

// Ensure that Message is imported correctly at the top
const Message = require('../models/Message'); // Adjust the path as needed

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinChat', (chatId) => {
      socket.join(chatId); // Join the chat room
    });

    socket.on('sendMessage', async ({ chatId, senderId, text }) => {
      console.log('Received message data:', { chatId, senderId, text }); // Log for debugging    
      try {
        const newMessage = await Message.create({ chat: chatId, sender: senderId, text });
        // Emit the message to everyone in the room except the sender
        socket.to(chatId).emit('message', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
