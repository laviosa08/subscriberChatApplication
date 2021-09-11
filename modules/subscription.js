const express = require('express');
const subscriptionCtr = require('../services/subscription');

const subscriptionRouter = express.Router();

//POST APIs
subscriptionRouter.post('/buySubscription',subscriptionCtr.buySubscription);
subscriptionRouter.post('/activateTrial',subscriptionCtr.checkAndActivateTrial);
subscriptionRouter.post('/createSubscriptionPlan',subscriptionCtr.createSubscriptionPlan);
subscriptionRouter.post('/updateSubscriptionPlan',subscriptionCtr.updateSubscriptionPlan);

module.exports = subscriptionRouter;
