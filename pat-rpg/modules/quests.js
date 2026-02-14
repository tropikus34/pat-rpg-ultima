// ===== КВЕСТЫ =====

function showQuests() {
    closeModal('inventory-modal');
    updateQuestsDisplay();
    document.getElementById('quests-modal').classList.remove('hidden');
}

function acceptQuest(questId) {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest) return;
    
    if (activeQuests.find(q => q.id === questId) || completedQuests.find(q => q.id === questId)) {
        return;
    }
    
    activeQuests.push({
        ...quest,
        progress: 0,
        completed: false
    });
    
    log(`Принят квест: "${quest.title}"`);
    updateQuestsDisplay();
}

function checkQuestsProgress() {
    activeQuests.forEach(quest => {
        if (quest.completed) return;
        
        switch (quest.type) {
            case 'level':
                if (player.lvl >= quest.target) {
                    quest.progress = quest.target;
                    completeQuest(quest.id);
                }
                break;
            case 'kill':
                if (player.enemiesDefeated >= quest.target) {
                    quest.progress = quest.target;
                    completeQuest(quest.id);
                }
                break;
            case 'coins':
                if (player.coins >= quest.target) {
                    quest.progress = quest.target;
                    completeQuest(quest.id);
                }
                break;
            case 'evolve':
                if (player.evolutionLevel >= quest.target) {
                    quest.progress = quest.target;
                    completeQuest(quest.id);
                }
                break;
        }
    });
}

function updateQuestProgress(type, amount = 1) {
    activeQuests.forEach(quest => {
        if (quest.completed) return;
        
        if (quest.type === type) {
            quest.progress += amount;
            if (quest.progress >= quest.target) {
                completeQuest(quest.id);
            }
        }
    });
}

function completeQuest(questId) {
    const questIndex = activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    
    const quest = activeQuests[questIndex];
    quest.completed = true;
    
    // Награда
    player.coins += quest.reward.coins;
    addXP(quest.reward.xp);
    
    // Перемещение в завершенные
    activeQuests.splice(questIndex, 1);
    completedQuests.push(quest);
    
    log(`Квест выполнен: "${quest.title}"! +${quest.reward.coins}💰 +${quest.reward.xp} опыта`);
    showNotification(`Квест выполнен: ${quest.title}!`, "success");
    
    updateQuestsDisplay();
    updateUI();
    saveGame();
}

function updateQuestsDisplay() {
    const activeContainer = document.getElementById('active-quests');
    const completedContainer = document.getElementById('completed-quests');
    
    if (!activeContainer) return;
    
    // Активные квесты
    activeContainer.innerHTML = '<h4 style="margin-bottom: 10px;">Активные квесты</h4>';
    if (activeQuests.length === 0) {
        activeContainer.innerHTML += '<p style="color:#64748b; font-size:12px">Нет активных квестов</p>';
    } else {
        activeQuests.forEach(quest => {
            const questElement = document.createElement('div');
            questElement.className = 'quest-item';
            
            const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
            
            questElement.innerHTML = `
                <div style="font-weight:bold; font-size:13px">${quest.title}</div>
                <div style="font-size:11px; color:#64748b; margin:5px 0">${quest.description}</div>
                <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden">
                    <div style="background:var(--success); height:100%; width:${progressPercent}%"></div>
                </div>
                <div style="font-size:10px; text-align:right; margin-top:2px">
                    ${quest.progress}/${quest.target}
                </div>
            `;
            
            activeContainer.appendChild(questElement);
        });
    }
    
    // Завершенные квесты
    if (completedContainer) {
        completedContainer.innerHTML = '<h4 style="margin-bottom: 10px;">Завершенные квесты</h4>';
        if (completedQuests.length === 0) {
            completedContainer.innerHTML += '<p style="color:#64748b; font-size:12px">Нет завершенных квестов</p>';
        } else {
            completedQuests.slice(-3).reverse().forEach(quest => {
                const questElement = document.createElement('div');
                questElement.className = 'quest-item completed';
                
                questElement.innerHTML = `
                    <div style="font-weight:bold; font-size:12px">${quest.title}</div>
                    <div style="font-size:10px; color:var(--success)">✓ Выполнено</div>
                `;
                
                completedContainer.appendChild(questElement);
            });
        }
    }
}

// Экспорт функций
window.showQuests = showQuests;
window.acceptQuest = acceptQuest;
window.completeQuest = completeQuest;
window.checkQuestsProgress = checkQuestsProgress;
window.updateQuestProgress = updateQuestProgress;