"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ===== ИНВЕНТАРЬ И ПРЕДМЕТЫ =====
function showInventory() {
  updateInventoryDisplay();
  document.getElementById('inventory-modal').classList.remove('hidden');
}

function updateInventoryDisplay() {
  var grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';
  inventory.forEach(function (item, index) {
    var slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.innerHTML = "\n            <div style=\"font-size:24px\">".concat(item.emoji, "</div>\n            <div style=\"font-size:10px; margin-top:5px\">").concat(item.name, "</div>\n            ").concat(item.quantity > 1 ? "<div class=\"item-count\">".concat(item.quantity, "</div>") : '', "\n        ");
    slot.title = "".concat(item.description).concat(item.quantity > 1 ? " (".concat(item.quantity, ")") : '');
    slot.addEventListener('click', function () {
      useItem(item.id);
    });
    grid.appendChild(slot);
  }); // Добавляем пустые слоты

  for (var i = inventory.length; i < 20; i++) {
    var slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.style.opacity = '0.5';
    slot.textContent = '＋';
    grid.appendChild(slot);
  }
}

function addToInventory(item) {
  var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var existing = inventory.find(function (i) {
    return i.id === item.id;
  });

  if (existing) {
    existing.quantity += quantity;
  } else {
    inventory.push(_objectSpread({}, item, {
      quantity: quantity
    }));
  }

  return true;
}

function useItem(itemId) {
  var item = inventory.find(function (i) {
    return i.id === itemId;
  });

  if (!item) {
    showNotification("Предмет не найден!", "error");
    return;
  }

  if (player.dead) {
    showNotification("Нельзя использовать предметы когда питомец мёртв!", "error");
    return;
  }

  applyItemEffect(item); // Удаление предмета

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    inventory = inventory.filter(function (i) {
      return i.id !== itemId;
    });
  }

  updateInventoryDisplay();
  updateUI();
  saveGame();
  log("\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D \u043F\u0440\u0435\u0434\u043C\u0435\u0442: ".concat(item.emoji, " ").concat(item.name));
}

function applyItemEffect(item) {
  var effect = item.effect;

  switch (effect.type) {
    case 'heal':
      var healAmount = effect.value;
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      showHealText(healAmount, player.emoji);
      showNotification("+".concat(healAmount, " HP"), "success");
      break;

    case 'mp':
      var mpAmount = effect.value;
      player.mp = Math.min(player.maxMp, player.mp + mpAmount);
      showNotification("+".concat(mpAmount, " MP"), "success");
      break;

    case 'buff':
      var buff = {
        id: effect.stat + '_buff',
        stat: effect.stat,
        value: effect.value,
        expires: Date.now() + effect.duration * 1000,
        source: item.id
      };
      addBuff(buff);
      showNotification("".concat(item.name, " \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D!"), "info");
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

        showNotification("\u041F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0431\u0430\u0444\u0444: ".concat(item.name), "success", 4000);
        log("\u26A1 \u041F\u043E\u043B\u0443\u0447\u0435\u043D \u043F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u0431\u0430\u0444\u0444: ".concat(item.name, "!"));
      }

      break;

    case 'feed':
      player.hg = Math.min(100, player.hg + effect.value);
      showNotification("+".concat(effect.value, " \u0441\u044B\u0442\u043E\u0441\u0442\u0438"), "info");
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
} // ===== МАГАЗИН =====


function showShop() {
  closeModal('inventory-modal');
  updateShopDisplay();
  document.getElementById('shop-modal').classList.remove('hidden');
}

function updateShopDisplay() {
  var grid = document.getElementById('shop-items');
  if (!grid) return;
  grid.innerHTML = '';
  SHOP_ITEMS.forEach(function (item) {
    var shopItem = document.createElement('div');
    shopItem.className = 'shop-item';
    shopItem.innerHTML = "\n            <div style=\"font-size:32px\">".concat(item.emoji, "</div>\n            <div style=\"font-size:12px; font-weight:bold; margin:5px 0\">").concat(item.name, "</div>\n            <div style=\"font-size:10px; color:#64748b;\">").concat(item.description, "</div>\n            <div class=\"shop-item-price\">").concat(item.price, "\uD83D\uDCB0</div>\n        ");
    shopItem.addEventListener('click', function () {
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
  log("\u041A\u0443\u043F\u043B\u0435\u043D\u043E: ".concat(item.emoji, " ").concat(item.name, " \u0437\u0430 ").concat(item.price, "\uD83D\uDCB0"));
  updateUI();
  updateShopDisplay();
  saveGame();
} // Экспорт функций


window.showInventory = showInventory;
window.showShop = showShop;
window.addToInventory = addToInventory;
window.useItem = useItem;
//# sourceMappingURL=inventory.dev.js.map
