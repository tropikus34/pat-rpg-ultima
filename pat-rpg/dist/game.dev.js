"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
var player = {
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
var selectedType = "";
var enemy = null;
var gameLoop = null;
var emotionTimer = null;
var inventory = [];
var activeQuests = [];
var completedQuests = [];
var currentEvolution = null;
var currentDifficulty = DIFFICULTY.normal; // ===== ИНИЦИАЛИЗАЦИЯ ИГРЫ =====

function selectPet(petEmoji, buttonElement) {
  selectedType = petEmoji;
  document.querySelectorAll('#setup-screen .pet-selection button').forEach(function (btn) {
    btn.classList.remove('selected');
  });
  buttonElement.classList.add('selected');
}

function initGame() {
  console.log("Функция initGame вызвана!");
  var nameInput = document.getElementById('name-input');
  var name = nameInput.value.trim();
  var difficulty = document.getElementById('difficulty-select').value;
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

  console.log("Инициализация игры..."); // Настройка сложности

  currentDifficulty = DIFFICULTY[difficulty]; // Настройка игрока

  var petType = PET_TYPES[selectedType];
  player.name = name;
  player.emoji = selectedType;
  player.originalEmoji = selectedType;
  player.difficulty = difficulty; // Применяем модификаторы сложности

  var diffMultiplier = currentDifficulty.playerMultiplier;
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
  player.permanentBuffs = []; // Добавление навыков питомца

  if (petType.skills) {
    petType.skills.forEach(function (skill) {
      if (!player.unlockedSkills.includes(skill)) {
        player.unlockedSkills.push(skill);
      }
    });
  } // Начальный инвентарь


  inventory = [_objectSpread({}, ITEMS.health_potion, {
    quantity: 2
  }), _objectSpread({}, ITEMS.mana_potion, {
    quantity: 1
  })]; // Начальные квесты

  activeQuests = [];
  completedQuests = [];
  acceptQuest(1); // Показ игрового экрана

  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('ui-name').textContent = player.name;
  document.getElementById('pet-sprite').textContent = player.emoji; // Запуск игры

  startGameLoop();
  updateUI();
  updateSkillButtons();
  saveGame();
  showEmotion("😊");
  log("\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C, ".concat(player.name, "! \u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C: ").concat(currentDifficulty.name));
  showNotification("\u0418\u0433\u0440\u0430 \u043D\u0430\u0447\u0430\u043B\u0430\u0441\u044C! \u0421\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u044C: ".concat(currentDifficulty.name), "info", 3000);
  console.log("Игра успешно инициализирована!");
} // ===== ИГРОВОЙ ЦИКЛ =====


function startGameLoop() {
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(function () {
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
    var damage = GAME_CONSTANTS.STARVATION_DAMAGE;
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
  var now = Date.now();
  player.buffs = player.buffs.filter(function (buff) {
    if (buff.expires > now) {
      return true;
    } else {
      showNotification("\u042D\u0444\u0444\u0435\u043A\u0442 ".concat(getBuffName(buff), " \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0441\u044F"), "info");
      return false;
    }
  });
} // ===== ЭМОЦИИ И ПОТРЕБНОСТИ =====


function showEmotion(emoji) {
  var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2000;
  var bubble = document.getElementById('thought-bubble');
  bubble.textContent = emoji;
  bubble.classList.add('active');
  if (emotionTimer) clearTimeout(emotionTimer);
  emotionTimer = setTimeout(function () {
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
    var moods = ["😊", "🥰", "✨", "🎵"];
    showEmotion(moods[Math.floor(Math.random() * moods.length)], 1500);
  }
} // ===== ДЕЙСТВИЯ ИГРОКА =====


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
      log("\u0412\u044B \u043F\u043E\u0438\u0433\u0440\u0430\u043B\u0438! +".concat(GAME_CONSTANTS.PLAY_INCOME, "\uD83D\uDCB0, +20 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u044F"));
      break;
  }

  updateUI();
  saveGame();
}

function toggleSleep() {
  if (player.dead || player.inBattle) return;
  animatePet();
  player.sleeping = !player.sleeping;
  var sleepBtn = document.getElementById('sleep-btn');

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
} // ===== СИСТЕМНЫЕ ФУНКЦИИ =====


function addExperience(amount) {
  // Применяем уменьшающий множитель
  // Math.floor используется, чтобы избежать дробных чисел в XP
  var reducedXP = Math.floor(amount * GAME_CONSTANTS.XP_MODIFIER);
  pet.xp += reducedXP;
  console.log("\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043E\u043F\u044B\u0442\u0430: ".concat(reducedXP, " (\u0441 \u0443\u0447\u0435\u0442\u043E\u043C \u0448\u0442\u0440\u0430\u0444\u0430)")); // Проверка на повышение уровня

  if (pet.xp >= GAME_CONSTANTS.LEVEL_UP_XP) {
    levelUp();
  }
} // Пример вызова при победе или игре


addExperience(GAME_CONSTANTS.BASE_XP_PER_ACTION); // Игрок получит 10 XP вместо 20, так как множитель 0.5

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
  player.happy = Math.min(100, player.happy + 20); // Эффект повышения уровня

  var petSprite = document.getElementById('pet-sprite');
  petSprite.classList.add('pet-jump');
  showEmotion("🆙", 3000);
  log("\u0423\u0420\u041E\u0412\u0415\u041D\u042C ".concat(player.lvl, "! +").concat(GAME_CONSTANTS.LEVEL_UP_HP_BONUS, " HP, +").concat(GAME_CONSTANTS.LEVEL_UP_ATK_BONUS, " ATK"));
  showNotification("\u0423\u0440\u043E\u0432\u0435\u043D\u044C ".concat(player.lvl, "!"), "success");
  updateQuestProgress('level', player.lvl);
}

function die() {
  player.dead = true;
  player.hp = 0;
  var petSprite = document.getElementById('pet-sprite');
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
  document.getElementById('bar-hp').style.width = player.hp / player.maxHp * 100 + "%";
  document.getElementById('txt-mp').textContent = Math.round(player.mp);
  document.getElementById('txt-max-mp').textContent = player.maxMp;
  document.getElementById('bar-mp').style.width = player.mp / player.maxMp * 100 + "%";
  document.getElementById('txt-hg').textContent = player.hg;
  document.getElementById('bar-hg').style.width = player.hg + "%";
  document.getElementById('txt-sl').textContent = player.sl;
  document.getElementById('bar-sl').style.width = player.sl + "%";
  document.getElementById('txt-xp').textContent = player.xp;
  document.getElementById('bar-xp').style.width = player.xp / GAME_CONSTANTS.LEVEL_UP_XP * 100 + "%";
  document.getElementById('txt-atk').textContent = player.atk;
  document.getElementById('txt-def').textContent = player.def; // Обновление dungeon-level

  var dungeonLevelElement = document.getElementById('dungeon-level');

  if (dungeonLevelElement) {
    dungeonLevelElement.textContent = "\u042D\u0442\u0430\u0436: ".concat(player.dungeonFloor);
  } // Эффекты для низких показателей


  if (player.hp < 30) document.getElementById('bar-hp').classList.add('low');else document.getElementById('bar-hp').classList.remove('low');
  if (player.mp < 15) document.getElementById('bar-mp').classList.add('low');else document.getElementById('bar-mp').classList.remove('low');
  if (player.hg < 30) document.getElementById('bar-hg').classList.add('low');else document.getElementById('bar-hg').classList.remove('low');
  if (player.sl < 30) document.getElementById('bar-sl').classList.add('low');else document.getElementById('bar-sl').classList.remove('low'); // Обновление HP врага в бою

  if (enemy) {
    document.getElementById('enemy-hp').textContent = enemy.currentHp;
  }
}

function animatePet() {
  var sprite = document.getElementById('pet-sprite');
  sprite.classList.add('pet-jump');
  setTimeout(function () {
    return sprite.classList.remove('pet-jump');
  }, 400);
}

function showDamageText(amount, target) {
  var isCrit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var stage = document.querySelector('.stage');
  var text = document.createElement('div');
  text.className = isCrit ? 'damage-text crit-text' : 'damage-text';
  text.textContent = "-".concat(Math.round(amount));
  text.style.left = "".concat(50 + (Math.random() * 20 - 10), "%");
  text.style.top = "".concat(50 + (Math.random() * 20 - 10), "%");
  stage.appendChild(text);
  setTimeout(function () {
    if (text.parentNode) {
      text.parentNode.removeChild(text);
    }
  }, 1000);
}

function showHealText(amount, target) {
  var stage = document.querySelector('.stage');
  var text = document.createElement('div');
  text.className = 'heal-text';
  text.textContent = "+".concat(Math.round(amount));
  text.style.left = "".concat(50 + (Math.random() * 20 - 10), "%");
  text.style.top = "".concat(50 + (Math.random() * 20 - 10), "%");
  stage.appendChild(text);
  setTimeout(function () {
    if (text.parentNode) {
      text.parentNode.removeChild(text);
    }
  }, 1000);
}

function getBuffName(buff) {
  switch (buff.stat) {
    case 'atk':
      return "Атака";

    case 'def':
      return "Защита";

    case 'crit':
      return "Крит";

    default:
      return "Бафф";
  }
}

function addBuff(buff) {
  player.buffs.push(buff); // Визуальная индикация

  var statName = getBuffName(buff);
  showNotification("".concat(statName, " +").concat(buff.value), "info", 2000);
}

function updateSkillButtons() {
  var skillButtons = {
    'fireball': document.getElementById('skill-fireball'),
    'ice': document.getElementById('skill-ice'),
    'heal': document.getElementById('skill-heal')
  };
  Object.entries(skillButtons).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        skill = _ref2[0],
        button = _ref2[1];

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
  switch (stat) {
    case 'atk':
      return 'ATK';

    case 'def':
      return 'DEF';

    case 'crit':
      return 'крит';

    case 'dodge':
      return 'уклонение';

    case 'maxHp':
      return 'Max HP';

    case 'maxMp':
      return 'Max MP';

    default:
      return stat;
  }
} // ===== СОХРАНЕНИЕ =====


function saveGame() {
  try {
    var gameData = {
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
        unlockedSkills: _toConsumableArray(player.unlockedSkills),
        originalEmoji: player.originalEmoji,
        difficulty: player.difficulty,
        permanentBuffs: _toConsumableArray(player.permanentBuffs),
        dungeonFloor: player.dungeonFloor,
        lastBossFloor: player.lastBossFloor
      },
      inventory: inventory.map(function (item) {
        return {
          id: item.id,
          quantity: item.quantity
        };
      }),
      activeQuests: activeQuests.map(function (quest) {
        return {
          id: quest.id,
          progress: quest.progress,
          completed: quest.completed
        };
      }),
      completedQuests: completedQuests.map(function (quest) {
        return quest.id;
      })
    };
    localStorage.setItem('pat_rpg_save', JSON.stringify(gameData));
  } catch (e) {
    console.error("Ошибка сохранения:", e);
  }
}

