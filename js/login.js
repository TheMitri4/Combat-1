function registrationQuery(body){
	AJAX({
		method : 'POST',
		url : 'register',
		header : POST_HEADER,
		body : body,
		handler : function(res){
			setUserData(res.user.id, res.user.token);
			redirect('main.html');
		},
		errorHandler : function(res){
			// console.log(res);
			if(res.status === 409){
				console.log('Такой пользователь уже существет');
				// попап ошибки о том, что пользователь есть
			}
		}
	})();
}

function loginQuery(body){
	AJAX({
		method : 'POST',
		url : 'login',
		header : POST_HEADER,
		body : body,
		handler : function(res){
			setUserData(res.user.id, res.user.token);
			redirect('main.html');
		},
		errorHandler : function(res){
			// console.log(res);
			if(res.status === 403){
				// попап ошибки о том, что данные не верны
			}
		}
	})();
}

function redirect(url){
	window.location = url;
}

onDOMReady(function(){
	const loginButton = document.querySelector('.auth-body__btn-login');
	const registrationButton = document.querySelector('.auth-body__btn-registration');
	const loginInput = document.querySelector('.auth-body__input-login');
	const passwordInput = document.querySelector('.auth-body__input-password');

	function loginButtonHandler(event){
		event.preventDefault();
		const body = {
			username: loginInput.value,
			password: passwordInput.value
		};
		loginQuery(body);
	}
	
	function registrationButtonHandler(event){
		event.preventDefault();
		const body = {
			username: loginInput.value,
			password: passwordInput.value
		};
		registrationQuery(body);
	}
	
	loginButton.onclick = loginButtonHandler;
	registrationButton.onclick = registrationButtonHandler;
})