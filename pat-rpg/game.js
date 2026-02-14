// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let player = {
    name: "",
    emoji: "",
    lvl: 1,
    xp: 0,
    coins: 100,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    atk: 10,
    def: 5,
    crit: 0.1,
    hg: 100,
    sl: 100,
    happy: 100,
    dead: false,
    sleeping: false,
    inBattle: false,
    enemiesDefeated: 0,
    skillsUsed: 0,
    evolutionLevel: 0,
    unlockedSkills: ['basic'],
    buffs: [],
    originalEmoji: "",
    difficulty: 'normal',
    permanentBuffs: [],
    dungeonFloor: 1,
    lastBossFloor: 0,
    element: 'none'
};

let selectedType = "";
let enemy = null;
let gameLoop = null;
let emotionTimer = null;
let inventory = [];
let activeQuests = [];
let completedQuests = [];
let currentEvolution = null;
let currentDifficulty = DIFFICULTY.normal;

// ===== ИНИЦИАЛИЗАЦИЯ ИГРЫ =====

function selectPet(petEmoji, buttonElement) {
    selectedType = petEmoji;
    document.querySelectorAll('#setup-screen .pet-selection button').forEach(btn => {
        btn.classList.remove('selected');
    });
    buttonElement.classList.add('selected');
}

function initGame() {
    console.log("Функция initGame вызвана!");
    
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    const difficulty = document.getElementById('difficulty-select').value;
    
    console.log("Имя:", name);
    console.log("Выбранный питомец:", selectedType);
    console.log("Сложность:", difficulty);
    
    if (!name) {
        console.log("Ошибка: нет имени");
        showNotification("Введите имя питомца!", "error");
        nameInput.focus();
        return;
    }
    
    if (!selectedType) {
        console.log("Ошибка: не выбран питомец");
        showNotification("Выберите тип питомца!", "error");
        return;
    }
    
    console.log("Инициализация игры...");
    
    // Настройка сложности
    currentDifficulty = DIFFICULTY[difficulty];
    
    // Настройка игрока
    const petType = PET_TYPES[selectedType];
    player.name = name;
    player.emoji = selectedType;
    player.originalEmoji = selectedType;
    player.difficulty = difficulty;
    
    // Применяем модификаторы сложности
    const diffMultiplier = currentDifficulty.playerMultiplier;
    
    player.atk = Math.round((GAME_CONSTANTS.BASE_ATTACK + (petType.atk - 10)) * diffMultiplier);
    player.def = Math.round((GAME_CONSTANTS.BASE_DEFENSE + (petType.def - 5)) * diffMultiplier);
    player.maxHp = Math.round((GAME_CONSTANTS.BASE_MAX_HP + (petType.maxHp - 100)) * diffMultiplier);
    player.maxMp = Math.round((GAME_CONSTANTS.BASE_MAX_MP + (petType.maxMp - 50)) * diffMultiplier);
    player.crit = petType.crit * diffMultiplier;
    
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.coins = 100;
    player.lvl = 1;
    player.xp = 0;
    player.hg = 100;
    player.sl = 100;
    player.happy = 100;
    player.dead = false;
    player.sleeping = false;
    player.inBattle = false;
    player.enemiesDefeated = 0;
    player.skillsUsed = 0;
    player.evolutionLevel = 0;
    player.unlockedSkills = ['basic'];
    player.buffs = [];
    player.permanentBuffs = [];
    
    // Добавление навыков питомца
    if (petType.skills) {
        petType.skills.forEach(skill => {
            if (!player.unlockedSkills.includes(skill)) {
                player.unlockedSkills.push(skill);
            }
        });
    }
    
    // Начальный инвентарь
    inventory = [
        { ...ITEMS.health_potion, quantity: 2 },
        { ...ITEMS.mana_potion, quantity: 1 }
    ];
    
    // Начальные квесты
    activeQuests = [];
    completedQuests = [];
    acceptQuest(1);
    
    // Показ игрового экрана
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    document.getElementById('ui-name').textContent = player.name;
    document.getElementById('pet-sprite').textContent = player.emoji;
    
    // Запуск игры
    startGameLoop();
    updateUI();
    updateSkillButtons();
    saveGame();
    
    showEmotion("😊");
    log(`Добро пожаловать, ${player.name}! Сложность: ${currentDifficulty.name}`);
    
    showNotification(`Игра началась! Сложность: ${currentDifficulty.name}`, "info", 3000);
    console.log("Игра успешно инициализирована!");
}