function loadGame() {
  try {
    var saved = localStorage.getItem('pat_rpg_save');
    console.log("Попытка загрузить сохранение:", saved ? "данные есть" : "нет данных");

    if (!saved) {
      console.log("Нет сохраненных данных");
      return false;
    }

    var data = JSON.parse(saved);
    console.log("Данные загружены:", data); // ВАЖНО: Восстанавливаем только если есть основные данные

    if (!data.player || !data.player.name) {
      console.log("Нет данных игрока");
      return false;
    } // Восстанавливаем игрока


    Object.assign(player, data.player); // Убедимся, что важные поля инициализированы

    if (!player.unlockedSkills) player.unlockedSkills = ['basic'];
    if (!player.buffs) player.buffs = [];
    if (!player.permanentBuffs) player.permanentBuffs = [];
    if (!player.difficulty) player.difficulty = 'normal'; // Загружаем инвентарь

    inventory = [];

    if (data.inventory && Array.isArray(data.inventory)) {
      data.inventory.forEach(function (itemData) {
        var baseItem = ITEMS[itemData.id];

        if (baseItem) {
          inventory.push(_objectSpread({}, baseItem, {
            quantity: itemData.quantity || 1
          }));
        }
      });
    } else {
      // Стандартный начальный инвентарь
      inventory = [_objectSpread({}, ITEMS.health_potion, {
        quantity: 2
      }), _objectSpread({}, ITEMS.mana_potion, {
        quantity: 1
      })];
    } // Загружаем квесты


    activeQuests = data.activeQuests || [];
    completedQuests = data.completedQuests || []; // Восстанавливаем сложность

    if (player.difficulty && DIFFICULTY[player.difficulty]) {
      currentDifficulty = DIFFICULTY[player.difficulty];
    } else {
      currentDifficulty = DIFFICULTY.normal;
      player.difficulty = 'normal';
    }

    console.log("Загрузка успешна для игрока:", player.name);
    return true;
  } catch (e) {
    console.error("Ошибка загрузки:", e); // При ошибке очищаем сохранение

    localStorage.removeItem('pat_rpg_save');
    return false;
  }
}

