const User = require('../models/userModel');
const Conversation = require('../models/Conversation');

exports.findPeople = async (req, res) => {
  let { s } = req.query;
  s = s || '';
  try {
    const result = await User.find({ username: new RegExp(s, 'i') })
      .select('-password')
      .lean();
    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ message: 'Server error when searching user' });
  }
};

exports.getConversation = async (req, res) => {
  const { id1, id2 } = req.query;
  if (!id1 || !id2) return res.status(400).json({ message: 'Missing userId' });

  let sortedIds = [id1, id2].sort();
  try {
    let conversation = await Conversation.findOne({
      firstId: sortedIds[0],
      secondId: sortedIds[1]
    }).lean();

    if (!conversation) {
      const [firstUser, secondUser] = await Promise.all([
        User.findById(sortedIds[0]).lean(),
        User.findById(sortedIds[1]).lean()
      ]);

      if (!firstUser || !secondUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      conversation = new Conversation({
        firstId: sortedIds[0],
        secondId: sortedIds[1],
        firstUserName: firstUser.username,
        secondUserName: secondUser.username
      });

      await conversation.save();
      conversation = conversation.toObject();
    }

    res.status(200).json({ conversation });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error when processing conversation' });
  }
};

exports.getConversationList = async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'No user ID provided' });

  try {
    const listConversation = await Conversation.find({
      $or: [{ firstId: id }, { secondId: id }],
      lastMessage: { $ne: '' }
    })
      .select('-messages')
      .sort({ lastUpdate: -1 })
      .lean();

    res.status(200).json({ list: listConversation });
  } catch (err) {
    res.status(500).json({ message: 'Server error when retrieving conversation list' });
  }
};

exports.getMessages = async (req, res) => {
  const { cid } = req.query;
  if (!cid) return res.status(400).json({ message: 'Missing conversation ID' });

  try {
    const conversation = await Conversation.findById(cid).select('messages').lean();
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    res.status(200).json({ messageList: conversation.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error when retrieving messages' });
  }
};

exports.sendMessage = async (req, res) => {
  const { cid, content, uid, username } = req.body;
  if (!cid || !content || !uid)
    return res.status(400).json({ message: 'Missing required data' });

  try {
    const conversation = await Conversation.findById(cid);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const currentTime = Date.now();
    const newMessage = {
      ofUser: uid,
      content: content,
      time: currentTime
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = content;
    conversation.lastSender = username;
    conversation.lastUpdate = currentTime;

    await conversation.save();
    res.status(200).json({
      message: 'Message sent successfully',
      newMessage,
      conversation: conversation.toObject()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error when sending message' });
  }
};
