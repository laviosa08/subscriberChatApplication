const chat = require('../models/chat');

const { ObjectId } = require('mongoose').Types;
const chatCtr = {};

chatCtr.getMessages = (req, res) => {
    const aggregate = [{
      $match: {
        _id: ObjectId(req.params.chatId),
      },
    }, {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    }, {
      $group: {
        _id: '$_id',
        message: { $first: '$message' },
        user: {
          $first: {
            _id: '$user._id',
            userName: '$user.userName',
          },
        },
        createdAt: { $first: '$createdAt' },
      },
    }, { $sort: { createdAt: 1 } }];
  
    chat.aggregate(aggregate).then((messages) => {
      return res.status(200).json({ messages });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'ERR_INTERNAL_SERVER' });
    });
  };
  
  module.exports = chatCtr;