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
const fightResultsBlock = document.querySelector('.fight-results__wrapper');

const playerHealthBar = document.querySelector('.info-player__char-hp');
const enemyHealthBar = document.querySelector('.info-enemy__char-hp');

const battleLog = document.querySelector('.battle-log');

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
	if(res.combat.status === 'finished'){
		if(res.combat.you.health <= 0){
			fightResultsBlock.querySelector('.fight-results__title').innerText = 'Поражение';
			fightResultsBlock.classList.remove('hidden');
			fightResultsBlock.querySelector('.fight-results__return-button').addEventListener('click', () => {
				redirect('main-page')
			});
		}else{
			fightResultsBlock.querySelector('.fight-results__title').innerText = 'Победа';
			fightResultsBlock.classList.remove('hidden');
			fightResultsBlock.querySelector('.fight-results__return-button').addEventListener('click', () => {
				redirect('main-page')
			});
		}
	}
	if(!res.combat.turn_status){
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

		if(res.combat.results.length != 0){
			let turnResults = res.combat.results[res.combat.results.length - 1];
			turnResults.forEach(item => addLogItem(createLogItem(item), battleLog));
		}
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
		redirect('main-page');
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

	if(combat.results.length != 0){
		combat.results.forEach(item => {
			item.forEach(item => addLogItem(createLogItem(item), battleLog));
		})
	}
}

function createLogItem(logData){
	const hits = {
		head: 'голову',
		body: 'торс',
		belt: 'пах',
		legs: 'ноги'
	}

	const blockedPhrases = [
		`<span>${logData.origin.username}</span> пытается нанести удар в ${hits[logData.hit]}, но <span>${logData.target.username}</span> успешно блокирует удар`,
		`<span>${logData.origin.username}</span> промахивается , и <span>${logData.target.username}</span> остается цел`,
		`<span>${logData.target.username}</span> отражает удар в ${hits[logData.hit]}`
	]

	const missedHitPhrases = [
		`<span>${logData.target.username}</span> получает удар в ${hits[logData.hit]}`,
		`<span>${logData.origin.username}</span> наносит удар в ${hits[logData.hit]} <span>${logData.target.username}</span>`
	]

	let logItem = document.createElement('p');
	logItem.classList.add('battle-log__item');
	
	if(logData.blocked){
		logItem.innerHTML = blockedPhrases[Math.round(Math.random() * (blockedPhrases.length - 1) + 0)];
	}else{
		logItem.innerHTML = missedHitPhrases[Math.round(Math.random() * (missedHitPhrases.length - 1) + 0)];
	}

	return logItem;
}

function addLogItem(item, container){
	container.appendChild(item);
	container.scrollTop = container.scrollHeight;
}

function setRandomBackground(container){
	const backgrounds = [
		'cave.jpg',
		'mountains.jpg',
		'fire.jpg',
		'wild.jpg',
		'darkMountains.jpg',
		'dayMountains.jpg',
		'dayMountains2.jpg',
		'western.jpg',
		'nightForest.png'
	]
	container.style.backgroundImage = `url(images/${backgrounds[Math.round(Math.random() * (backgrounds.length - 1) + 0)]})`;
}


getFightDetailsQuery(localStorage.getItem('combat_id'), setupFightPageHandler);

const pageBackgroundContainer = document.querySelector('.layer');

setRandomBackground(pageBackgroundContainer);