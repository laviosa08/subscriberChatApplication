const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionPlansSchema = new Schema({
    masterUserId: { type: String}, //user id ( as per our example, userId of userB ) who provides this subscription plan to other users in order to chat with him/her
    isSubscriptionPlanActive: { type: Boolean},
    discount:{type:Array},//JSON Array with isDiscountActive, discountPercent, startPeriod, endPeriod
    trialPeriod: {type: Number, default: 0}, //Number of days for trial period of plan.
    isTrialApplicable: {type: Boolean},
    noOfMonths : { type: Number},
    bundleDiscount: {type: Number}, 
    amount: {type: Number}
}, { collection: 'subscriptionPlans', timestamps: true });

const subscriptionPlans = mongoose.model('subscriptionPlans', subscriptionPlansSchema);
module.exports = subscriptionPlans; 