// ===== ИГРОВОЙ ЦИКЛ =====

function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    
    gameLoop = setInterval(() => {
        if (!player.dead && !player.inBattle) {
            gameTick();
        }
        regenMana();
        updateBuffs();
        checkEvolution();
        checkQuestsProgress();
        saveGame();
    }, GAME_CONSTANTS.TICK_INTERVAL);
}

function gameTick() {
    if (player.dead || player.inBattle) return;
    
    if (player.sleeping) {
        player.sl = Math.min(100, player.sl + GAME_CONSTANTS.SLEEP_RESTORE);
        player.hg -= 1;
        player.hp = Math.min(player.maxHp, player.hp + 2);
        if (player.sl >= 100) {
            toggleSleep();
        }
    } else {
        player.hg -= GAME_CONSTANTS.HUNGER_DECAY;
        player.sl -= GAME_CONSTANTS.SLEEP_DECAY;
        player.happy -= GAME_CONSTANTS.HAPPINESS_DECAY;
    }
    
    if (player.hg <= 0) {
        const damage = GAME_CONSTANTS.STARVATION_DAMAGE;
        player.hp -= damage;
        showDamageText(damage, player.emoji);
        log("Питомец голодает!");
    }
    
    if (player.hp <= 0) {
        die();
        return;
    }
    
    checkNeeds();
    updateUI();
}

function regenMana() {
    if (player.mp < player.maxMp) {
        player.mp = Math.min(player.maxMp, player.mp + GAME_CONSTANTS.MP_REGEN_RATE);
        updateUI();
    }
}

function updateBuffs() {
    const now = Date.now();
    player.buffs = player.buffs.filter(buff => {
        if (buff.expires > now) {
            return true;
        } else {
            showNotification(`Эффект ${getBuffName(buff)} закончился`, "info");
            return false;
        }
    });
}

// ===== ЭМОЦИИ И ПОТРЕБНОСТИ =====

function showEmotion(emoji, duration = 2000) {
    const bubble = document.getElementById('thought-bubble');
    bubble.textContent = emoji;
    bubble.classList.add('active');
    
    if (emotionTimer) clearTimeout(emotionTimer);
    emotionTimer = setTimeout(() => {
        bubble.classList.remove('active');
    }, duration);
}

function checkNeeds() {
    if (player.dead || player.sleeping || player.inBattle) return;
    
    if (player.hg < 40) {
        showEmotion("🍕?");
    } else if (player.sl < 40) {
        showEmotion("💤?");
    } else if (player.happy < 40) {
        showEmotion("⚽?");
    } else if (Math.random() < 0.2) {
        const moods = ["😊", "🥰", "✨", "🎵"];
        showEmotion(moods[Math.floor(Math.random() * moods.length)], 1500);
    }
}

// ===== ДЕЙСТВИЯ ИГРОКА =====

function playAction(actionType) {
    if (player.dead || player.sleeping) return;
    
    animatePet();
    
    switch (actionType) {
        case 'feed':
            if (player.coins < GAME_CONSTANTS.FEED_COST) {
                showEmotion("❌💰");
                log("Не хватает денег!");
                return;
            }
            player.coins -= GAME_CONSTANTS.FEED_COST;
            player.hg = Math.min(100, player.hg + GAME_CONSTANTS.FEED_AMOUNT);
            player.happy += 5;
            showEmotion("😋");
            log("Питомец поел. +30 сытости");
            break;
            
        case 'play':
            player.coins += GAME_CONSTANTS.PLAY_INCOME;
            player.hg -= GAME_CONSTANTS.PLAY_HUNGER;
            player.happy = Math.min(100, player.happy + GAME_CONSTANTS.PLAY_HAPPINESS);
            player.sl -= 3;
            showEmotion("🎉");
            log(`Вы поиграли! +${GAME_CONSTANTS.PLAY_INCOME}💰, +20 настроения`);
            break;
    }
    
    updateUI();
    saveGame();
}

