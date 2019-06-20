const loginButton = document.querySelector('.auth-body__btn-login');
const registrationButton = document.querySelector('.auth-body__btn-registration');
const loginInput = document.querySelector('.auth-body__input-login');
const passwordInput = document.querySelector('.auth-body__input-password');
const modalWindow = document.querySelector('.wrong__window');
const modalWindowText = modalWindow.querySelector('.wrong__window__text');

function registrationQuery(body){
	apiRequest({
		method : 'POST',
		url : 'register',
		body : body,
	})
	.then(response => {
		if(response.status === 409){
			modalWindowText.innerHTML ='Такой пользователь уже существет';
			modalWindow.style = "transform: translateY(0px)";
			setTimeout(modalHide, 5000);
			return Promise.reject('Пользователь уже существует');
		}
		if(response.status === 200){
			return response.json();
		}
	})
	.then(result => {
		setUserData(result.user.id, result.user.token);
		redirect('main-page');
	})
	.catch(error => console.log(error));
}

function loginQuery(body){
	apiRequest({
		method : 'POST',
		url : 'login',
		body : body,
	})
	.then(response => {
		if(response.status === 403){
			modalWindowText.innerHTML = 'Данные не верны';
			modalWindow.style = "transform: translateY(0px)";
			setTimeout(modalHide, 5000);
			return Promise.reject('Данные не верны');
		}
		if(response.status === 400){
			modalWindowText.innerHTML = 'Пользователь не существует';
			modalWindow.style = "transform: translateY(0px)";
			setTimeout(modalHide, 5000);
			return Promise.reject('Пользователь не существует');
		}
		if(response.status === 200){
			return response.json();
		}
	})
	.then(result => {
		setUserData(result.user.id, result.user.token);
		redirect('main-page');
	})
	.catch(error => console.log(error));
}

function modalHide() {
	modalWindow.style = "transform: translateY(200px)";
}

function loginButtonHandler(event){
	event.preventDefault();
	if(!loginInput.value || !passwordInput.value){
		return;
	}
	const body = {
		username: loginInput.value,
		password: passwordInput.value
	};
	loginQuery(body);
}

function registrationButtonHandler(event){
	event.preventDefault();
	if(!loginInput.value || !passwordInput.value){
		return;
	}
	const body = {
		username: loginInput.value,
		password: passwordInput.value
	};
	registrationQuery(body);
}

loginButton.onclick = loginButtonHandler;
registrationButton.onclick = registrationButtonHandler;
