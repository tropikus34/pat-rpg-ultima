// ===== БОЕВАЯ СИСТЕМА =====

function calculateDamage(attack, defense) {
    let damage = attack * (0.8 + Math.random() * 0.4);
    damage = Math.max(1, damage - defense * 0.5);
    
    // Учет баффов
    const attackBuff = player.buffs.find(b => b.stat === 'atk');
    if (attackBuff) {
        damage += attackBuff.value;
    }
    
    return Math.round(damage);
}

function enterDungeon() {
    if (player.hp < GAME_CONSTANTS.MIN_HP_FOR_BATTLE) {
        showNotification(`Питомец слишком слаб! Нужно хотя бы ${GAME_CONSTANTS.MIN_HP_FOR_BATTLE} HP`, "error");
        return;
    }
    
    if (player.sleeping) {
        showNotification("Питомец спит! Разбудите его для боя.", "error");
        return;
    }
    
    player.inBattle = true;
    
    // Выбор врага с учетом уровня
    const enemyTier = Math.min(Math.floor(player.lvl / 3), ENEMIES.length - 1);
    enemy = { ...ENEMIES[enemyTier] };
    
    // Применяем модификатор сложности
    enemy.hp = Math.round(enemy.hp * currentDifficulty.enemyMultiplier);
    enemy.atk = Math.round(enemy.atk * currentDifficulty.enemyMultiplier);
    enemy.def = Math.round(enemy.def * currentDifficulty.enemyMultiplier);
    
    enemy.currentHp = enemy.hp;
    
    // Отображение врага
    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.textContent = enemy.e;
    enemySprite.className = "enemy enemy-idle";
    enemySprite.classList.remove('hidden');
    
    // Обновление информации
    document.getElementById('enemy-name').textContent = enemy.n;
    document.getElementById('enemy-hp').textContent = enemy.currentHp;
    document.getElementById('enemy-max-hp').textContent = enemy.hp;
    
    // Переключение интерфейса
    document.getElementById('controls-main').classList.add('hidden');
    document.getElementById('controls-battle').classList.remove('hidden');
    
    log(`Появился ${enemy.n}! (${enemy.hp} HP, ${enemy.atk} ATK)`);
    showNotification(`Начался бой с ${enemy.n}!`, "warning");
}

function useSkill(skillType) {
    if (!enemy || !player.inBattle) return;
    
    const skill = SKILLS[skillType];
    if (!skill) {
        log(`Навык ${skillType} не найден!`);
        return;
    }
    
    // Проверка маны
    if (player.mp < skill.cost) {
        log("Недостаточно маны!");
        showNotification("Недостаточно маны!", "error");
        return;
    }
    
    // Проверка разблокировки навыка
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
    
    updateUI();
    
    // Проверка конца боя
    if (enemy.currentHp <= 0) {
        winBattle();
        return;
    }
    
    // Ход врага
    setTimeout(enemyTurn, 1000);
}

function basicAttack() {
    let damage = calculateDamage(player.atk, enemy.def);
    const isCrit = Math.random() < player.crit;
    
    if (isCrit) {
        damage *= 2;
        showDamageText(damage, enemy.e, true);
        log("КРИТИЧЕСКИЙ УДАР!");
    } else {
        showDamageText(damage, enemy.e);
    }
    
    enemy.currentHp -= damage;
    
    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.classList.add('enemy-hit');
    setTimeout(() => enemySprite.classList.remove('enemy-hit'), 400);
    
    log(`Вы нанесли ${Math.round(damage)} урона!`);
}

function fireballAttack() {
    let damage = calculateDamage(player.atk * SKILLS.fireball.damage, enemy.def);
    
    enemy.currentHp -= damage;
    
    showDamageText(damage, enemy.e);
    log(`Огненный шар наносит ${Math.round(damage)} урона!`);
}

