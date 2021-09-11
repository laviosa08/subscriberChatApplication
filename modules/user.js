const express = require('express');
const userCtr = require('../services/user');

const userRouter = express.Router();

//GET APIs
userRouter.get('/isSubscribed',userCtr.checkIfSubscribed)


module.exports = userRouter;
