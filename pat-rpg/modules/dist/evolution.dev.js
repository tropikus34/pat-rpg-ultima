"use strict";

// ===== ЭВОЛЮЦИЯ ПИТОМЦА =====
function checkEvolution() {
  if (player.dead || player.inBattle) return;
  var petEvolutions = EVOLUTIONS[player.originalEmoji];
  if (!petEvolutions) return; // Проверяем каждую возможную эволюцию

  petEvolutions.forEach(function (evolution) {
    if (player.lvl >= evolution.level && player.evolutionLevel < evolution.level && !currentEvolution) {
      currentEvolution = evolution;
      showEvolutionNotification(evolution);
    }
  });
}

function showEvolutionNotification(evolution) {
  var notification = document.createElement('div');
  notification.className = 'evolution-notification';
  notification.innerHTML = "\n        <div style=\"font-size: 24px\"></div>\n        <div>\n            <div style=\"font-weight: bold; font-size: 14px\">\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u044D\u0432\u043E\u043B\u044E\u0446\u0438\u044F!</div>\n            <div style=\"font-size: 12px; opacity: 0.9;\">\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0447\u0442\u043E\u0431\u044B \u044D\u0432\u043E\u043B\u044E\u0446\u0438\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432 ".concat(evolution.name, "</div>\n        </div>\n    ");
  notification.addEventListener('click', function () {
    confirmEvolution();
    notification.remove();
  });
  document.body.appendChild(notification); // Автоудаление через 30 секунд

  setTimeout(function () {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 30000);
}

function confirmEvolution() {
  if (!currentEvolution) return;
  var evolution = currentEvolution; // Анимация эволюции

  var petSprite = document.getElementById('pet-sprite');
  petSprite.style.animation = 'jump 0.5s infinite';
  setTimeout(function () {
    // Применяем бонусы
    if (evolution.bonus.maxHp) {
      player.maxHp += evolution.bonus.maxHp;
      player.hp = player.maxHp;
    }

    if (evolution.bonus.atk) player.atk += evolution.bonus.atk;
    if (evolution.bonus.def) player.def += evolution.bonus.def;
    if (evolution.bonus.mp) player.maxMp += evolution.bonus.mp;
    player.emoji = evolution.emoji;
    player.evolutionLevel = evolution.level; // Обновляем отображение

    petSprite.textContent = player.emoji;
    petSprite.style.animation = ''; // Уведомление

    log("\u041F\u0438\u0442\u043E\u043C\u0435\u0446 \u044D\u0432\u043E\u043B\u044E\u0446\u0438\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043B \u0432 ".concat(evolution.name, "!"));
    showNotification("\u042D\u0432\u043E\u043B\u044E\u0446\u0438\u044F \u0432 ".concat(evolution.name, "!"), "success", 5000); // Разблокировка навыков для специальных эволюций

    if (evolution.emoji === '🐉' && !player.unlockedSkills.includes('fireball')) {
      player.unlockedSkills.push('fireball');
      showNotification("Разблокирован навык: Огненный шар!", "info");
    }

    updateUI();
    updateSkillButtons();
    updateQuestProgress('evolve', 1);
    saveGame(); // Показываем индикатор эволюции

    var indicator = document.getElementById('evolution-indicator');
    indicator.innerHTML = "<span style=\"color: var(--warning)\">".concat(evolution.emoji, "</span>");
    indicator.title = evolution.name;
    currentEvolution = null;
  }, 1500);
}
//# sourceMappingURL=evolution.dev.js.map
