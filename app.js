var express = require('express'),
    routes = require('./routes.js'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    _ = require('underscore'),
    clients = [],
    points = 0,
    active = false;

var app = express();

app.configure('development', function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.errorHandler());
});

app.get('/', routes.index);

server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

io = io.listen(server);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {

    if(active) {
        socket.emit('joinDecline');
    } else {
        clients.push({'user': socket.id, 'points': 0});
        socket.emit('joinAccept');
    }

    socket.on('start', function(data){
        active = true;
        io.sockets.emit('startGame', {players: clients});
    });

    socket.on('square', function (data) {
        _.each(clients, function(num, key){
            if(socket.id === num.user) {
                clients[key].points++;
            }
        });
        points++;
        io.sockets.emit('show', {square: data.square, players: clients});
        //console.log(points);
        if(points === 408) {
            io.sockets.emit('gameOver', {data: clients});
            resetGame();
        }
    });

    socket.on('disconnect', function() {
        _.each(clients, function(num, key){
            if(socket.id === num.user) {
                clients.splice(key, 1);
            }
        });
         if(clients.length === 0 ) {
             resetGame();
         }
    });

    function resetGame() {
        points = 0;
        active = false;
        clients = [];
    }
});