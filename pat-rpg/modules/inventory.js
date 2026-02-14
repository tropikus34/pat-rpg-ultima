// ===== ИНВЕНТАРЬ И ПРЕДМЕТЫ =====

function showInventory() {
    updateInventoryDisplay();
    document.getElementById('inventory-modal').classList.remove('hidden');
}

function updateInventoryDisplay() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    inventory.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.innerHTML = `
            <div style="font-size:24px">${item.emoji}</div>
            <div style="font-size:10px; margin-top:5px">${item.name}</div>
            ${item.quantity > 1 ? `<div class="item-count">${item.quantity}</div>` : ''}
        `;
        
        slot.title = `${item.description}${item.quantity > 1 ? ` (${item.quantity})` : ''}`;
        
        slot.addEventListener('click', () => {
            useItem(item.id);
        });
        
        grid.appendChild(slot);
    });
    
    // Добавляем пустые слоты
    for (let i = inventory.length; i < 20; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.style.opacity = '0.5';
        slot.textContent = '＋';
        grid.appendChild(slot);
    }
}

function addToInventory(item, quantity = 1) {
    const existing = inventory.find(i => i.id === item.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        inventory.push({ ...item, quantity });
    }
    return true;
}

function useItem(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item) {
        showNotification("Предмет не найден!", "error");
        return;
    }
    
    if (player.dead) {
        showNotification("Нельзя использовать предметы когда питомец мёртв!", "error");
        return;
    }
    
    applyItemEffect(item);
    
    // Удаление предмета
    if (item.quantity > 1) {
        item.quantity--;
    } else {
        inventory = inventory.filter(i => i.id !== itemId);
    }
    
    updateInventoryDisplay();
    updateUI();
    saveGame();
    
    log(`Использован предмет: ${item.emoji} ${item.name}`);
}

function applyItemEffect(item) {
    const effect = item.effect;
    
    switch (effect.type) {
        case 'heal':
            const healAmount = effect.value;
            player.hp = Math.min(player.maxHp, player.hp + healAmount);
            showHealText(healAmount, player.emoji);
            showNotification(`+${healAmount} HP`, "success");
            break;
            
        case 'mp':
            const mpAmount = effect.value;
            player.mp = Math.min(player.maxMp, player.mp + mpAmount);
            showNotification(`+${mpAmount} MP`, "success");
            break;
            
        case 'buff':
            const buff = {
                id: effect.stat + '_buff',
                stat: effect.stat,
                value: effect.value,
                expires: Date.now() + (effect.duration * 1000),
                source: item.id
            };
            addBuff(buff);
            showNotification(`${item.name} активирован!`, "info");
            break;
            
        case 'perm_buff':
            // Постоянный бафф (от эпических предметов)
            if (!player.permanentBuffs.includes(item.id)) {
                player.permanentBuffs.push(item.id);
                if (effect.stats) {
                    if (effect.stats.atk) player.atk += effect.stats.atk;
                    if (effect.stats.def) player.def += effect.stats.def;
                    if (effect.stats.maxHp) {
                        player.maxHp += effect.stats.maxHp;
                        player.hp = Math.min(player.maxHp, player.hp + effect.stats.maxHp);
                    }
                    if (effect.stats.maxMp) {
                        player.maxMp += effect.stats.maxMp;
                        player.mp = Math.min(player.maxMp, player.mp + effect.stats.maxMp);
                    }
                }
                showNotification(`Постоянный бафф: ${item.name}`, "success", 4000);
                log(`⚡ Получен перманентный бафф: ${item.name}!`);
            }
            break;
            
        case 'feed':
            player.hg = Math.min(100, player.hg + effect.value);
            showNotification(`+${effect.value} сытости`, "info");
            break;
            
        case 'revive':
            if (player.dead) {
                player.dead = false;
                player.hp = Math.round(player.maxHp * (effect.value / 100));
                document.getElementById('pet-sprite').textContent = player.emoji;
                showNotification("Питомец воскрес!", "success");
                startGameLoop();
            }
            break;
    }
}

// ===== МАГАЗИН =====

function showShop() {
    closeModal('inventory-modal');
    updateShopDisplay();
    document.getElementById('shop-modal').classList.remove('hidden');
}

function updateShopDisplay() {
    const grid = document.getElementById('shop-items');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    SHOP_ITEMS.forEach(item => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        shopItem.innerHTML = `
            <div style="font-size:32px">${item.emoji}</div>
            <div style="font-size:12px; font-weight:bold; margin:5px 0">${item.name}</div>
            <div style="font-size:10px; color:#64748b;">${item.description}</div>
            <div class="shop-item-price">${item.price}💰</div>
        `;
        
        shopItem.addEventListener('click', () => {
            buyItem(item);
        });
        
        grid.appendChild(shopItem);
    });
    
    document.getElementById('shop-coins').textContent = player.coins;
}

function buyItem(item) {
    if (player.coins < item.price) {
        log("Недостаточно монет!");
        return;
    }
    
    player.coins -= item.price;
    addToInventory(item);
    
    log(`Куплено: ${item.emoji} ${item.name} за ${item.price}💰`);
    updateUI();
    updateShopDisplay();
    saveGame();
}

// Экспорт функций
window.showInventory = showInventory;
window.showShop = showShop;
window.addToInventory = addToInventory;
window.useItem = useItem;