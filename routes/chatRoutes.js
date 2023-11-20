const express = require('express');
const Chat = require('../models/chatModel'); // Your Chat model
const Message = require('../models/messageModel'); // Your Message model
const router = express.Router();

// Route to start a new chat or return an existing chat
router.post('/start', async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs participating in the chat
    // Check if a chat with these users already exists
    let chat = await Chat.findOne({ participants: { $all: userIds } });
    if (!chat) {
      // If not, create a new chat
      chat = new Chat({ participants: userIds });
      await chat.save();
    }
    res.status(201).json({ chatId: chat._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get all chats
router.get('/', async (req, res) => {
    try {
      // Fetch all chats, possibly with some pagination logic
      const chats = await Chat.find().populate('participants lastMessage');
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// Assuming your Chat model has a 'lastMessage' field that stores the ID of the last message

// Route to get all chats for a specific user, including the last message content
router.get('/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const chats = await Chat.find({ participants: userId })
        .populate('lastMessage') // Populating the last message content based on the ID
        .exec();
  
      // Optionally, if your messages reference other collections (e.g., sender), you can further populate those as well
      const chatsWithLastMessageDetails = await Message.populate(chats, { path: 'lastMessage.sender' });
  
      res.json(chatsWithLastMessageDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  
  


module.exports = router;