function toggleSleep() {
    if (player.dead || player.inBattle) return;
    
    animatePet();
    player.sleeping = !player.sleeping;
    const sleepBtn = document.getElementById('sleep-btn');
    
    if (player.sleeping) {
        document.body.classList.add('night');
        sleepBtn.textContent = "☀️";
        sleepBtn.title = "Проснуться";
        showEmotion("😴");
        log("Питомец спит...");
    } else {
        document.body.classList.remove('night');
        sleepBtn.textContent = "💤";
        sleepBtn.title = "Спать";
        log("Доброе утро!");
    }
    
    updateUI();
    saveGame();
}

// ===== СИСТЕМНЫЕ ФУНКЦИИ =====
function addExperience(amount) {
    // Применяем уменьшающий множитель
    // Math.floor используется, чтобы избежать дробных чисел в XP
    const reducedXP = Math.floor(amount * GAME_CONSTANTS.XP_MODIFIER);
    
    pet.xp += reducedXP;
    
    console.log(`Получено опыта: ${reducedXP} (с учетом штрафа)`);

    // Проверка на повышение уровня
    if (pet.xp >= GAME_CONSTANTS.LEVEL_UP_XP) {
        levelUp();
    }
}
// Пример вызова при победе или игре
addExperience(GAME_CONSTANTS.BASE_XP_PER_ACTION); 
// Игрок получит 10 XP вместо 20, так как множитель 0.5
function addXP(amount) {
    player.xp += amount;
    
    while (player.xp >= GAME_CONSTANTS.LEVEL_UP_XP) {
        player.xp -= GAME_CONSTANTS.LEVEL_UP_XP;
        levelUp();
    }
    
    updateUI();
}

function levelUp() {
    player.lvl++;
    player.maxHp += GAME_CONSTANTS.LEVEL_UP_HP_BONUS;
    player.maxMp += GAME_CONSTANTS.LEVEL_UP_MP_BONUS;
    player.atk += GAME_CONSTANTS.LEVEL_UP_ATK_BONUS;
    player.def += GAME_CONSTANTS.LEVEL_UP_DEF_BONUS;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.happy = Math.min(100, player.happy + 20);
    // Эффект повышения уровня
    const petSprite = document.getElementById('pet-sprite');
    petSprite.classList.add('pet-jump');
    showEmotion("🆙", 3000);
    
    log(`УРОВЕНЬ ${player.lvl}! +${GAME_CONSTANTS.LEVEL_UP_HP_BONUS} HP, +${GAME_CONSTANTS.LEVEL_UP_ATK_BONUS} ATK`);
    showNotification(`Уровень ${player.lvl}!`, "success");
    
    updateQuestProgress('level', player.lvl);
}

function die() {
    player.dead = true;
    player.hp = 0;
    
    const petSprite = document.getElementById('pet-sprite');
    petSprite.textContent = "💀";
    
    log("Питомец погиб... Нажмите 'сбросить прогресс' чтобы начать заново");
    showNotification("Питомец погиб!", "error");
    
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    updateUI();
    saveGame();
}

