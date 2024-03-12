const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const router = express.Router();

// Start a new chat
router.post('/', async (req, res) => {
  try {
    console.log(req.body); // Log the request body to debug
    const { members } = req.body;
    const newChat = new Chat({ members });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




// Send a message
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { sender, text } = req.body;
    const newMessage = new Message({ chat: chatId, sender, text });
await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all chats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ members: userId }).populate('members', 'fullName avatar');
    
    console.log('Fetched chats:', chats); // Log the fetched chats

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: error.message });
  }
});


// Get all messages within a chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
                                  .populate('sender', '_id fullName avatar'); // Make sure to populate the sender
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all chats for a user
// Get all chats for a user and include the other user's details
router.get('/user/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      // Fetch chats where the user is a member
      let chats = await Chat.find({ members: { $in: [userId] } })
                            .populate('members', '_id fullName avatar');

      // Transform the chats to include the other user's details
      chats = chats.map(chat => {
          const otherUser = chat.members.find(member => member._id.toString() !== userId.toString());
          return {
              ...chat.toObject(),
              otherUser: otherUser ? {
                  _id: otherUser._id,
                  fullName: otherUser.fullName,
                  avatar: otherUser.avatar
              } : null // In case there's no other user or the chat is a group chat
          };
      });

      res.json(chats);
  } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ message: error.message });
  }
});




module.exports = router;