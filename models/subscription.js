const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionsSchema = new Schema({
    subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subscriptionPlans',
        required: true 
    },

    subscriptionPlanPeriod: {
        type: Number
    }, //number of days of subscription plan

    subscriberId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },

    masterUserId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
     }, //id of user subscribed to (in our example : userB)

    isSubscriptionActive: { type: Boolean},

    isTrialActive : { type: Boolean },

    isTrialUsed: { type: Boolean },
    
    trialStartedOn: { type:Date, default: Date.now()},
    
    trialPeriod: { type: Number } //number of days of free trial.
    
}, { collection: 'subscriptions', timestamps: true });

const subscriptions = mongoose.model('subscriptions', subscriptionsSchema);
module.exports = subscriptions; 