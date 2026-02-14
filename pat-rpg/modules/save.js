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
                originalEmoji: player.originalEmoji
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
        if (saved) {
            const data = JSON.parse(saved);
            
            Object.assign(player, data.player || {});
            inventory = (data.inventory || []).map(itemData => {
                const baseItem = ITEMS[itemData.id];
                if (baseItem) {
                    return { ...baseItem, quantity: itemData.quantity || 1 };
                }
                return null;
            }).filter(item => item !== null);
            
            activeQuests = data.activeQuests || [];
            completedQuests = data.completedQuests || [];
            
            return true;
        }
    } catch (e) {
        console.error("Ошибка загрузки:", e);
    }
    return false;
}

function resetGame() {
    if (confirm("Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.")) {
        localStorage.removeItem('pat_rpg_save');
        location.reload();
    }
}

// ===== УТИЛИТЫ =====

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// ===== ЗАГРУЗКА ИГРЫ =====

window.addEventListener('DOMContentLoaded', function() {
    // Автофокус на поле ввода имени
    document.getElementById('name-input').focus();
    
    // Обработка Enter в поле ввода
    document.getElementById('name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            initGame();
        }
    });
    
    // Обработка клика по питомцу для прыжка
    document.getElementById('pet-sprite').addEventListener('click', animatePet);
    
    // Загрузка сохранения
    if (loadGame()) {
        if (player.dead) {
            // Экран смерти
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            document.getElementById('pet-sprite').textContent = "💀";
            document.getElementById('ui-name').textContent = player.name;
            updateUI();
            log("Ваш питомец погиб...");
        } else if (player.name) {
            // Продолжение игры
            document.getElementById('setup-screen').classList.add('hidden');
            document.getElementById('game-screen').classList.remove('hidden');
            document.getElementById('ui-name').textContent = player.name;
            document.getElementById('pet-sprite').textContent = player.emoji;
            
            // Обновление индикатора эволюции
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
            
            startGameLoop();
            updateUI();
            updateSkillButtons();
            log(`С возвращением, ${player.name}!`);
        }
    }
});