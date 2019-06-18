var config = {
	baseUrlForAJAXQuery : 'https://combats-team4-api.herokuapp.com/'
	// baseUrlForAJAXQuery : 'http://localhost:3333/'
}
var POST_HEADER = {'Content-Type': 'application/x-www-form-urlencoded'};

function onDOMReady(handler){
	addEventListener('DOMContentLoaded' , handler)
}

/* принимает объект вида: {
	method : 'POST', 
	url : './some/url', 
	header : {
		nameHeader : value,
		...
	},
	body
	errorHandler : function(){},
	handler : function(переменная для обращения к результату выполнения запроса | res){} | что сделать когда ответит сервер
}
*/
function AJAX(configObject){
	let xhr = new XMLHttpRequest();
	let url = config.baseUrlForAJAXQuery + configObject.url;
	if(configObject.method === 'GET' && configObject.body){
		url += '?' ;
		for(let key in configObject.body){
			url += key + '=' + configObject.body[key] + '&';
		}
		url = url.substring(0, url.length + 1);    
	}

	xhr.open(configObject.method, url, true);

	if(configObject.header){
		for(let key in configObject.header){
			xhr.setRequestHeader(key, configObject.header[key]);
		}
	}
	
	xhr.onreadystatechange = function(){
		if(xhr.readyState !== 4) return;
		if(xhr.status !== 200){
			if(configObject.errorHandler){
				configObject.errorHandler(xhr);
			}
			throw new Error(xhr.status + ': ' + xhr.statusText);
		}
		configObject.handler(JSON.parse(xhr.responseText));
	};
	return function(){
		if(configObject.body){
			let body = "";
			for(let key in configObject.body){
				body += key + '=' + configObject.body[key] + '&';
			}
			// body = body.substring(0, configObject.url.length+1); 
			xhr.send(body);
			return;
		}
		xhr.send();
		return ;
	};
};

function getToken(key){
	if(typeof key !== 'string' ){
		throw new Error(key + ', is not a string');
	}
	return localStorage.getItem(key);
}

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

function wrongTokenHadler(){
	redirect('/');
}