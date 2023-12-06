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
      console.log('Received message data:', { chatId, senderId, text });
      try {
        const newMessage = await Message.create({ chat: chatId, sender: senderId, text });
        // Use `io.to(chatId).emit` instead of `socket.to(chatId).emit` to include the sender.
        io.to(chatId).emit('message', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
