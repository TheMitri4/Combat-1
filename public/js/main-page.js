const findFightButton = document.querySelector('.main-menu__button_start-battle');
const waitingTitle = document.querySelector('.main-menu__search-status');
const modalWindow = document.querySelector('.wrong__window');
const modalWindowText = modalWindow.querySelector('.wrong__window__text');

function findFightQuery(){
	AJAX({
		method : 'POST',
		url : 'fight',
		header : POST_HEADER,
		body : {
            token: testToken
        },
		handler : function(res){
			if(!res.combat){
				return;
			}
			const combatId = res.combat.id;
			localStorage.setItem('combat_id', combatId);
			if(res.combat.status === 'pending'){
                waitingTitle.classList.remove('hidden');
				findFightButton.classList.add('hidden');
				setInterval(() => {
					getFightStatusQuery(combatId)
				}, 1000);
			}
			if(res.combat.status === 'progress'){
				redirect('fight-page');
			}
		},
		errorHandler : function(res){
			if(res.status === 403){
				modalWindowText.innerHTML = '403';
				modalWindow.style = "transform: translateY(0px)";
				setTimeout(modalHide, 5000);
				wrongTokenHadler();
			}else{
				modalWindowText.innerHTML = 'Что-то пошло не так';
				modalWindow.style = "transform: translateY(0px)";
				setTimeout(modalHide, 5000);
				console.log(res.responseText);
			}
		}
	})();
}

function getFightStatusQuery(combatId){
	AJAX({
		method : 'GET',
		url : 'status',
		body : {
			token: testToken,
			combat_id: combatId
        },
		handler : function(res){
			if(res.combat.status === 'progress'){
				redirect('fight-page');
			}
		},
		errorHandler : function(res){
			if(res.status === 403){
				wrongTokenHadler();
			}else{
				console.log(res.responseText);
			}
		}
	})();
}

function getInfoQuery(){
	AJAX({
		method : 'GET',
		url : 'info',
		body : {
			token: testToken,
			user_id: localStorage.getItem('id')
        },
		handler : function(res){
			if(res.combats.length === 0){
				return;
			}
			const combats = res.combats;
			const lastCombat = combats[combats.length - 1];
			if(lastCombat.status === 'pending'){
				waitingTitle.classList.remove('hidden');
				findFightButton.classList.add('hidden');
				setInterval(() => {
					getFightStatusQuery(lastCombat.id);
				}, 1000);
			}
			if(lastCombat.status === 'progress'){
				redirect('fight-page');
			}
		},
		errorHandler : function(res){
			if(res.status === 403){
				wrongTokenHadler();
			}else{
				console.log(res.responseText);
			}
		}
	})();
}

function modalHide() {
	modalWindow.style = "transform: translateY(200px)";
}

getInfoQuery();

// getFightStatusQuery(localStorage.getItem('combat_id'));

findFightButton.addEventListener('click', findFightQuery);

//  --------------------АУДИО---------------------
const audio = document.querySelector(".audio");
const soundToggle = document.querySelector(".main-menu__button_sound-toggle");
const soundOff = soundToggle.querySelector('.sound-toggle__sound');
audio.volume = 0.4;

soundToggle.addEventListener('click', () => {
    if(audio.paused) {
		audio.play();
		soundOff.classList.add('hidden');
	 } else {
		audio.pause();
		soundOff.classList.remove('hidden');
	 }
});