const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    }, //id of the user who sent the message

    subscriptionId: {
        type: Schema.ObjectId
    }, //id of subscriber in this chat

    subscriberId: { 
        type: Schema.ObjectId
    }, //id of subscriber in this chat

    masterUserId: {
        types: Schema.ObjectId
    }, //id of master user to whom subscriber is subscribed to (userB in this example)
    
    message: { 
        type: String 
    }

}, { collection: 'transactions', timestamps: true });

const chats = mongoose.model('chats', chatSchema);

module.exports = chats; 