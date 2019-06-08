function registrationQuery(body){
	AJAX({
		method : 'POST',
		url : 'fight',
		header : POST_HEADER,
		body : body,
		handler : function(res){
			
		},
		errorHandler : function(res){
			
		}
	})();
}

const button = document.querySelector('.main-menu__button_start-battle');

button.addEventListener('click', )

function findFight(){

}