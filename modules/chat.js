const express = require('express');
const chatCtr = require('../services/chat');

const chatRouter = express.Router();

//GET APIs
chatRouter.get('/:chatId', chatCtr.getMessages);

//chat message exchange is done using socket.io in config/socket.js

module.exports = chatRouter;
