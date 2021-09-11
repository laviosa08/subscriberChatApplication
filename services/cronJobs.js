const CronJob = require('cron').CronJob;
const subscriptions = require('../models/subscription');

const cronJobCtr = {};

cronJobCtr.startStatusCheckCronJob = (masterUserId, subscriberId) =>{
    //corn job to check if user's subscription has expired and update isSubscriptionActive
    var subscriptonStatusJob = new CronJob({
        cronTime: '0 1 * * *', // every 24 hours
        onTick: function() {
            let subscriptionObj = checkDaysLeftToExpire(masterUserId, subscriberId);
            let daysLeftToExpire = subscriptionObj.daysLeft;
            let subscriptionId = subscriptionObj.subscriberId;
            //SEND NOTIFICATION TO RENEW BEFORE EXPIRY
            if(daysLeftToExpire == 7 || daysLeftToExpire == 3 || daysLeftToExpire == 1 || daysLeftToExpire == 0){
                sendSubscriptionRenewalNotification(daysLeftToExpire);
                if(daysLeftToExpire == 0){
                    updateStatusIfSubscriptionEnded(subscriptionId)
                }
            }
            //SEND NOTIFICATION TO RENEW POST EXPIRY
            if(daysLeftToExpire == -1 || daysLeftToExpire == -3 || daysLeftToExpire == -7){
                checkIfSubscriptionRenewed(masterUserId, subscriberId, daysLeftToExpire);
            } 

            if(daysLeftToExpire < -7){
                subscriptonStatusJob.stop();
            }
        }
    });
        
    subscriptonStatusJob.start();
}


cronJobCtr.startTrialStatusCheckCronJob = (masterUserId, subscriberId) =>{
    var trialStatusJob = new CronJob({
        cronTime: '0 1 * * *', // every 24 hours
        onTick: function() {
            let subscriptionObj =  checkDaysLeftToExpireTrial(masterUserId, subscriberId);
            let daysLeftToExpire = subscriptionObj.trialPeriod - subscriptionObj.daysLeft;
            let subscriptionId = subscriptionObj.subscriberId;
            //SEND NOTIFICATION TO RENEW BEFORE EXPIRY
            if(daysLeftToExpire == 1 || daysLeftToExpire == 0){
                sendNotificationToRenew(daysLeftToExpire);
                if(daysLeftToExpire == 0){
                    updateTrialStatusIfTrialEnded(subscriptionId)
                }
            }
    
            if(daysLeftToExpire == 0){
                trialStatusJob.stop();
            }
        }
    });

    trialStatusJob.start();
}

const updateStatusIfSubscriptionEnded = (subscriptionId) => {
    subscriptions.findOneAndUpdate({
       subscriptionId: subscriptionId
    },
    {$set: {isSubscriptionActive: false}})
    .then((data)=>{
        console.log("subscription status updated",data)
    })
    .catch((err)=>{
        console.log("Error updating subscription status",err)
    })
}

const updateTrialStatusIfTrialEnded = (subscriptionId)=>{
    subscriptions.findOneAndUpdate({
        subscriptionId: subscriptionId
    },
    {$set: {isTrialActive: false, isTrialUsed: true }})
    .then((data)=>{
        console.log("Trial status updated", data)
    })
    .catch((err)=>{
        console.log("Error updating subscription status", err)
    })

}

const checkIfSubscriptionRenewed = (masterUserId, subscriberId, daysLeftToExpire) =>{
    subscriptions.find({
        $and:[{masterUserId: masterUserId},{subscriberId: subscriberId},{isSubscriptionActive:true}]
    })
    .then((subscription)=>{
        if(subscription.length > 0)
            return {subscriptionId:subscription[0]._id, "subscriptionRenewed": true};
        else
            sendSubscriptionRenewalNotification(daysLeftToExpire);
    })
    .catch((err)=>{
        console.log(err);
        return null;
    })
}

const sendSubscriptionRenewalNotification = (daysLeftToExpire) =>{
    //send notification using any third party system like firebase
    console.log("notification sent",daysLeftToExpire);
}

const checkDaysLeftToExpire = (masterUserId, subscriberId) =>{
    subscriptions.find({
        $and:[{masterUserId: masterUserId},{subscriberId: subscriberId},{isSubscriptionActive:true}]
    },
    {subscriptionPlanPeriod:1, createdAt:1, _id:1}
    )
    .then((subscription)=>{
        var d1 = new Date(subscription[0].createdAt);
        var d2 = new Date().toISOString();
        return {daysLeft:(d2-d1)/(1000*3600*24), subscriptionId:subscription[0]._id};
    })
    .catch((err)=>{
        console.log(err);
        return null;
    })
    
}

const checkDaysLeftToExpireTrial = (masterUserId, subscriberId) =>{
    subscriptions.find({
        $and:[{masterUserId: masterUserId},{subscriberId: subscriberId},{isTrialActive:true}]
    },
    {trialPeriod:1, trialStartedOn:1, _id:1}
    )
    .then((subscription)=>{
        var d1 = new Date(subscription[0].trialStartedOn);
        var d2 = new Date().toISOString();
        return {daysLeft:(d2-d1)/(1000*3600*24), subscriptionId:subscription[0]._id, trialPeriod: trialPeriod};
    })
    .catch((err)=>{
        console.log(err);
        return null;
    })
    
}

module.exports = cronJobCtr;