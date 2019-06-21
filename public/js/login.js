onDOMReady(function(){
	const loginButton = document.querySelector('.auth-body__btn-login');
	const registrationButton = document.querySelector('.auth-body__btn-registration');
	const loginInput = document.querySelector('.auth-body__input-login');
	const passwordInput = document.querySelector('.auth-body__input-password');
	const modalWindow = document.querySelector('.wrong__window');
	const modalWindowText = modalWindow.querySelector('.wrong__window__text');

	function registrationQuery(body){
		AJAX({
			method : 'POST',
			url : 'register',
			header : POST_HEADER,
			body : body,
			handler : function(res){
				setUserData(res.user.id, res.user.token);
				redirect('main-page');
			},
			errorHandler : function(res){
				if(res.status === 409){
					console.log('Такой пользователь уже существет');
					modalWindowText.innerHTML ='Такой пользователь уже существет';
					modalWindow.style = "transform: translateY(0px)";
					setTimeout(modalHide, 5000);
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
				redirect('main-page');
			},
			errorHandler : function(res){
				if(res.status === 403){
					modalWindowText.innerHTML = 'Данные не верны';
					modalWindow.style = "transform: translateY(0px)";
					setTimeout(modalHide, 5000);
				}
				if(res.status === 400){
					modalWindowText.innerHTML = 'Пользователь не существует';
					modalWindow.style = "transform: translateY(0px)";
					setTimeout(modalHide, 5000);
				}
			}
		})();
	}
	
	function modalHide() {
		modalWindow.style = "transform: translateY(200px)";
	}

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
});