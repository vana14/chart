define('Helpers', ['jquery'], function() {
    var settings = {
        socket: io.connect('http://localhost:8008'),
        user_name: 'Пользователь_' + (Math.round(Math.random() * 10000)),
        messages_obj: null,
        message_text_obj: null,
        send_btn: null
    };

    function Helpers(options) {
        $.extend(this, settings, options);
    }

    var methods = Helpers.prototype = new Object();

    methods._sendMsg = function(nick, msg){
        var cls = this,
            msg_content =
            '<tr class="im_in">'+
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
                                cls._replaceChars(nick)+
                            '</a>'+
                        '</div>'+
                        '<div class="im_msg_text">'+
                            cls._replaceChars(msg)+
                        '</div>'+
                    '</div>'+
                '</td>'+
                '<td class="im_log_date">'+
                    '<a class="im_date_link">'+cls._processingDate()+'</a>'+
                '</td>'+
            '</tr>';

        cls.messages_obj.append(msg_content);
    };

    methods._sendMessageAfterLogin = function(){

        var cls = this,
            msg_content =
                '<tr id="new_messages_pointer_holder" class="im_unread_bar_tr">'+
                    '<td colspan="5" class="im_unread_bar_td">'+
                        '<div class="im_unread_bar">'+
                            '<span class="im_unread_bar_wrap">'+
                                '<span class="im_unread_bar_text">'+
                                    cls.user_name + ' подключился к чату'+
                                '</span>'+
                            '</span>'+
                        '</div>'+
                    '</td>'+
                '</tr>';

        cls.messages_obj.append(msg_content);
    }

    methods._processingDate = function(){

        var date = new Date();

        return  (date.getHours()<10?'0':'') + date.getHours() + ':' +
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

    methods._formEvents = function(holder){

        var cls = this;

        $('.chat .nick').text(cls.user_name);

        cls.message_text_obj.off('focus.text').on('focus.text', function(e){
            $('#new_message_placeholder').hide();
        });

        cls.message_text_obj.off('blur.text').on('blur.text', function(e){
            if($.trim($(this).html()) === ''){
                $('#new_message_placeholder').show();
            }
        });

    };

    methods.setEvents = function(holder){

        var cls = this;

        if(holder === undefined || !holder.length){
            console.error('Не передан холдер, в котором лежат элементы');
        }

        cls._formEvents(holder);

        cls.socket.on('connecting', function () {
            //cls._msg_system('Соединение...');
        });

        cls.socket.on('connect', function () {
            cls._sendMessageAfterLogin();
            cls._scrollToFinalMsg();
        });

        cls.socket.on('message', function (data) {
            cls._sendMsg(data.name, data.message);
            cls._scrollToFinalMsg();
            cls.message_text_obj.focus();
        });

        cls.send_btn.off('click.send').on('click.send', function () {
            if($.trim(cls.message_text_obj.text()) === ''){
                return;
            }

            var text = cls.message_text_obj.html();

            cls.message_text_obj.empty();
            cls.socket.emit('message', {
                message: text,
                name: cls.user_name
            });
        });

    };

    return Helpers;
});