const mongoose = require('mongoose');
const Schema = mongoose.Schema; // You need to add this line to import Schema

const messageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;