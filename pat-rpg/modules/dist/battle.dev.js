"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ===== БОЕВАЯ СИСТЕМА =====
function calculateDamage(attack, defense) {
  var damage = attack * (0.8 + Math.random() * 0.4);
  damage = Math.max(1, damage - defense * 0.5); // Учет баффов

  var attackBuff = player.buffs.find(function (b) {
    return b.stat === 'atk';
  });

  if (attackBuff) {
    damage += attackBuff.value;
  }

  return Math.round(damage);
}

function enterDungeon() {
  if (player.hp < GAME_CONSTANTS.MIN_HP_FOR_BATTLE) {
    showNotification("\u041F\u0438\u0442\u043E\u043C\u0435\u0446 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0441\u043B\u0430\u0431! \u041D\u0443\u0436\u043D\u043E \u0445\u043E\u0442\u044F \u0431\u044B ".concat(GAME_CONSTANTS.MIN_HP_FOR_BATTLE, " HP"), "error");
    return;
  }

  if (player.sleeping) {
    showNotification("Питомец спит! Разбудите его для боя.", "error");
    return;
  }

  player.inBattle = true; // Выбор врага с учетом уровня

  var enemyTier = Math.min(Math.floor(player.lvl / 3), ENEMIES.length - 1);
  enemy = _objectSpread({}, ENEMIES[enemyTier]); // Применяем модификатор сложности

  enemy.hp = Math.round(enemy.hp * currentDifficulty.enemyMultiplier);
  enemy.atk = Math.round(enemy.atk * currentDifficulty.enemyMultiplier);
  enemy.def = Math.round(enemy.def * currentDifficulty.enemyMultiplier);
  enemy.currentHp = enemy.hp; // Отображение врага

  var enemySprite = document.getElementById('enemy-sprite');
  enemySprite.textContent = enemy.e;
  enemySprite.className = "enemy enemy-idle";
  enemySprite.classList.remove('hidden'); // Обновление информации

  document.getElementById('enemy-name').textContent = enemy.n;
  document.getElementById('enemy-hp').textContent = enemy.currentHp;
  document.getElementById('enemy-max-hp').textContent = enemy.hp; // Переключение интерфейса

  document.getElementById('controls-main').classList.add('hidden');
  document.getElementById('controls-battle').classList.remove('hidden');
  log("\u041F\u043E\u044F\u0432\u0438\u043B\u0441\u044F ".concat(enemy.n, "! (").concat(enemy.hp, " HP, ").concat(enemy.atk, " ATK)"));
  showNotification("\u041D\u0430\u0447\u0430\u043B\u0441\u044F \u0431\u043E\u0439 \u0441 ".concat(enemy.n, "!"), "warning");
}

function useSkill(skillType) {
  if (!enemy || !player.inBattle) return;
  var skill = SKILLS[skillType];

  if (!skill) {
    log("\u041D\u0430\u0432\u044B\u043A ".concat(skillType, " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D!"));
    return;
  } // Проверка маны


  if (player.mp < skill.cost) {
    log("Недостаточно маны!");
    showNotification("Недостаточно маны!", "error");
    return;
  } // Проверка разблокировки навыка


  if (!player.unlockedSkills.includes(skillType)) {
    log("Навык не разблокирован!");
    showNotification("Навык не разблокирован!", "error");
    return;
  }

  animatePet();
  player.mp -= skill.cost;
  player.skillsUsed++;

  switch (skillType) {
    case 'basic':
      basicAttack();
      break;

    case 'fireball':
      fireballAttack();
      break;

    case 'ice':
      iceAttack();
      break;

    case 'heal':
      healSkill();
      break;

    default:
      petSkillAttack(skillType);
      break;
  }

  updateUI(); // Проверка конца боя

  if (enemy.currentHp <= 0) {
    winBattle();
    return;
  } // Ход врага


  setTimeout(enemyTurn, 1000);
}

function basicAttack() {
  var damage = calculateDamage(player.atk, enemy.def);
  var isCrit = Math.random() < player.crit;

  if (isCrit) {
    damage *= 2;
    showDamageText(damage, enemy.e, true);
    log("КРИТИЧЕСКИЙ УДАР!");
  } else {
    showDamageText(damage, enemy.e);
  }

  enemy.currentHp -= damage;
  var enemySprite = document.getElementById('enemy-sprite');
  enemySprite.classList.add('enemy-hit');
  setTimeout(function () {
    return enemySprite.classList.remove('enemy-hit');
  }, 400);
  log("\u0412\u044B \u043D\u0430\u043D\u0435\u0441\u043B\u0438 ".concat(Math.round(damage), " \u0443\u0440\u043E\u043D\u0430!"));
}

function fireballAttack() {
  var damage = calculateDamage(player.atk * SKILLS.fireball.damage, enemy.def);
  enemy.currentHp -= damage;
  showDamageText(damage, enemy.e);
  log("\u041E\u0433\u043D\u0435\u043D\u043D\u044B\u0439 \u0448\u0430\u0440 \u043D\u0430\u043D\u043E\u0441\u0438\u0442 ".concat(Math.round(damage), " \u0443\u0440\u043E\u043D\u0430!"));
}