function resetGame() {
  if (confirm("Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.")) {
    localStorage.removeItem('pat_rpg_save');
    location.reload();
  }
} // ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====


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
window.animatePet = animatePet; // Экспорт функций для модулей

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
window.checkQuestsProgress = checkQuestsProgress; // ===== ЗАГРУЗКА ИГРЫ =====

window.addEventListener('DOMContentLoaded', function () {
  console.log("DOM загружен, инициализация..."); // Автофокус на поле ввода имени

  document.getElementById('name-input').focus(); // Обработка Enter в поле ввода

  document.getElementById('name-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      console.log("Нажата клавиша Enter");
      initGame();
    }
  }); // Обработка клика по питомцу для прыжка

  document.getElementById('pet-sprite').addEventListener('click', animatePet); // Пробуем загрузить сохранение

  if (loadGame()) {
    console.log("Сохранение загружено"); // Если есть сохраненный игрок с именем

    if (player.name && player.name !== "") {
      console.log("Продолжаем игру для:", player.name); // Прячем экран создания

      document.getElementById('setup-screen').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden'); // Восстанавливаем интерфейс

      document.getElementById('ui-name').textContent = player.name;
      document.getElementById('pet-sprite').textContent = player.emoji; // Если питомец мертв

      if (player.dead) {
        document.getElementById('pet-sprite').textContent = "💀";
        log("Ваш питомец погиб...");
      } else {
        // Обновляем индикатор эволюции
        if (player.evolutionLevel > 0) {
          var evolutions = EVOLUTIONS[player.originalEmoji];

          if (evolutions) {
            var evolution = evolutions.find(function (e) {
              return e.level <= player.evolutionLevel;
            });

            if (evolution) {
              var indicator = document.getElementById('evolution-indicator');
              indicator.innerHTML = "<span style=\"color: var(--warning)\">".concat(evolution.emoji, "</span>");
              indicator.title = evolution.name;
            }
          }
        } // Восстанавливаем сложность


        if (player.difficulty && DIFFICULTY[player.difficulty]) {
          currentDifficulty = DIFFICULTY[player.difficulty]; // Обновляем выбор в меню

          document.getElementById('difficulty-select').value = player.difficulty;
        } // Запускаем игру


        startGameLoop();
        updateUI();
        updateSkillButtons();
        log("\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C, ".concat(player.name, "!"));
      }
    } else {
      console.log("Нет сохранения или имя пустое, показываем экран создания"); // Показываем экран создания

      document.getElementById('setup-screen').classList.remove('hidden');
      document.getElementById('game-screen').classList.add('hidden');
    }
  } else {
    console.log("Нет сохранения, показываем экран создания"); // Показываем экран создания

    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
  } // Добавим отладочную кнопку для очистки сохранения


  console.log("Для очистки сохранения введите в консоли: localStorage.removeItem('pat_rpg_save')");
});
//# sourceMappingURL=game.dev.js.map
