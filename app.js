// Environment variables
require('dotenv').config()

require('./config/database.js');

const app = require('express')();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.set('port', process.env.SERVER_PORT);
app.use(bodyParser.urlencoded({extended: true }));

// Express Settings
app.set('port', process.env.ServerPort);

// Start server
const server = app.listen(
	process.env.PORT || process.env.SERVER_PORT, '0.0.0.0', () => {
	console.log(`Express server listening on port ${process.env.SERVER_PORT}`);
});

// CORS-Handeling
app.all('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Request-Headers', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Access-Control-Allow-Headers, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
    } else {
      next();
    }
  });

// Router
app.use('/', require('./routes/apiRoutes'));

app.all('/*', (req, res) => {
  return res.status(400).json({
    error: 'ERR_URL_NOT_FOUND',
  });
});

// SOCKET
const socketIo = require('socket.io')(server);
const IO = socketIo.listen(server, {
  transports: ['websocket', 'polling'],
});
const socketServer = require('./config/socket.js');

socketServer.inviteServer(IO);