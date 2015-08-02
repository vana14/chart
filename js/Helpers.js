Helpers = (function($) {
    var settings = {
        socket: null,
        user_name: null,
        messages_obj: null,
        message_text_obj: null,
        error_auth_obj: null,
        message_placeholder_obj: null,
        send_btn: null,
        login_form_obj: null,
        error_holder: null,
        users_holder: null
    };

    function Helpers(options) {
        $.extend(this, settings, options);
    }

    var methods = Helpers.prototype = new Object();

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

    methods._removeUserFromList = function(user_name){

        var cls = this;

        cls.users_holder.find('[data-user_name="'+cls._replaceChars(user_name)+'"]').remove();

    };

    methods._processingDate = function(date){

        var date = new Date(),
            currentTimeZoneOffsetInHours = -new Date().getTimezoneOffset()/60,
            hours = date.getHours() - currentTimeZoneOffsetInHours;

        return  (hours<10?'0':'') + date.getHours() + ':' +
                (date.getMinutes()<10?'0':'') + date.getMinutes();
    };

    methods._replaceChars = function(str) {
        return str
            .replace(new RegExp('<div>', 'ig'), '\n')
            .replace(/(<([^>]+)>)/ig, '')
            .replace(new RegExp('&nbsp;', 'ig'), ' ');
    }

    methods._scrollToFinalMsg = function(){
        var cls = this;

        cls.messages_obj.parent().scrollTop(cls.messages_obj[0].scrollHeight);;
    }

    methods._removeAuthForm = function(){
        var cls = this;

        cls.login_form_obj.remove();
    };

    methods._showAuthErrorMessage = function(){
        var cls = this;

        cls.error_auth_obj.show();
    };

    methods._hideAuthErrorMessage = function(){
        var cls = this;

        cls.error_auth_obj.hide();
    };

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
                    cls.send_btn.trigger('click.send')
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

        cls.send_btn.off('click.send').on('click.send', function () {
            if($.trim(cls.message_text_obj.text()) === ''){
                return;
            }

            var text = cls.message_text_obj.html();

            cls.message_text_obj.empty();

            var now = new Date();

            cls.socket.emit('send_message', {
                message: text,
                user_name: cls.user_name,
                date: new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
            });
        });

    };

    methods._setLoginEvents = function(user_name){

        var cls = this;

        cls._hideAuthErrorMessage();

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