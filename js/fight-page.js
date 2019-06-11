const  defBox = document.querySelector('.battle-info-defence'),
atcBox = document.querySelector('.battle-info-attack'),
checkboxDef = defBox.querySelectorAll("input"),
labelDef = defBox.querySelectorAll("label"),
checkboxAtc = atcBox.querySelectorAll("input"),
labelAtc = atcBox.querySelectorAll("label"),
playerBody = document.querySelector('.char-player').querySelectorAll('.body-part'),
enemyBody = document.querySelector('.char-enemy').querySelectorAll('.body-part');

let checkboxDefListener = 0, // НУЖНО ОБНУЛЯТЬ КАЖДЫЙ ХОД
lastAttackIndex = null;

// ПАРАЛЛАКС
function parallax(event) {
	const layers =  document.querySelectorAll('.layer');
	layers.forEach(layer => {
		let speed = layer.getAttribute('data-speed');
		layer.style.transform = `translateX(${-event.clientX*speed/1000}px)`;
	});
}
document.addEventListener('mousemove', parallax);

// ДЕЙСТВИЯ ЧЕКБОКСОВ В ЦЕНТРЕ (ЗАЩИТА)
labelDef.forEach((e, i) => {
e.addEventListener('click', (event) => {
	if (checkboxDef[i].checked) {
		playerBody[i].classList.toggle('body-part_active');
		checkboxDefListener--;
	} else if (checkboxDefListener < 2 ) {
		playerBody[i].classList.toggle('body-part_active');
		checkboxDefListener++;
	} else {
		event.preventDefault();
		alert('Вы можете защищать только 2 области!');
	}
});
});

// ДЕЙСТВИЯ НА ПЕРСОНАЖА ИГРОКА (ЗАЩИТА)
playerBody.forEach((e, i) => {
e.addEventListener('click', () => {
    if (checkboxDef[i].checked) {
        e.classList.toggle('body-part_active');
        checkboxDef[i].checked = false;
        checkboxDefListener--;
    } else if (checkboxDefListener < 2 ) {
        e.classList.toggle('body-part_active');
        checkboxDefListener++;
        checkboxDef[i].checked = true;
    } else {
        alert('Вы можете защищать только 2 области!');
    }
});
});

// ДЕЙСТВИЯ НА РАДИО БАТТОНАХ (АТАКА)
labelAtc.forEach((e, i) => {
e.addEventListener('click', () => {
    if (lastAttackIndex !== null) {
        enemyBody[lastAttackIndex].classList.toggle('enemy-body-part_active');
    } 
    lastAttackIndex = i;
    enemyBody[i].classList.toggle('enemy-body-part_active');
});
});

// ДЕЙСТВИЯ НА ПЕРСОНАЖА ПРОТИВНИКА (АТАКА)
enemyBody.forEach((e, i) => {
e.addEventListener('click', () => {
    if (lastAttackIndex !== null) {
        enemyBody[lastAttackIndex].classList.toggle('enemy-body-part_active');
    } 
    e.classList.toggle('enemy-body-part_active');
    checkboxAtc[i].checked = true;
    lastAttackIndex = i;
});
});

// Логика боя

const makeTurnButton = document.querySelector('.turn-switcher__button');
const turnWaitWrapper = document.querySelector('.battle-info__blocked');

const playerHealthBar = document.querySelector('.info-player__char-hp');
const enemyHealthBar = document.querySelector('.info-enemy__char-hp');

makeTurnButton.addEventListener('click', function(){
    const defAreas = Array.from(checkboxDef).filter(item => {
        return item.checked;
    });
    const attackAreas = Array.from(checkboxAtc).filter(item => {
        return item.checked;
    });
    if(defAreas.length !== 2 || attackAreas.length !== 1){
        return;
    }
    const hit = attackAreas[0].value;
    const blocks = defAreas.map(item => item.value);

    const turn = {
        hit: hit,
        blocks: blocks
    };
	
	this.disabled = true;
	sendTurn(JSON.stringify(turn));

	// ОБНУЛЕНИЕ ЭЛЕМЕНТОВ ВЫОРА
    checkboxDef.forEach(item => item.checked = false);
    checkboxAtc.forEach(item => item.checked = false);
    playerBody.forEach(item => item.classList.remove('body-part_active'));
    enemyBody.forEach(item => item.classList.remove('enemy-body-part_active'));

	// ОБНУЛЕНИЕ ПЕРЕМЕННЫХ ДЛЯ ВЫБОРА АТАКИ
	checkboxDefListener = 0; 
	lastAttackIndex = null;
})

function sendTurn(turn){
	AJAX({
		method : 'POST',
		url : 'turn',
		header : POST_HEADER,
		body : {
            token: testToken,
            combat_id: localStorage.getItem('combat_id'),
            turn: turn
        },
		handler : turnHandler,
		errorHandler : function(res){
            console.log(res);
            makeTurnButton.disabled = false;
		}
	})();
}

function turnHandler(res){
	console.log(res);
	if(res.combat.status === 'finished'){
		if(res.combat.you.health <= 0){
			alert('Вы проиграли');
		}else{
			alert('Вы выиграли');
		}
		redirect('main-page.html');
	}
	if(!res.combat.turn_status){
		console.log('Тест');
		turnWaitWrapper.classList.remove('hidden');
		setTimeout(() => {
			getFightDetailsQuery(res.combat.id, turnHandler);
		},1000);
	}else{
		makeTurnButton.disabled = false;
		turnWaitWrapper.classList.add('hidden');
		const playerHealth = Math.round((res.combat.you.health / 30) * 100);
		const enemyHealth = Math.round((res.combat.enemy.health / 30) * 100);
		playerHealthBar.style.width = `${playerHealth}%`;
		enemyHealthBar.style.width = `${enemyHealth}%`;
		console.log('Ход завершен');
	}
}

function getFightDetailsQuery(combatId, handler){
	AJAX({
		method : 'GET',
		url : 'status',
		body : {
			token: testToken,
			combat_id: combatId
        },
		handler : handler,
		errorHandler : function(res){
            console.log(res);
            makeTurnButton.disabled = false;
		}
	})();
}

function setupFightPageHandler(res){
	const combat = res.combat;

	if(combat.status !== 'progress'){
		redirect('main-page.html');
	}

	const playersNick = document.querySelector('.info-player__char-nickname');
	const enemysNick = document.querySelector('.info-enemy__char-nickname');

	playersNick.innerText = combat.you.username;
	enemysNick.innerText = combat.enemy.username;

	const playerHealth = Math.round((res.combat.you.health / 30) * 100);
	const enemyHealth = Math.round((res.combat.enemy.health / 30) * 100);
	playerHealthBar.style.width = `${playerHealth}%`;
	enemyHealthBar.style.width = `${enemyHealth}%`;

	if(!res.combat.turn_status){
		makeTurnButton.disabled = false;
		turnWaitWrapper.classList.remove('hidden');
		setTimeout(() => {
			getFightDetailsQuery(res.combat.id, turnHandler);
		},1000);
	}
}

function createLogItem(player, enemy){
	let logItem = document.createElement('p');
	let playerSpan = document.createElement('span');
	playerSpan.classList.add('battle-log__player-name');
	playerSpan.innerText = player;
	let enemySpan = document.createElement('span');
	enemySpan.classList.add('battle-log__enemy-name');
	enemySpan.innerText = enemy;
	logItem.innerHTML = ``;
}


getFightDetailsQuery(localStorage.getItem('combat_id'), setupFightPageHandler);