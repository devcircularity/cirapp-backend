const express = require('express');
const Chat = require('../models/chatModel'); // Your Chat model
const Message = require('../models/messageModel'); // Your Message model
const router = express.Router();

// Route to send a new message
router.post('/', async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;
    const message = new Message({
      chat: chatId,
      sender: senderId,
      text: text
    });
    await message.save();

    // Update the chat's last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get messages for a chat
router.get('/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
