const subscriptions = require('../models/subscription');
const subscriptionPlans = require('../models/subscriptionPlans');
const transactions = require('../models/transactions');
const cronJobCtr = require('./cronJobs');

const subscriptionCtr = {};

subscriptionCtr.createSubscriptionPlan = async(req, res) =>{
    try{
        const {masterUserId, discount, trialPeriod, noOfMonths, bundleDiscount, amount} = req.body;
        const subscriptionPlanData = {};

        subscriptionPlanData.masterUserId = masterUserId;
        subscriptionPlanData.discount = discount;
        subscriptionPlanData.trialPeriod = trialPeriod;
        subscriptionPlanData.isTrialApplicable = trialPeriod?true:false;
        subscriptionPlanData.noOfMonths = noOfMonths;
        subscriptionPlanData.bundleDiscount = bundleDiscount;
        subscriptionPlanData.amount = amount;
        subscriptionPlanData.isSubscriptionPlanActive = true;

        const subscriptionPlan = new subscriptionPlans(subscriptionPlanData);
        const newSubscriptionPlan = await subscriptionPlan.save();
        
        res.status(200).json(newSubscriptionPlan);
    }
    catch(err){
        console.log(err)
        res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });  
    }

}

subscriptionCtr.buySubscription = async(req, res) =>{
    try{
        let subscriptionObj = await createSubscription(req.body);

        let transactionObj = await createTransaction(subscriptionObj);

        cronJobCtr.startStatusCheckCronJob(req.body.MasterUserId, req.body.SubscriberId)

        res.status(200).json({subscription: subscriptionObj, transaction: transactionObj});
        
    }
    catch(err){
        console.log(err)
        res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });  
    }
}

subscriptionCtr.checkAndActivateTrial = async (req, res) =>{
    const {MasterUserId, SubscriberId, subscriptionId, subscriptionPlanId} = req.body;

    let isTrialApplicable = checkIfTrialApplicable(subscriptionId, subscriptionPlanId)
    
    if(isTrialApplicable == true){
        let trialPeriod = getTrialPeriod(subscriptionPlanId);
        activateTrial(subscriptionId, trialPeriod)
        cornJobCtr.startTrialStatusCheckCronJob(MasterUserId, SubscriberId)
    }
    else if(isTrialApplicable == false){
        res.status(200).json({ "message": "Trial Not Applicable", isTrialApplicable: isTrialApplicable });
    }
    else 
        res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });
}

//update details (like subscription amount etc) of subsription plan by master (userB in our example) 
//so that other users can buy new plan to chat with him/her
subscriptionCtr.updateSubscriptionPlan = (req, res) =>{
    const updateObj = req.body.updateObj
    const subscriptionPlanId = req.body.subscriptionPlanId
    subscriptionPlans.findOneAndUpdate({
        _id: subscriptionPlanId
    },
        {$set: updateObj}
    )
    .then((data)=>{
        console.log("subscription status updated")
        res.status(200).json(data);
    })
    .catch((err)=>{
        console.log("Error updating subscription plan",err)
        res.status(500).json({error: 'ERR_INTERNAL_SERVER'});
    })
}

///////////////////////////////////// -------Helper Functions----------- ////////////////////////////////////////////

const activateTrial = (subscriptionId, trialPeriod ) =>{
    subscriptions.findOneAndUpdate(
        {_id: subscriptionId}, 
        {$set: {isTrialActive: true, isTrialUsed: true, trialPeriod:trialPeriod}})
    .then((subscriptionData)=>{
        res.status(200).json({ subscriptionData });
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });
    })
}

//check if trial applicable
const checkIfTrialApplicable = (subscriptionId) =>{
    subscriptions.find({_id: subscriptionId})
    .then((subscriptionData)=>{
        if(subscriptionData.length==0){
            return false
        }
 
        else if(subscriptionData[0].isSubscriptionActive || subscriptionData[0].isTrialUsed == true){
            return false
        }
        
        else 
            return true;
    })
    .catch((err)=>{
        console.log(err)
        return err;
    })
}

const createTransaction = async(subscriptionObj) =>{
    try {
        const transactionData = {};
        transactionData.subscriptionId = subscriptionObj.subscriptionId;
        transactionData.subscriberId = subscriptionObj.subscriberId;
        transactionData.transactionStatus = "success";
        transactionData.amount = await getTransactionAmount(subscriptionObj.subscriptionPlanId);

        const transaction = new transactions(transactionData);
        return await transaction.save();
        
    } catch (err) {
        console.log(err)
        throw err;
    }
}

const createSubscription = async(reqObj) =>{
    try {
        const {MasterUserId, SubscriberId, subscriptionPlanId} = reqObj
        let subscriptionData = {};
        let subscriptionPlanInfo = await subscriptionPlans.findById(subscriptionPlanId);

        subscriptionData.subscriptionPlanId = subscriptionPlanId;
        subscriptionData.subscriptionPlanPeriod = subscriptionPlanInfo.noOfMonths;
        subscriptionData.subscriberId = SubscriberId;
        subscriptionData.masterUserId = MasterUserId;
        subscriptionData.isSubscriptionActive = true;
        subscriptionData.isTrialActive = null;
        subscriptionData.isTrialUsed = null;
        subscriptionData.trialStartedOn = null;
        subscriptionData.trialPeriod = null;

        const subscription = new subscriptions(subscriptionData);

        return await subscription.save();
    } catch (err) {
        console.log(err);
        throw err;
    }
    
}

const getTrialPeriod = (subscriptionPlanId) =>{
    subscriptionPlans.findById(subscriptionPlanId)
    .then((plan)=>{
        return plan.trialPeriod
    })
}

const getTransactionAmount = async(subscriptionPlanId) =>{
    let totalDiscount = 0;
    subscriptionPlans.findById(subscriptionPlanId)
    .then((plan)=>{
        let today = Date.now();
        let planDiscountArray = plan.discount;
        if(planDiscountArray.length > 0){
            planDiscountArray.forEach(discount => {
                if(discount.isDiscountActive && (discount.startPeriod <= today || discount.endPeriod >= today)){
                    totalDiscount +=  discount.discountPercent
                }
            });
        }

        totalDiscount += bundleDiscount;
        let originalPrice = plan.amount;
        let totalAmountToBePayed = originalPrice - (totalDiscount * originalPrice * 0.01)
        
        return totalAmountToBePayed;
    }) 
}

module.exports = subscriptionCtr;