function updateUI() {
    document.getElementById('ui-lvl').textContent = player.lvl;
    document.getElementById('ui-coins').textContent = player.coins;
    
    document.getElementById('txt-hp').textContent = Math.round(player.hp);
    document.getElementById('txt-max-hp').textContent = player.maxHp;
    document.getElementById('bar-hp').style.width = (player.hp / player.maxHp * 100) + "%";
    
    document.getElementById('txt-mp').textContent = Math.round(player.mp);
    document.getElementById('txt-max-mp').textContent = player.maxMp;
    document.getElementById('bar-mp').style.width = (player.mp / player.maxMp * 100) + "%";
    
    document.getElementById('txt-hg').textContent = player.hg;
    document.getElementById('bar-hg').style.width = player.hg + "%";
    
    document.getElementById('txt-sl').textContent = player.sl;
    document.getElementById('bar-sl').style.width = player.sl + "%";
    
    document.getElementById('txt-xp').textContent = player.xp;
    document.getElementById('bar-xp').style.width = (player.xp / GAME_CONSTANTS.LEVEL_UP_XP * 100) + "%";
    
    document.getElementById('txt-atk').textContent = player.atk;
    document.getElementById('txt-def').textContent = player.def;
    
    // Обновление dungeon-level
    const dungeonLevelElement = document.getElementById('dungeon-level');
    if (dungeonLevelElement) {
        dungeonLevelElement.textContent = `Этаж: ${player.dungeonFloor}`;
    }
    
    // Эффекты для низких показателей
    if (player.hp < 30) document.getElementById('bar-hp').classList.add('low');
    else document.getElementById('bar-hp').classList.remove('low');
    
    if (player.mp < 15) document.getElementById('bar-mp').classList.add('low');
    else document.getElementById('bar-mp').classList.remove('low');
    
    if (player.hg < 30) document.getElementById('bar-hg').classList.add('low');
    else document.getElementById('bar-hg').classList.remove('low');
    
    if (player.sl < 30) document.getElementById('bar-sl').classList.add('low');
    else document.getElementById('bar-sl').classList.remove('low');
    
    // Обновление HP врага в бою
    if (enemy) {
        document.getElementById('enemy-hp').textContent = enemy.currentHp;
    }
}

function animatePet() {
    const sprite = document.getElementById('pet-sprite');
    sprite.classList.add('pet-jump');
    setTimeout(() => sprite.classList.remove('pet-jump'), 400);
}

function showDamageText(amount, target, isCrit = false) {
    const stage = document.querySelector('.stage');
    const text = document.createElement('div');
    text.className = isCrit ? 'damage-text crit-text' : 'damage-text';
    text.textContent = `-${Math.round(amount)}`;
    text.style.left = `${50 + (Math.random() * 20 - 10)}%`;
    text.style.top = `${50 + (Math.random() * 20 - 10)}%`;
    
    stage.appendChild(text);
    
    setTimeout(() => {
        if (text.parentNode) {
            text.parentNode.removeChild(text);
        }
    }, 1000);
}

function showHealText(amount, target) {
    const stage = document.querySelector('.stage');
    const text = document.createElement('div');
    text.className = 'heal-text';
    text.textContent = `+${Math.round(amount)}`;
    text.style.left = `${50 + (Math.random() * 20 - 10)}%`;
    text.style.top = `${50 + (Math.random() * 20 - 10)}%`;
    
    stage.appendChild(text);
    
    setTimeout(() => {
        if (text.parentNode) {
            text.parentNode.removeChild(text);
        }
    }, 1000);
}

function getBuffName(buff) {
    switch (buff.stat) {
        case 'atk': return "Атака";
        case 'def': return "Защита";
        case 'crit': return "Крит";
        default: return "Бафф";
    }
}

function addBuff(buff) {
    player.buffs.push(buff);
    
    // Визуальная индикация
    const statName = getBuffName(buff);
    showNotification(`${statName} +${buff.value}`, "info", 2000);
}

function updateSkillButtons() {
    const skillButtons = {
        'fireball': document.getElementById('skill-fireball'),
        'ice': document.getElementById('skill-ice'),
        'heal': document.getElementById('skill-heal')
    };
    
    Object.entries(skillButtons).forEach(([skill, button]) => {
        if (button) {
            if (player.unlockedSkills.includes(skill)) {
                button.disabled = false;
                button.style.opacity = '1';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
            }
        }
    });
}

