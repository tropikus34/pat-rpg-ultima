// ===== UI УТИЛИТЫ =====

function log(message) {
    const logElement = document.getElementById('battle-log');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    logElement.innerHTML = `<span style="opacity:0.7">[${timestamp}]</span> ${message}`;
    
    logElement.style.animation = 'none';
    setTimeout(() => {
        logElement.style.animation = 'fadeIn 0.3s';
    }, 10);
}

function showNotification(message, type = 'info', duration = 3000) {
    const notificationArea = document.getElementById('notification-area');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationArea.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function showSkills() {
    updateSkillsDisplay();
    document.getElementById('skills-modal').classList.remove('hidden');
}

function updateSkillsDisplay() {
    const skillsList = document.getElementById('skills-list');
    const currentSkills = document.getElementById('current-skills');
    
    skillsList.innerHTML = '<h4>Все навыки:</h4>';
    currentSkills.innerHTML = '';
    
    Object.entries(SKILLS).forEach(([key, skill]) => {
        const isUnlocked = player.unlockedSkills.includes(key);
        const skillElement = document.createElement('div');
        skillElement.style.background = '#f1f5f9';
        skillElement.style.borderRadius = '10px';
        skillElement.style.padding = '10px';
        skillElement.style.margin = '5px 0';
        skillElement.style.opacity = isUnlocked ? '1' : '0.6';
        
        skillElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold; font-size: 13px">${skill.name}</div>
                    <div style="font-size: 11px; color: #64748b">${skill.description}</div>
                </div>
                <div style="font-size: 12px;">
                    ${isUnlocked ? '<span style="color: var(--success)">✓ Разблокирован</span>' : 
                    `<span style="color: #64748b">Заблокирован</span>`}
                </div>
            </div>
            <div style="font-size: 10px; margin-top: 5px;">
                ${skill.cost > 0 ? `Стоимость: ${skill.cost} MP` : 'Бесплатно'}
            </div>
        `;
        
        skillsList.appendChild(skillElement);
    });
    
    // Текущие навыки
    player.unlockedSkills.forEach(skillKey => {
        const skill = SKILLS[skillKey];
        if (skill) {
            const skillSpan = document.createElement('span');
            skillSpan.style.display = 'inline-block';
            skillSpan.style.margin = '5px';
            skillSpan.style.padding = '5px 10px';
            skillSpan.style.background = '#e2e8f0';
            skillSpan.style.borderRadius = '8px';
            skillSpan.style.fontSize = '12px';
            skillSpan.textContent = skill.name;
            currentSkills.appendChild(skillSpan);
        }
    });
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

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}