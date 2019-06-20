const  defBox = document.querySelector('.battle-info-defence'),
atcBox = document.querySelector('.battle-info-attack'),
checkboxDef = defBox.querySelectorAll("input"),
labelDef = defBox.querySelectorAll("label"),
checkboxAtc = atcBox.querySelectorAll("input"),
labelAtc = atcBox.querySelectorAll("label"),
playerBody = document.querySelector('.char-player').querySelectorAll('.body-part'),
enemyBody = document.querySelector('.char-enemy').querySelectorAll('.body-part');

let enemyBodyBlock;
let enemyAttack;

let checkboxDefListener = 0; // НУЖНО ОБНУЛЯТЬ КАЖДЫЙ ХОД
let lastAttackIndex = null;

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

const playerHealthBar = document.querySelector('.info-player-char-hp-bar');
const playerHealthBarHp = playerHealthBar.querySelector('.info-player__char-hp');
const playerHealthBarHit = playerHealthBar.querySelector('.info-player__char-hp-hit');
const playerHealthBarText = playerHealthBar.querySelector('.info-player__char-hp-num');
const enemyHealthBar = document.querySelector('.info-enemy-char-hp-bar');
const enemyHealthBarHp = enemyHealthBar.querySelector('.info-enemy__char-hp');
const enemyHealthBarHit = enemyHealthBar.querySelector('.info-enemy__char-hp-hit');
const enemyHealthBarText = enemyHealthBar.querySelector('.info-enemy__char-hp-num');

const battleLogs = document.querySelectorAll('.battle-log');

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
});

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
            if(res.status === 403){
				wrongTokenHadler();
			}else{
				console.log(res.responseText);
				makeTurnButton.disabled = false;
			}
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
		turnWaitWrapper.style = "opacity:1";
		setTimeout(() => {
			getFightDetailsQuery(res.combat.id, turnHandler);
		},1000);
	}else{
		const yourId = res.combat.you.id;
		const hits = {
			head: 0,
			body: 1,
			belt: 2,
			legs: 3
		};
		
		turnWaitWrapper.classList.remove('hidden');
		turnWaitWrapper.style = "opacity:1";
		turnWaitWrapper.children[0].innerHTML = "Ход противника";
		// ОТОБРАЖЕНИЕ ХОДА ПРОТИВНИКА
		setTimeout(() => {
			turnWaitWrapper.style = "opacity:0";
			res.combat.results[res.combat.results.length - 1].forEach(item => {
				if (item.origin.id === yourId) {
					enemyBodyBlock = enemyBody[hits[item.hit]].children[0];
					enemyBodyBlock.style = "opacity:0.9";	
					if (item.blocked) {
						enemyBodyBlock.classList.remove('hidden');
						enemyBody[hits[item.hit]].style = "background-color: rgba(0, 0, 255, 0.5)";
					}  else {
						enemyBody[hits[item.hit]].style = "background-color: rgba(255, 0, 0, 0.5)";
					}
				} else {
					enemyAttack = playerBody[hits[item.hit]].children[0];
					enemyAttack.classList.remove('hidden');
					enemyAttack.style = "opacity:0.9";
					if (item.blocked) {
						playerBody[hits[item.hit]].style = "background-color: rgba(0, 0, 255, 0.5)";
					} else {
						playerBody[hits[item.hit]].style = "background-color: rgba(255, 0, 0, 0.5)";
					}
				}
			});
		}, 700);
	
		setTimeout(() => {
			// ОБНУЛЕНИЕ ЭЛЕМЕНТОВ ВЫОРА
			checkboxDef.forEach(item => item.checked = false);
			checkboxAtc.forEach(item => item.checked = false);
			enemyBody.forEach(item => item.classList.remove('enemy-body-part_active'));
			playerBody.forEach(item => item.classList.remove('body-part_active'));
			if (enemyBodyBlock) {enemyBodyBlock.classList.add('hidden');}	
			if (enemyAttack) {enemyAttack.classList.add('hidden');}
			enemyBody.forEach(item => item.style = "background-color: none");
			playerBody.forEach(item => item.style = "background-color: none");
			// ОБНУЛЕНИЕ ПЕРЕМЕННЫХ ДЛЯ ВЫБОРА АТАКИ
			checkboxDefListener = 0; 
			lastAttackIndex = null;

			makeTurnButton.disabled = false;
			turnWaitWrapper.classList.add('hidden');
			turnWaitWrapper.children[0].innerHTML = "Ожидание противника";

			const playerHealth = Math.round((res.combat.you.health / 30) * 100);
			const enemyHealth = Math.round((res.combat.enemy.health / 30) * 100);

			playerHealthBarText.innerHTML = playerHealth;
			playerHealthBarHit.style.width = `${playerHealth}%`;
			playerHealthBarHp.style.width = `${playerHealth}%`;
			enemyHealthBarText.innerHTML = enemyHealth;
			enemyHealthBarHit.style.width = `${enemyHealth}%`;
			enemyHealthBarHp.style.width = `${enemyHealth}%`;
	
			if(res.combat.results.length != 0){
				let turnResults = res.combat.results[res.combat.results.length - 1];
				turnResults.forEach(item => {
					battleLogs.forEach(container => addLogItem(createLogItem(item), container));
				})
			}
		},2000);
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
            if(res.status === 403){
				wrongTokenHadler();
			}else{
				makeTurnButton.disabled = false;
				console.log(res.responseText);
			}
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

	playerHealthBarText.innerHTML = playerHealth;
	playerHealthBarHit.style.width = `${playerHealth}%`;
	playerHealthBarHp.style.width = `${playerHealth}%`;
	enemyHealthBarText.innerHTML = enemyHealth;
	enemyHealthBarHit.style.width = `${enemyHealth}%`;
	enemyHealthBarHp.style.width = `${enemyHealth}%`;

	if(!res.combat.turn_status){
		makeTurnButton.disabled = false;
		turnWaitWrapper.classList.remove('hidden');
		turnWaitWrapper.style = "opacity:1";
		setTimeout(() => {
			getFightDetailsQuery(res.combat.id, turnHandler);
		},1000);
	}

	if(combat.results.length != 0){
		combat.results.forEach(item => {
			item.forEach(item => {
				battleLogs.forEach(container => addLogItem(createLogItem(item), container));
			})
		})
	}
}

