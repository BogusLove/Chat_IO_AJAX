const authDiv = document.getElementById('auth');
const chatDiv = document.getElementById('chat');
const submitAuth = document.getElementById('submitAuth');
const name = document.getElementById('name');
const nickname = document.getElementById('nickname');
const peopleList = document.getElementById('peopleList');
const messageList = document.getElementById('messageList');
const sendButton = document.getElementById('sendButton');
const message_to_send = document.getElementById('message-to-send');
const down = document.getElementById('down');
const user = document.getElementById('user');

const socket = io.connect();
const meesageSize = 100;

let userName = '';
let userNickname = '';

chatDiv.style.display = 'none';

down.onclick = () => { 
    chat_history.scrollTop = 10000; 
}

submitAuth.onclick = () => {
    if (name.value && nickname.value) {
        userName = name.value;
        userNickname = nickname.value;
        authDiv.style.display = 'none';
        chatDiv.style.display = 'block';
        socket.emit('auth', {
            name: userName,
            nickname: userNickname
        });
        user.insertAdjacentHTML('afterbegin', `<span>${userName}</span><br><span id="nicknameIfno">Nickname: @${userNickname}</span>`);
    }
}

sendButton.onclick = () => {   
    socket.emit('not typing'); 
    let message = message_to_send.value;
    if (message) socket.emit('chat message', message);
    message_to_send.value = ''; 
}

message_to_send.oninput = () => {
    socket.emit('typing');
}

message_to_send.onblur = () => {
    socket.emit('not typing');
}

socket.on('pasrticipants', (users) => { 
    while (peopleList.firstChild) {
		peopleList.removeChild(peopleList.firstChild);
    }
    for (let i = 0; i < users.length; i++) {
        peopleList.insertAdjacentHTML('afterbegin', userStatus(users[i]));
    }
});

socket.on('chat message', (message) => {
    if (message.type === 'ordinary') {
        let msg = message.body;
        if (msg.includes(`@${userNickname}`)) messageList.insertAdjacentHTML('beforeend', createPersonalMessageBody(message));
        else messageList.insertAdjacentHTML('beforeend', createMessageBody(message));
    }
    else messageList.insertAdjacentHTML('beforeend', createGeneralMessageBody(message));
    chatHistoryTools();
});

socket.on('own message', (message) => {   
    if (message.type === 'ordinary') messageList.insertAdjacentHTML('beforeend', createOwnMessageBody(message));    
    chatHistoryTools();
});

socket.on('chat history', (messages) => { 
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].type !== 'ordinary') messageList.insertAdjacentHTML('beforeend', createGeneralMessageBody(messages[i])); 
        else messageList.insertAdjacentHTML('beforeend', createMessageBody(messages[i]));    
    }
    chatHistoryTools();
});

socket.on('typing', (data) => {
    let str = `@${data} is typing...`;
    const elem = `<li id='typing'>${str}</li>`;
    if (!document.getElementById('typing')) messageList.insertAdjacentHTML('beforeend', elem);
});

socket.on('not typing', () => {
    if (document.getElementById('typing')) document.getElementById('typing').remove();
});

function userStatus(user) {	
    const { name, nickname, status } = user;
    let elem = `<li class="clearfix"><div class="about"><div class="name">${name}(${nickname})</div><div class="status"><i class="fa fa-circle ${status}"></i>${status}</div></div></li>`;
    return elem;
}

function createMessageBody(message){
    const { user, body, time } = message;
    let elem = `<li><div class="message-data"><span class="message-data-name">${user.name}(${user.nickname})</span><span class="message-data-time">${time}</span></div><div class="message my-message">${body}</div></li>`;
    return elem;
}

function createPersonalMessageBody(message) {
    const { user, body, time } = message;
    let elem = `<li><div class="message-data"><span class="message-data-name">${user.name}(${user.nickname})</span><span class="message-data-time">${time}</span></div><div class="message my-message personal">${body}</div></li>`;
    return elem;
}

function createOwnMessageBody(message) {
    const { user, body, time } = message;
    let elem = `<li class="clearfix"><div class="message-data align-right"><span class="message-data-time" >${time}</span> &nbsp; &nbsp;<span class="message-data-name" >${user.name}(${user.nickname})</span></div><div class="message other-message float-right">${body}</div></li>`;
    return elem;
}

function createGeneralMessageBody(message){
    const { body } = message;
    let elem = `<li class="clearfix"><div class="center">${body}</div></li>`;
    return elem;
}

function messagesSize() {
    if (messageList.childNodes.length >= meesageSize) {
        while(messageList.childNodes.length !== meesageSize) {
            messageList.removeChild(messageList.firstChild);
        }
    }
}

function chatHistoryTools() {
    messagesSize();
    chat_history.scrollTop = 10000; 
}