function iceAttack() {
  var damage = calculateDamage(player.atk * SKILLS.ice.damage, enemy.def);
  enemy.currentHp -= damage;
  showDamageText(damage, enemy.e);
  log("\u041B\u0435\u0434\u044F\u043D\u0430\u044F \u0441\u0442\u0440\u0435\u043B\u0430 \u043D\u0430\u043D\u043E\u0441\u0438\u0442 ".concat(Math.round(damage), " \u0443\u0440\u043E\u043D\u0430!"));
}

function healSkill() {
  var healAmount = SKILLS.heal.heal;
  player.hp = Math.min(player.maxHp, player.hp + healAmount);
  showHealText(healAmount, player.emoji);
  log("\u0412\u044B \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B\u0438 ".concat(healAmount, " HP!"));
  updateUI();
}

function petSkillAttack(skillType) {
  var skill = SKILLS[skillType];

  if (!skill) {
    console.error("Skill ".concat(skillType, " not found"));
    log("\u041E\u0448\u0438\u0431\u043A\u0430: \u043D\u0430\u0432\u044B\u043A ".concat(skillType, " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D!"));
    return;
  }

  var damage = calculateDamage(player.atk * (skill.damage || 1), enemy.def);
  enemy.currentHp -= damage;
  showDamageText(damage, enemy.e);
  log("".concat(skill.name, " \u043D\u0430\u043D\u043E\u0441\u0438\u0442 ").concat(Math.round(damage), " \u0443\u0440\u043E\u043D\u0430!"));
}

function enemyTurn() {
  if (!enemy || enemy.currentHp <= 0) return;
  var enemySprite = document.getElementById('enemy-sprite'); // Враги иногда используют особые атаки

  var enemyDamage = enemy.atk;

  if (Math.random() < 0.3) {
    enemyDamage *= 1.5;
    log("".concat(enemy.n, " \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u043C\u043E\u0449\u043D\u0443\u044E \u0430\u0442\u0430\u043A\u0443!"));
  } // Учет защиты игрока


  enemyDamage = Math.max(1, enemyDamage - player.def * 0.3); // Учет баффов защиты

  var defenseBuff = player.buffs.find(function (b) {
    return b.stat === 'def';
  });

  if (defenseBuff) {
    enemyDamage = Math.max(1, enemyDamage - defenseBuff.value);
  }

  enemySprite.classList.add('enemy-attack');
  setTimeout(function () {
    return enemySprite.classList.remove('enemy-attack');
  }, 500);
  player.hp -= Math.round(enemyDamage);
  showDamageText(enemyDamage, player.emoji);
  log("".concat(enemy.n, " \u0430\u0442\u0430\u043A\u0443\u0435\u0442 \u043D\u0430 ").concat(Math.round(enemyDamage), " \u0443\u0440\u043E\u043D\u0430!"));
  updateUI();
  document.getElementById('enemy-hp').textContent = enemy.currentHp;

  if (player.hp <= 0) {
    die();
    exitBattle();
  }
}

function escapeBattle() {
  if (!enemy || !player.inBattle) return;
  var escapeChance = GAME_CONSTANTS.ESCAPE_CHANCE;

  if (Math.random() < escapeChance) {
    log("Вы успешно сбежали!");
    exitBattle();
  } else {
    log("Не удалось сбежать!");
    setTimeout(enemyTurn, 500);
  }
}

function winBattle() {
  var enemySprite = document.getElementById('enemy-sprite');
  enemySprite.className = "enemy enemy-die"; // Награды с учетом сложности

  var xpMultiplier = currentDifficulty.xpMultiplier;
  var coinMultiplier = currentDifficulty.coinMultiplier;
  var totalCoins = Math.round(enemy.coins * coinMultiplier);
  var totalXP = Math.round(enemy.xp * xpMultiplier);
  player.coins += totalCoins;
  player.enemiesDefeated++;
  log("\u041F\u043E\u0431\u0435\u0434\u0430 \u043D\u0430\u0434 ".concat(enemy.n, "! +").concat(totalCoins, "\uD83D\uDCB0 +").concat(Math.round(totalXP), " \u043E\u043F\u044B\u0442\u0430"));
  showNotification("\u041F\u043E\u0431\u0435\u0434\u0430! +".concat(totalCoins, "\uD83D\uDCB0"), "success");
  addXP(totalXP);
  updateQuestProgress('kill', 1); // Шанс на дроп предмета

  if (Math.random() < 0.4) {
    var randomItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];

    if (addToInventory(randomItem)) {
      log("\u041F\u043E\u043B\u0443\u0447\u0435\u043D \u043F\u0440\u0435\u0434\u043C\u0435\u0442: ".concat(randomItem.emoji, " ").concat(randomItem.name, "!"));
      showNotification("\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: ".concat(randomItem.emoji, " ").concat(randomItem.name), "info");
    }
  }

  setTimeout(exitBattle, 1500);
}

function exitBattle() {
  enemy = null;
  player.inBattle = false;
  document.getElementById('enemy-sprite').classList.add('hidden');
  document.getElementById('controls-main').classList.remove('hidden');
  document.getElementById('controls-battle').classList.add('hidden');
  updateUI();
  saveGame();
} // Экспорт функций


window.enterDungeon = enterDungeon;
window.useSkill = useSkill;
window.escapeBattle = escapeBattle;
window.calculateDamage = calculateDamage;
window.petSkillAttack = petSkillAttack;
//# sourceMappingURL=battle.dev.js.map
