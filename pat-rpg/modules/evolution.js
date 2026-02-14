// ===== ЭВОЛЮЦИЯ ПИТОМЦА =====

function checkEvolution() {
    if (player.dead || player.inBattle) return;
    
    const petEvolutions = EVOLUTIONS[player.originalEmoji];
    if (!petEvolutions) return;
    
    // Проверяем каждую возможную эволюцию
    petEvolutions.forEach(evolution => {
        if (player.lvl >= evolution.level && 
            player.evolutionLevel < evolution.level && 
            !currentEvolution) {
            
            currentEvolution = evolution;
            showEvolutionNotification(evolution);
        }
    });
}

function showEvolutionNotification(evolution) {
    const notification = document.createElement('div');
    notification.className = 'evolution-notification';
    notification.innerHTML = `
        <div style="font-size: 24px"></div>
        <div>
            <div style="font-weight: bold; font-size: 14px">Доступна эволюция!</div>
            <div style="font-size: 12px; opacity: 0.9;">Нажмите чтобы эволюционировать в ${evolution.name}</div>
        </div>
    `;
    
    notification.addEventListener('click', () => {
        confirmEvolution();
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Автоудаление через 30 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 30000);
}

function confirmEvolution() {
    if (!currentEvolution) return;
    
    const evolution = currentEvolution;
    
    // Анимация эволюции
    const petSprite = document.getElementById('pet-sprite');
    petSprite.style.animation = 'jump 0.5s infinite';
    
    setTimeout(() => {
        // Применяем бонусы
        if (evolution.bonus.maxHp) {
            player.maxHp += evolution.bonus.maxHp;
            player.hp = player.maxHp;
        }
        if (evolution.bonus.atk) player.atk += evolution.bonus.atk;
        if (evolution.bonus.def) player.def += evolution.bonus.def;
        if (evolution.bonus.mp) player.maxMp += evolution.bonus.mp;
        player.emoji = evolution.emoji;
        player.evolutionLevel = evolution.level;
        
        // Обновляем отображение
        petSprite.textContent = player.emoji;
        petSprite.style.animation = '';
        
        // Уведомление
        log(`Питомец эволюционировал в ${evolution.name}!`);
        showNotification(`Эволюция в ${evolution.name}!`, "success", 5000);
        
        // Разблокировка навыков для специальных эволюций
        if (evolution.emoji === '🐉' && !player.unlockedSkills.includes('fireball')) {
            player.unlockedSkills.push('fireball');
            showNotification("Разблокирован навык: Огненный шар!", "info");
        }
        
        updateUI();
        updateSkillButtons();
        updateQuestProgress('evolve', 1);
        saveGame();
        
        // Показываем индикатор эволюции
        const indicator = document.getElementById('evolution-indicator');
        indicator.innerHTML = `<span style="color: var(--warning)">${evolution.emoji}</span>`;
        indicator.title = evolution.name;
        
        currentEvolution = null;
    }, 1500);
}