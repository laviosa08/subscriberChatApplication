const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String},
    isSubscriber: { type: Boolean},
    isMaster: {type:Boolean},
}, { collection: 'users', timestamps: true });

const users = mongoose.model('users', userSchema);
module.exports = users; 