function createLogItem(logData){
	const hits = {
		head: 'голову',
		body: 'торс',
		belt: 'пах',
		legs: 'ноги'
	};

	const blockedPhrases = [
		`<span>${logData.origin.username}</span> пытается нанести удар в ${hits[logData.hit]}, но <span>${logData.target.username}</span> успешно блокирует удар`,
		`<span>${logData.origin.username}</span> промахивается , и <span>${logData.target.username}</span> остаётся цел`,
		`<span>${logData.target.username}</span> отражает удар в ${hits[logData.hit]}`,
		`<span>${logData.target.username}</span> легким движением руки уводит удар от <span>${logData.origin.username}</span>`,
		`<span>${logData.target.username}</span> ловко отпрыгивает от нападающего <span>${logData.origin.username}</span> и смеётся ему в лицо`,
		`<span>${logData.origin.username}</span> бьёт воздух вместо <span>${logData.target.username}</span>`,
		`<span>${logData.target.username}</span> был готов и не почувствовал боли от удара в ${hits[logData.hit]}`,
		`<span>${logData.target.username}</span> прочитал своего противника <span>${logData.origin.username}</span> как открытую книгу`,
		`<span>${logData.origin.username}</span> перестарался и не нанёс никакого урона <span>${logData.target.username}</span>`,
		`<span>${logData.origin.username}</span> уронил оружие, а <span>${logData.target.username}</span> остаётся цел`
	];

	const missedHitPhrases = [
		`<span>${logData.target.username}</span> получает удар в ${hits[logData.hit]}`,
		`<span>${logData.origin.username}</span> наносит удар в ${hits[logData.hit]} <span>${logData.target.username}</span>`,
		`<span>${logData.origin.username}</span> своим взглядом заставил <span>${logData.target.username}</span> получить урон`,
		`<span>${logData.origin.username}</span> случайно попадает в ${hits[logData.hit]} <span>${logData.target.username}</span>`,
		`<span>${logData.origin.username}</span> показывая своё мастерство наносит удар в ${hits[logData.hit]}`,
		`<span>${logData.target.username}</span> пытался предугадать действия <span>${logData.origin.username}</span> но безуспешно`,
		`<span>${logData.target.username}</span> упускает момент и получает ранение в ${hits[logData.hit]}`,
		`<span>${logData.target.username}</span> пережил тяжелый удар в ${hits[logData.hit]} и жаждет мести`,
		`<span>${logData.target.username}</span> не ожидал от <span>${logData.origin.username}</span> удара в ${hits[logData.hit]}`,
		`<span>${logData.target.username}</span> отвлёкся и пропустил удар в ${hits[logData.hit]}`
	];

	let logItem = document.createElement('p');
	logItem.classList.add('battle-log__item');
	
	if(logData.blocked){
		logItem.innerHTML = blockedPhrases[Math.round(Math.random() * (blockedPhrases.length - 1) + 0)];
		logItem.style = "color: skyblue;"
	}else{
		logItem.innerHTML = missedHitPhrases[Math.round(Math.random() * (missedHitPhrases.length - 1) + 0)];
		logItem.style = "color: crimson;";
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