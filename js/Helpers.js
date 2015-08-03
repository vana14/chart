Helpers = (function($) {
    /**
     * Опции по умолчанию, с которыми работает чат
     * @type {{
     * socket: null, (объект соединения)
     * user_name: null, (имя пользователя)
     * messages_obj: null, (холдер, в котором лежат сообщения)
     * message_text_obj: null, (объект так нызваемой textarea, где вводится сообщение)
     * error_auth_obj: null, (холдер, в который записываются ошибки авторизации)
     * message_placeholder_obj: null, (объект плейсхолдера для вводимого сообшения как в ВК)
     * send_btn_obj: null, (объект кнопки авторизации)
     * login_form_obj: null, (объект формы регистрации)
     * error_holder: null, (холдер, где отображаются ошибки с сетью)
     * users_holder: null (холдер, где находятся участники чата)
     * }}
     */
    var default_options = {
        socket: null,
        user_name: null,
        messages_obj: null,
        message_text_obj: null,
        error_auth_obj: null,
        message_placeholder_obj: null,
        send_btn_obj: null,
        login_form_obj: null,
        error_holder: null,
        users_holder: null
    };

    /**
     * Функция конструктор, принимающая параметр options со значениями для конкретного случая
     * @param options параметры
     * @constructor
     */
    function Helpers(options) {
        $.extend(this, default_options, options);
    }

    var methods = Helpers.prototype = new Object();

    /**
     * Добавляем новое сообщение к чату
     * @param data данные о сообщении
     * @private
     */
    methods._addMsg = function(data){

        var cls = this,
            user_name = cls._replaceChars(data.user_name),
            tr_class = cls.messages_obj.find('tr:last').data('user') === user_name ? 'im_out' : 'im_in',
            msg_content =
            '<tr class="'+tr_class+'" data-user="'+user_name+'">'+
                '<td class="im_log_author">'+
                    '<div class="im_log_author_chat_thumb">'+
                        '<a href="#">'+
                            '<img src="img/no-avatar.png" class="im_log_author_chat_thumb" width="32" height="32">'+
                        '</a>'+
                    '</div>'+
                '</td>'+
                '<td class="im_log_body">'+
                    '<div class="wrapped">'+
                        '<div class="im_log_author_chat_name">'+
                            '<a href="#" class="mem_link">'+
                                user_name+
                            '</a>'+
                        '</div>'+
                        '<div class="im_msg_text">'+
                            data.message+
                        '</div>'+
                    '</div>'+
                '</td>'+
                '<td class="im_log_date">'+
                    '<a class="im_date_link">'+cls._processingDate(data.date)+'</a>'+
                '</td>'+
            '</tr>';

        cls.messages_obj.append(msg_content);
    };

    /**
     * Добавляем сообщение о входе нового пользователя в чат
     * @param user_name имя пользователя
     * @private
     */
    methods._sendMessageAfterLogin = function(user_name){

        var cls = this,
            msg_content =
                '<tr class="im_unread_bar_tr">'+
                    '<td colspan="5" class="im_unread_bar_td">'+
                        '<div class="im_unread_bar">'+
                            '<span class="im_unread_bar_wrap">'+
                                '<span class="im_unread_bar_text plus">'+
                                    '<b>' + cls._replaceChars(user_name) + '</b>' + ' подключился к чату'+
                                '</span>'+
                            '</span>'+
                        '</div>'+
                    '</td>'+
                '</tr>';

        cls.messages_obj.append(msg_content);
    }

    /**
     * Добавляем сообщения о выходе пользователя из чата
     * @param user_name имя пользователя
     * @private
     */
    methods._sendMessageAfterLogout = function(user_name){

        var cls = this,
            msg_content =
                '<tr class="im_unread_bar_tr">'+
                    '<td colspan="5" class="im_unread_bar_td">'+
                        '<div class="im_unread_bar">'+
                            '<span class="im_unread_bar_wrap">'+
                                '<span class="im_unread_bar_text minus">'+
                                    '<b>' + cls._replaceChars(user_name) + '</b>' + ' вышел из чата'+
                                '</span>'+
                            '</span>'+
                        '</div>'+
                    '</td>'+
                '</tr>';

        cls.messages_obj.append(msg_content);
    }

    /**
     * Добавляем пользователя в список участников чата
     * @param user_name имя пользователя
     * @private
     */
    methods._addUserToList = function(user_name){

        var cls = this;

        user_name = cls._replaceChars(user_name)

        var user_content =
            '<div data-user_name="'+user_name+'" class="user-item">'+
                '<img src="img/no-avatar.png" width="35" height="35">'+
                '<a href="#">'+user_name+'</a>'+
            '</div>';

        if(cls.users_holder.find('.user-item:first').length){
            cls.users_holder.find('.user-item:first').after(user_content);
        }
        else{
            cls.users_holder.html(user_content);
        }

    };

    /**
     * Удаляем пользователя из списка участников чата
     * @param user_name имя пользователя
     * @private
     */
    methods._removeUserFromList = function(user_name){

        var cls = this;

        cls.users_holder.find('[data-user_name="'+cls._replaceChars(user_name)+'"]').remove();

    };

    /**
     * Обрабатываем дату согласно часовому поясу
     * @param date дата в UTC
     * @returns {string} дата в часовом поясе клиента
     * @private
     */
    methods._processingDate = function(date){

        date = new Date(date);

        var currentTimeZoneOffsetInHours = -new Date().getTimezoneOffset()/60,
            hours = parseInt(date.getHours() + currentTimeZoneOffsetInHours, 10);

        return  (hours<10?'0':'') + hours + ':' +
                (date.getMinutes()<10?'0':'') + date.getMinutes();
    };

    /**
     * Заменяем HTML символу в сущности
     * @param str строка
     * @returns {XML|string} отформатированная строка
     * @private
     */
    methods._replaceChars = function(str) {
        return str
            .replace(new RegExp('<div>', 'ig'), '\n')
            .replace(/(<([^>]+)>)/ig, '')
            .replace(new RegExp('&nbsp;', 'ig'), ' ');
    }

    /**
     * Скролим к последнему сообщению
     * @private
     */
    methods._scrollToFinalMsg = function(){
        var cls = this;

        cls.messages_obj.parent().scrollTop(cls.messages_obj[0].scrollHeight);;
    }

    /**
     * Удаляем форму авторизации
     * @private
     */
    methods._removeAuthForm = function(){
        var cls = this;

        cls.login_form_obj.remove();
    };

    /**
     * Показываем ошибку авторизации пользователя
     * @private
     */
    methods._showAuthErrorMessage = function(){
        var cls = this;

        cls.error_auth_obj.show();
    };

    /**
     * Скрываем ошибку авторизации пользователя
     * @private
     */
    methods._hideAuthErrorMessage = function(){
        var cls = this;

        cls.error_auth_obj.hide();
    };

    /**
     * Получаем информацию о сдвиге курсора посимвольно
     * @param el текущий элемент
     * @returns {number} число символов, на которое сдвинулся курсор
     * @private
     */
    methods._getCaret = function(el) {
        if (el.selectionStart) {
            return el.selectionStart;
        }
        else if (document.selection) {
            el.focus();

            var r = document.selection.createRange();
            if (r === null) {
                return 0;
            }

            var re = el.createTextRange(),
                rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);

            return rc.text.length;
        }
        return 0;
    }

    /**
     * Навешиваем события после успешной авторизации пользователя
     * @private
     */
    methods._setAfterLoginEvents = function(){

        var cls = this;

        cls.message_text_obj.off('focus.text').on('focus.text', function(e){
            cls.message_placeholder_obj.hide();
        }).off('blur.text').on('blur.text', function(e){
            if($.trim($(this).html()) === ''){
                cls.message_placeholder_obj.show();
            }
        }).off('keyup.i').on('keyup.i', function(e){
            if(e.keyCode == 13){
                if(e.shiftKey){
                    var content = $(this).html(),
                        caret = cls._getCaret($(this));

                    $(this).html(content.substring(0,caret)+"\n"+content.substring(caret,content.length));
                }
                else{
                    cls.send_btn_obj.trigger('click.send')
                }
            }
        });

        cls.socket.on('disconnect', function () {
            cls.error_holder.html('Сервер недоступен!');
        });

        cls.socket.on('send_message', function (data) {
            cls._addMsg(data);
            cls._scrollToFinalMsg();
            cls.message_text_obj.focus();
        });

        cls.socket.on('send_login_message', function (user_name) {
            cls._sendMessageAfterLogin(user_name);
            cls._scrollToFinalMsg();
            cls._addUserToList(user_name);
        });

        cls.socket.on('get_history_data', function (data) {
            for(var key in data.users){
                if(data.users[key] === cls.user_name){
                    continue;
                }
                cls._addUserToList(data.users[key]);
            }

            for(var key in data.messages){
                cls._addMsg(data.messages[key]);
            }

            cls._scrollToFinalMsg();
        });

        cls.socket.on('send_logout_message', function (user_name) {
            cls._sendMessageAfterLogout(user_name);
            cls._scrollToFinalMsg();
            cls._removeUserFromList(user_name);
        });

        cls.send_btn_obj.off('click.send').on('click.send', function () {
            if($.trim(cls.message_text_obj.text()) === ''){
                return;
            }

            var text = cls.message_text_obj.html();

            cls.message_text_obj.empty();

            cls.socket.emit('send_message', {
                message: text,
                user_name: cls.user_name,
                date: null
            });
        });

    };

    /**
     * Обновления (чистка) данных при разрыве соединения
     * @private
     */
    methods._reset = function(){

        var cls = this;

        cls._hideAuthErrorMessage();

        // Удаляем все сообщения которые были
        cls.messages_obj.find('tr:gt(0)').remove();

        // Удаляем список онлайн пользователей
        cls.users_holder.empty();
    };

    /**
     * События, необходимые для авторизации пользователя
     * @param user_name имя пользователя
     * @private
     */
    methods._setLoginEvents = function(user_name){

        var cls = this;

        cls._reset();

        cls.user_name = user_name;

        if(cls.socket !== null){
            cls.socket.emit('check_user_name', cls.user_name);
            console.log('repeat_check_user_name');
            return;
        }

        cls.socket = io.connect('http://localhost:8008');

        cls.socket.on('connecting', function () {
            // Ход соединения
            //cls._sendMessageAfterLogin('');
            console.log('connecting');
        });

        cls.socket.on('connect', function () {
            console.log('connect');
            cls.socket.emit('check_user_name', cls.user_name);
        });

        cls.socket.on('auth_failed', function () {
            console.log('auth_failed');
            cls._showAuthErrorMessage();
        });

        cls.socket.on('auth_success', function () {
            console.log('auth_success');

            cls._removeAuthForm();

            $('.hidden').toggleClass('hidden');

            cls._setAfterLoginEvents();

            cls.socket.emit('send_login_message', cls.user_name);
            cls.error_holder.empty();
            cls._addUserToList(cls.user_name);
        });

    };

    /**
     * События, необходимые до авторизации пользователя
     */
    methods.setEvents = function(){

        var cls = this;

        cls.user_name_obj.off('keyup.i').on('keyup.i', function(e){
            if(e.keyCode == 13){
                cls.login_btn_obj.trigger('click.login');
            }
        });

        cls.login_btn_obj.off('click.login').on('click.login', function(e){
            e.preventDefault();

            if($.trim($(this).val()) === ''){
                return;
            }

            cls._setLoginEvents($.trim(cls.user_name_obj.val()));
        });

    };

    return Helpers;

}(jQuery));