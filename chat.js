var PORT = 8008,
    options = {},
    messages = [],
    users = [],
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server, options);

server.listen(PORT);
 
app.use('/static', express.static(__dirname + '/static'));
 
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// Подписываемся на событие соединения нового клиента
io.sockets.on('connection', function (socket) {

    socket.on('disconnect', function() {
        try {
            if(socket.user_name !== undefined){
                // Удаляем пользователя из списка онлайн-пользователей
                users.splice(users.indexOf(socket.user_name), 1);

                // Посылаем сообщение всем клиентам, кроме себя о моем выходе
                socket.broadcast.emit('send_logout_message', socket.user_name);
            }
        } catch (e) {
            console.log(e);
            socket.disconnect();
        }
    });

    socket.on('check_user_name', function (user_name) {
        try {
            // Проверяем имя пользователи среди онлайн-пользователей
            if(users.indexOf(user_name) !== -1){
                // Такое имя уже используется, авторизация не прошла
                socket.emit('auth_failed');
            }
            else{
                // Имя свободно, авторищация прошла успешно
                socket.emit('auth_success');
            }
        } catch (e) {
            console.log(e);
            socket.disconnect();
        }
    });

    //подписываемся на событие message от клиента
    socket.on('send_message', function (message_data) {
        try {
            var now = new Date(),
                utc_now = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

            message_data.date = utc_now;

            messages.push(message_data);

            // Посылаем сообщение себе
            socket.emit('send_message', message_data);

            // Посылаем сообщение всем клиентам, кроме себя
            socket.broadcast.emit('send_message', message_data);
        } catch (e) {
            console.log(e);
            socket.disconnect();
        }
    });

    socket.on('send_login_message', function (user_name) {
        try {
            // Записываем имя пользователя в объект socket
            socket.user_name = user_name;

            // Добавляем пользователя в список онлайн-пользователей
            users.push(user_name);

            // Посылаем сообщение всем клиентам, кроме себя о моем подключении
            socket.broadcast.emit('send_login_message', user_name);

            // Получаем историю сообщений и список онлайн пользователей чата
            socket.emit('get_history_data', {
                messages: messages,
                users: users
            });
        } catch (e) {
            console.log(e);
            socket.disconnect();
        }
    });
});