function iceAttack() {
    let damage = calculateDamage(player.atk * SKILLS.ice.damage, enemy.def);
    
    enemy.currentHp -= damage;
    
    showDamageText(damage, enemy.e);
    log(`Ледяная стрела наносит ${Math.round(damage)} урона!`);
}

function healSkill() {
    const healAmount = SKILLS.heal.heal;
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    
    showHealText(healAmount, player.emoji);
    log(`Вы восстановили ${healAmount} HP!`);
    updateUI();
}

function petSkillAttack(skillType) {
    const skill = SKILLS[skillType];
    if (!skill) {
        console.error(`Skill ${skillType} not found`);
        log(`Ошибка: навык ${skillType} не найден!`);
        return;
    }
    
    let damage = calculateDamage(player.atk * (skill.damage || 1), enemy.def);
    
    enemy.currentHp -= damage;
    
    showDamageText(damage, enemy.e);
    log(`${skill.name} наносит ${Math.round(damage)} урона!`);
}

function enemyTurn() {
    if (!enemy || enemy.currentHp <= 0) return;
    
    const enemySprite = document.getElementById('enemy-sprite');
    
    // Враги иногда используют особые атаки
    let enemyDamage = enemy.atk;
    if (Math.random() < 0.3) {
        enemyDamage *= 1.5;
        log(`${enemy.n} использует мощную атаку!`);
    }
    
    // Учет защиты игрока
    enemyDamage = Math.max(1, enemyDamage - player.def * 0.3);
    
    // Учет баффов защиты
    const defenseBuff = player.buffs.find(b => b.stat === 'def');
    if (defenseBuff) {
        enemyDamage = Math.max(1, enemyDamage - defenseBuff.value);
    }
    
    enemySprite.classList.add('enemy-attack');
    setTimeout(() => enemySprite.classList.remove('enemy-attack'), 500);
    
    player.hp -= Math.round(enemyDamage);
    
    showDamageText(enemyDamage, player.emoji);
    log(`${enemy.n} атакует на ${Math.round(enemyDamage)} урона!`);
    
    updateUI();
    document.getElementById('enemy-hp').textContent = enemy.currentHp;
    
    if (player.hp <= 0) {
        die();
        exitBattle();
    }
}

function escapeBattle() {
    if (!enemy || !player.inBattle) return;
    
    const escapeChance = GAME_CONSTANTS.ESCAPE_CHANCE;
    if (Math.random() < escapeChance) {
        log("Вы успешно сбежали!");
        exitBattle();
    } else {
        log("Не удалось сбежать!");
        setTimeout(enemyTurn, 500);
    }
}

function winBattle() {
    const enemySprite = document.getElementById('enemy-sprite');
    enemySprite.className = "enemy enemy-die";
    
    // Награды с учетом сложности
    const xpMultiplier = currentDifficulty.xpMultiplier;
    const coinMultiplier = currentDifficulty.coinMultiplier;
    
    const totalCoins = Math.round(enemy.coins * coinMultiplier);
    const totalXP = Math.round(enemy.xp * xpMultiplier);
    
    player.coins += totalCoins;
    player.enemiesDefeated++;
    
    log(`Победа над ${enemy.n}! +${totalCoins}💰 +${Math.round(totalXP)} опыта`);
    showNotification(`Победа! +${totalCoins}💰`, "success");
    
    addXP(totalXP);
    updateQuestProgress('kill', 1);
    
    // Шанс на дроп предмета
    if (Math.random() < 0.4) {
        const randomItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        if (addToInventory(randomItem)) {
            log(`Получен предмет: ${randomItem.emoji} ${randomItem.name}!`);
            showNotification(`Получено: ${randomItem.emoji} ${randomItem.name}`, "info");
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
}

// Экспорт функций
window.enterDungeon = enterDungeon;
window.useSkill = useSkill;
window.escapeBattle = escapeBattle;
window.calculateDamage = calculateDamage;
window.petSkillAttack = petSkillAttack;