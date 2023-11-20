const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Additional fields like chat name, if it's a group chat, etc.
  chatName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
