const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const passport = require('passport');
const authenticate = passport.authenticate('jwt', { session: false });

router.get('/search', authenticate, chatController.findPeople);
router.get('/conversation', authenticate, chatController.getConversation);
router.get('/get-messages', authenticate, chatController.getMessages);
router.get(
  '/conversation-list',
  authenticate,
  chatController.getConversationList
);
router.post('/send-message', authenticate, chatController.sendMessage);

module.exports = router;
