const users = require('../models/user');
const subscriptions = require('../models/subscription')

const userCtr = {};

userCtr.checkIfSubscribed = (req,res) => {
    //userId of user whom subscriber wants to chat (userId of user B as per our example)
    const { masterUserId, subscriberId }= req.body;

    subscriptions.find({
        $AND: [
            {masterUserId: masterUserId},
            {subscriberId: subscriberId}
        ]
    },{isSubscriptionActive: 1, _id:1})
    .then((status) => {
        if(status.length ==0)
            return res.status(200).json({ isSubscriptionActive : "false", "message": "No subscription exist. Please Subscribe to chat" })
        else if(status[0].isSubscriptionActive == true)
            return res.status(200).json({
                isSubscriptionActive : status[0].isSubscriptionActive, 
                subscriptionId: status[0]._id
            });
        
        else
            return res.status(200).json({ 
                isSubscriptionActive : status[0].isSubscriptionActive, 
                subscriptionId: status[0]._id,
                "message":"Subscription expired. Please Renew Subscription."
            });

    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });
    })
}


module.exports = userCtr;