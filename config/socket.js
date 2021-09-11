const Chat = require('../models/chat')

let socketIo;

const inviteServer = (io) => {
    socketIo = io;
    io.sockets.use((socket, next) => {
      const _socket = socket;
    }).on('connection', (socket) => {
        try {
            const subscriberId = socket.user.userId;
            const masterUserId = socket.user.userId;
            
            //chat socket
            socket.on('sendMessage', (data) => {
                logger.info(`-*- sendMessage: ${data.message}`);
                const chatData = {
                  userId: data.userId,
                  subscriptionId: data.subscriptionId,
                  subscriberId: data.subscriberId,
                  masterUserId: data.masterUserId,
                  message: data.message
                };
                userUtils.getUser({ _id: ObjectId(data.userId) }).then((user) => {
                  const chat = new Chat(chatData);
                  chat.save();
                  chatData.user = user;
                  io.sockets.in(`${data.subscriptionId}`).emit('brodcastMessage', chatData);
                }).catch((err) => {
                  console.log(err);
                });
            });
        } catch (error) {
          console.log(error);
        }
    });
}  

const getSocketIo = () => {
	return socketIo;
};

module.exports = { inviteServer, getSocketIo };
