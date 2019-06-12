const findFightButton = document.querySelector('.main-menu__button_start-battle');
const waitingTitle = document.querySelector('.main-menu__search-status');

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
			console.log(res);
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
			console.log(res);
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
			console.log(res);
		}
	})();
}

getInfoQuery();

// getFightStatusQuery(localStorage.getItem('combat_id'));

findFightButton.addEventListener('click', findFightQuery);