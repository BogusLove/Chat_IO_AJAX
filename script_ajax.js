const authDiv = document.getElementById('auth');
const chatDiv = document.getElementById('chat');
const chat_history = document.getElementById('chat_history');
const submitAuth = document.getElementById('submitAuth');
const name = document.getElementById('name');
const nickname = document.getElementById('nickname');
const peopleList = document.getElementById('peopleList');
const messageList = document.getElementById('messageList');
const sendButton = document.getElementById('sendButton');
const message_to_send = document.getElementById('message-to-send');
const down = document.getElementById('down');
const user = document.getElementById('user');

let userName = '';
let userNickname = '';
const messageSize = 100;

chatDiv.style.display = 'none';

down.onclick = () => { 
    chat_history.scrollTop = 10000; 
}

submitAuth.onclick = async () => {
    if (name.value && nickname.value) {
        userName = name.value;
        userNickname = nickname.value;
        const data = {
            name: userName,
            nickname: userNickname
        };
        await fetch('/users', {
            method: 'POST',
            body: JSON.stringify(data),
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => { if (res.ok) console.log(res.status) })
        .catch(err => console.log(`Error: ${err}`));
        authDiv.style.display = 'none';
        chatDiv.style.display = 'block';
        user.insertAdjacentHTML('afterbegin', `<span>${userName}</span><br><span id="nicknameIfno">Nickname: @${userNickname}</span>`);
        fillUsers();
    }
}

sendButton.onclick = async () => {   
    let message = message_to_send.value;
    if (message) {
        const data = {
            body: message,
            user: {
                name: userName,
                nickname: userNickname
            },
            time: getNow()
        };
        await fetch('/messages', {
            method: 'POST',
            body: JSON.stringify(data),
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => { if (res.ok) console.log(res.status) })
        .catch(err => console.log(`Error: ${err}`));
    }
    fillMessages();
    message_to_send.value = '';    
}

function getUsers() {
    return fetch('/users', { method: 'GET',headers: { 'Accept': 'application/json' } })
    .then(response => { if (response.ok && response.status === 200) return response.json() })
    .then(users => { return users })
    .catch(err => console.log(err));
}

function getMessages() {
    return fetch('/messages', { method: 'GET',headers: { 'Accept': 'application/json' } })
    .then(response => { if (response.ok && response.status === 200) return response.json() })
    .then(messages => { return messages })
    .catch(err => console.log(err));
}

async function fillUsers() {
    const users = await getUsers();
    while (peopleList.firstChild) {
		peopleList.removeChild(peopleList.firstChild);
    }
    for (let i = 0; i < users.length; i++) {
        peopleList.insertAdjacentHTML('afterbegin', userStatus(users[i]));
    }
}

async function fillMessages() {
    const messages = await getMessages();
    while (messageList.firstChild) {
		messageList.removeChild(messageList.firstChild);
    }
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].body.includes(`@${userNickname}`))
            messageList.insertAdjacentHTML('beforeend', createPersonalMessageBody(messages[i]));
        else messageList.insertAdjacentHTML('beforeend', createMessageBody(messages[i]));
    }
    messagesSize();    
}

function userStatus(user) {	
    const { name, nickname } = user;
    let elem = `<li class="clearfix"><div class="about"><div class="name">${name}(${nickname})</div></div></li>`;
    return elem;
}

function createMessageBody(message){
    const { user, body, time } = message;
    let elem = `<li><div class="message-data"><span class="message-data-name">${user.name}(${user.nickname})</span><span class="message-data-time">${time}</span></div><div class="message my-message">${body}</div></li>`;
    return elem;
}

function createPersonalMessageBody(message) {
    const { user, body, time } = message;
    let elem = `<li><div class="message-data"><span class="message-data-name">${user.name}(${user.nickname})</span><span class="message-data-time">${time}</span></div><div class="message my-message personalAjax">${body}</div></li>`;
    return elem;
}

function messagesSize() {
    if (messageList.childNodes.length >= messageSize) {
        while(messageList.childNodes.length !== messageSize) {
            messageList.removeChild(messageList.firstChild);
        }
    }
}

function getNow(){
    let now = new Date();
    let str = now.getHours() + ':' + now.getMinutes();
    return str;
}

fillUsers();
fillMessages();

setInterval(() => {
    fillUsers();
    fillMessages();
}, 1000);
