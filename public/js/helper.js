// let store = {};

// let getStoreValue = (key)=>{
// 	if(store[key]){
// 		return store[key];
// 	} else if(localStorage.getItem(key)){
// 		store[key] = localStorage.getItem(key);
// 		return store[key];
// 	} else{
// 		throw new Error('Error: No key data!');
// 	}
// };

let setStoreValue = (key, value)=>{
	localStorage.setItem(key, value);
};

const POST_HEADER = {'Content-Type': 'application/x-www-form-urlencoded'};
const BASE_URL = 'http://localhost:3333'

let onDOMReady = (handler)=>{
	addEventListener('DOMContentLoaded' , handler)
};

function apiRequest(configObj){
		let body = { ...configObj.body };
		body.id = localStorage.getItem('id');
		body.token = localStorage.getItem('token');
		body = new URLSearchParams(body).toString();
		const url = new URL(configObj.url, BASE_URL);

		if(configObj.method === 'POST'){
			return fetch(url, {
				method : configObj.method,
				headers: new Headers(POST_HEADER),
				body : body
			});
		}

		return fetch(
			`${url}?${body}`, 
			{
				method : configObj.method
			}
		);
};

function setUserData(id, token){
	if(typeof id !== 'string' && typeof token !== 'string'){
		throw new Error(id + 'or' + token + ', is not a string');
	}
	localStorage.setItem('id', id);
	localStorage.setItem('token', token);
}

function redirect(url){
	window.location = url;
}