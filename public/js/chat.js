let testToken = getToken('token');

class GetMessagesObject{
	constructor(token, timestamp){
		this.body = {
			token: token,
			timestamp: timestamp
		};
		this.method = 'GET';
		this.url =  'chat';
	};
	handler(result){
		if(result.chat.length > 0){
			addMessages(result.chat, chatMessagesContainer);
		}
	};
	errorHandler(res){
		if(res.status === 403){
			wrongTokenHadler();
		}else{
			console.log(res.responseText);
		}
	};
}

function createMessage(time, author, text){
	let message = document.createElement('div');
	let messageTime = document.createElement('p');
	let messageAuthor = document.createElement('p');
	let messageText = document.createElement('p');

	message.classList.add('chat__message', 'message');
	messageTime.classList.add('message__time');
	messageAuthor.classList.add('message__author');
	messageText.classList.add('message__text');

	messageTime.innerText = time;
	messageAuthor.innerText = author;
	messageText.innerText = text;

	message.appendChild(messageTime);
	message.appendChild(messageAuthor);
	message.appendChild(messageText);

	return message;
}

let chatMessagesContainer = document.querySelector('.chat__messages');

let addMessages = (function(){
	let lastTimestamp = 0;
	return function(arr, container){
		let wrapper = document.createDocumentFragment();
		arr.forEach(item => {
			if(item.timestamp > lastTimestamp){
				let timestamp = new Date(item.timestamp).toTimeString().substring(0,8);
				wrapper.appendChild(createMessage(timestamp, item.user.username, item.message));
			}
		});
		lastTimestamp = arr[arr.length - 1].timestamp;
		container.appendChild(wrapper);
		container.scrollTop = container.scrollHeight;
	}
})();

function getMessagesQuery(){
	let timestamp = (+ new Date()) - 5000;
    let getMessagesObj = new GetMessagesObject(testToken, timestamp);
    AJAX(getMessagesObj)();
}

setInterval(() => {
    getMessagesQuery();
}, 1000);

class SendMessageObject{
	constructor(token, message, timestamp){
		this.body = {
			token: token,
			message: message,
			timestamp: timestamp,
		};
		this.url =  'chat';
		this.method = 'POST';
		this.header = POST_HEADER;
	}
	handler(result){
		sendTextArea.value = '';
	};
	errorHandler(res){
		if(res.status === 403){
			wrongTokenHadler();
		}else{
			console.log(res.responseText);
		}
	};
}

let sendForm = document.querySelector('.chat__send-block')
let sendButton = document.querySelector('.chat__send-button');
let sendTextArea = document.querySelector('.chat__send-text');

sendForm.addEventListener('submit', () => {
	event.preventDefault();
	sendMessage(sendTextArea);
});

sendButton.addEventListener('click', (event) => {
	event.preventDefault();
	sendMessage(sendTextArea);
});

function sendMessage(textarea){
	let text = textarea.value;

	if(!text){
		return;
	}

	let timestamp = + new Date();
	let sendObj = new SendMessageObject(testToken, text, timestamp);

	AJAX(sendObj)();
}

let onlineUsersList = document.querySelector('.online-users');

let getOnlineUsersObject = {
	method: 'GET',
	url: 'online',
	handler: function(result){
		showOnlineUsers(result.users, onlineUsersList);
	},
	errorHandler: function(res){
		if(res.status === 403){
			wrongTokenHadler();
		}else{
			console.log(res.responseText);
		}
	}
}

function createOnlineUser(nickname){
	let user = document.createElement('p');
	user.classList.add('online-users__user');
	user.innerText = nickname;
	return user;
}

function showOnlineUsers(arr, container){
	let wrapper = document.createDocumentFragment();
	
	arr.forEach(item => {
		wrapper.appendChild(createOnlineUser(item.username));
	});

	container.innerHTML = '';
	container.appendChild(wrapper);
}

function getOnlineUsersQuery(){
	AJAX(getOnlineUsersObject)();
}

getOnlineUsersQuery();
setInterval(() => {
    getOnlineUsersQuery();
}, 5000);

let chatBlock = document.querySelector('.chat');
let chatShowButton = document.querySelector('.chat__mobile-show');
let chatHideButton = document.querySelector('.chat__mobile-hide');

chatShowButton.addEventListener('click', () => {
	chatBlock.style.display = 'block';
	setTimeout(() => {
		chatBlock.style.opacity = 1;
	}, 0);
})

chatHideButton.addEventListener('click', () => {
	chatBlock.style.opacity = 0;
	setTimeout(() => {
		chatBlock.style = '';
	}, 500);
})