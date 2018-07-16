const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let messages = [];
let users = [];

app.get('/', (req, res) => {
    res.send('Choose routes /io OR /ajax');
})

app.get('/io', (req, res) => {
    res.sendFile(__dirname + '/index_io.html');
})

app.get('/ajax', (req, res) => {
    res.sendFile(__dirname + '/index_ajax.html');
});

app.get('/script_io.js', (req, res) => {
    res.sendFile(__dirname + '/script_io.js');
});

app.get('/script_ajax.js', (req, res) => {
    res.sendFile(__dirname + '/script_ajax.js');
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});

app.get('/messages', (req, res) => {
    res.json(messages);
});

app.post('/messages', (req, res) => {
    messages.push(req.body);
    res.sendStatus(200);
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    users.push(req.body);
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    let user = {};
    user.id = socket.id;

    socket.on('auth', (data) => {
        user.name = data.name;
        user.nickname = data.nickname;
        user.status = 'just-appeared';
        users.push(user);
        io.emit('pasrticipants', users);
        socket.emit('chat history', messages);  

        setTimeout(() => {
            users.map(elem => {
                if (elem.id === socket.id) user.status = 'online';
            });
            io.emit('pasrticipants', users);
        }, 60 * 1000);
    });
    
    socket.on('chat message', (body) => {
        let message = {
            body: body,
            user: user,
            type: 'ordinary',
            time: getNow()
        };
        messages.push(message);
        socket.broadcast.emit('chat message', message);
        socket.emit('own message', message);
    });
    
    socket.on('typing', () => {
        socket.broadcast.emit('typing', user.name);
    });

    socket.on('not typing', () => {
        socket.broadcast.emit('not typing');
    });

    socket.on('disconnect', () => {
        let message = {
            type: 'left',
            body: user.name + ' left the chat <i class="fas fa-sign-out-alt"></i>',
            user: ''
        };
        messages.push(message);
        io.emit('chat message', message);

        users.map(elem => {
            if (elem.id === socket.id) user.status = 'just-left';
        });
        io.emit('pasrticipants', users);

        setTimeout(() => {
            users.map(elem => {
                if (elem.id === socket.id) user.status = 'offline';
            });
            io.emit('pasrticipants', users);
        }, 60 * 1000);
    });
});

http.listen(3000, () => {
    console.log('listening on 3000');
});

function getNow(){
    let now = new Date();
    let str = now.getHours() + ':' + now.getMinutes();
    return str;
}