function getStatName(stat) {
    switch(stat) {
        case 'atk': return 'ATK';
        case 'def': return 'DEF';
        case 'crit': return 'крит';
        case 'dodge': return 'уклонение';
        case 'maxHp': return 'Max HP';
        case 'maxMp': return 'Max MP';
        default: return stat;
    }
}

// ===== СОХРАНЕНИЕ =====

function saveGame() {
    try {
        const gameData = {
            player: {
                name: player.name,
                emoji: player.emoji,
                lvl: player.lvl,
                xp: player.xp,
                coins: player.coins,
                hp: player.hp,
                maxHp: player.maxHp,
                mp: player.mp,
                maxMp: player.maxMp,
                atk: player.atk,
                def: player.def,
                crit: player.crit,
                hg: player.hg,
                sl: player.sl,
                happy: player.happy,
                dead: player.dead,
                sleeping: player.sleeping,
                inBattle: player.inBattle,
                enemiesDefeated: player.enemiesDefeated,
                skillsUsed: player.skillsUsed,
                evolutionLevel: player.evolutionLevel,
                unlockedSkills: [...player.unlockedSkills],
                originalEmoji: player.originalEmoji,
                difficulty: player.difficulty,
                permanentBuffs: [...player.permanentBuffs],
                dungeonFloor: player.dungeonFloor,
                lastBossFloor: player.lastBossFloor
            },
            inventory: inventory.map(item => ({
                id: item.id,
                quantity: item.quantity
            })),
            activeQuests: activeQuests.map(quest => ({
                id: quest.id,
                progress: quest.progress,
                completed: quest.completed
            })),
            completedQuests: completedQuests.map(quest => quest.id)
        };
        localStorage.setItem('pat_rpg_save', JSON.stringify(gameData));
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem('pat_rpg_save');
        console.log("Попытка загрузить сохранение:", saved ? "данные есть" : "нет данных");
        
        if (!saved) {
            console.log("Нет сохраненных данных");
            return false;
        }
        
        const data = JSON.parse(saved);
        console.log("Данные загружены:", data);
        
        // ВАЖНО: Восстанавливаем только если есть основные данные
        if (!data.player || !data.player.name) {
            console.log("Нет данных игрока");
            return false;
        }
        
        // Восстанавливаем игрока
        Object.assign(player, data.player);
        
        // Убедимся, что важные поля инициализированы
        if (!player.unlockedSkills) player.unlockedSkills = ['basic'];
        if (!player.buffs) player.buffs = [];
        if (!player.permanentBuffs) player.permanentBuffs = [];
        if (!player.difficulty) player.difficulty = 'normal';
        
        // Загружаем инвентарь
        inventory = [];
        if (data.inventory && Array.isArray(data.inventory)) {
            data.inventory.forEach(itemData => {
                const baseItem = ITEMS[itemData.id];
                if (baseItem) {
                    inventory.push({ 
                        ...baseItem, 
                        quantity: itemData.quantity || 1 
                    });
                }
            });
        } else {
            // Стандартный начальный инвентарь
            inventory = [
                { ...ITEMS.health_potion, quantity: 2 },
                { ...ITEMS.mana_potion, quantity: 1 }
            ];
        }
        
        // Загружаем квесты
        activeQuests = data.activeQuests || [];
        completedQuests = data.completedQuests || [];
        
        // Восстанавливаем сложность
        if (player.difficulty && DIFFICULTY[player.difficulty]) {
            currentDifficulty = DIFFICULTY[player.difficulty];
        } else {
            currentDifficulty = DIFFICULTY.normal;
            player.difficulty = 'normal';
        }
        
        console.log("Загрузка успешна для игрока:", player.name);
        return true;
        
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        // При ошибке очищаем сохранение
        localStorage.removeItem('pat_rpg_save');
        return false;
    }
}

