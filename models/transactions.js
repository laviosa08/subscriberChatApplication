const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subscriptions',
        required: true 
    },
    subscriberId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true 
    },
    transactionStatus: { type: String}, //Success or Pending or Failed
    amount: {type: Number}
}, { collection: 'transactions', timestamps: true });

const transactions = mongoose.model('transactions', transactionSchema);

module.exports = transactions; 