function resetGame() {
    if (confirm("Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.")) {
        localStorage.removeItem('pat_rpg_save');
        location.reload();
    }
}

// ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====
window.player = player;
window.enemy = enemy;
window.inventory = inventory;
window.activeQuests = activeQuests;
window.completedQuests = completedQuests;
window.currentEvolution = currentEvolution;
window.currentDifficulty = currentDifficulty;

window.selectPet = selectPet;
window.initGame = initGame;
window.playAction = playAction;
window.toggleSleep = toggleSleep;
window.enterDungeon = enterDungeon;
window.useSkill = useSkill;
window.escapeBattle = escapeBattle;
window.showInventory = showInventory;
window.showSkills = showSkills;
window.showQuests = showQuests;
window.resetGame = resetGame;
window.animatePet = animatePet;

// Экспорт функций для модулей
window.log = log;
window.showNotification = showNotification;
window.showDamageText = showDamageText;
window.showHealText = showHealText;
window.die = die;
window.addXP = addXP;
window.updateUI = updateUI;
window.updateQuestProgress = updateQuestProgress;
window.saveGame = saveGame;
window.addBuff = addBuff;
window.updateSkillButtons = updateSkillButtons;
window.closeModal = closeModal;
window.getStatName = getStatName;
window.updateQuestProgress = updateQuestProgress;
window.acceptQuest = acceptQuest;
window.completeQuest = completeQuest;
window.checkQuestsProgress = checkQuestsProgress;

// ===== ЗАГРУЗКА ИГРЫ =====

window.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализация...");
    
    // Автофокус на поле ввода имени
    document.getElementById('name-input').focus();
    
    // Обработка Enter в поле ввода
    document.getElementById('name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            console.log("Нажата клавиша Enter");
            initGame();
        }
    });
    
    // Обработка клика по питомцу для прыжка
    document.getElementById('pet-sprite').addEventListener('click', animatePet);
    
    // Пробуем загрузить сохранение
    if (loadGame()) {
        console.log("Сохранение загружено");
        
        // Если есть сохраненный игрок с именем
        if (player.name && player.name !== "") {
            console.log("Продолжаем игру для:", player.name);
            
            // Прячем экран создания
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            
            // Восстанавливаем интерфейс
            document.getElementById('ui-name').textContent = player.name;
            document.getElementById('pet-sprite').textContent = player.emoji;

            // Если питомец мертв
            if (player.dead) {
                document.getElementById('pet-sprite').textContent = "💀";
                log("Ваш питомец погиб...");
            } else {
                // Обновляем индикатор эволюции
                if (player.evolutionLevel > 0) {
                    const evolutions = EVOLUTIONS[player.originalEmoji];
                    if (evolutions) {
                        const evolution = evolutions.find(e => e.level <= player.evolutionLevel);
                        if (evolution) {
                            const indicator = document.getElementById('evolution-indicator');
                            indicator.innerHTML = `<span style="color: var(--warning)">${evolution.emoji}</span>`;
                            indicator.title = evolution.name;
                        }
                    }
                }
                
                // Восстанавливаем сложность
                if (player.difficulty && DIFFICULTY[player.difficulty]) {
                    currentDifficulty = DIFFICULTY[player.difficulty];
                    // Обновляем выбор в меню
                    document.getElementById('difficulty-select').value = player.difficulty;
                }
                
                // Запускаем игру
                startGameLoop();
                updateUI();
                updateSkillButtons();
                log(`С возвращением, ${player.name}!`);
            }
        } else {
            console.log("Нет сохранения или имя пустое, показываем экран создания");
            // Показываем экран создания
            document.getElementById('setup-screen').classList.remove('hidden');
            document.getElementById('game-screen').classList.add('hidden');
        }
    } else {
        console.log("Нет сохранения, показываем экран создания");
        // Показываем экран создания
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
    }
    
    // Добавим отладочную кнопку для очистки сохранения
    console.log("Для очистки сохранения введите в консоли: localStorage.removeItem('pat_rpg_save')");
});