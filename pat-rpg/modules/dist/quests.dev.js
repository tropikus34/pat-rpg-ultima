"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ===== КВЕСТЫ =====
function showQuests() {
  closeModal('inventory-modal');
  updateQuestsDisplay();
  document.getElementById('quests-modal').classList.remove('hidden');
}

function acceptQuest(questId) {
  var quest = QUESTS.find(function (q) {
    return q.id === questId;
  });
  if (!quest) return;

  if (activeQuests.find(function (q) {
    return q.id === questId;
  }) || completedQuests.find(function (q) {
    return q.id === questId;
  })) {
    return;
  }

  activeQuests.push(_objectSpread({}, quest, {
    progress: 0,
    completed: false
  }));
  log("\u041F\u0440\u0438\u043D\u044F\u0442 \u043A\u0432\u0435\u0441\u0442: \"".concat(quest.title, "\""));
  updateQuestsDisplay();
}

function checkQuestsProgress() {
  activeQuests.forEach(function (quest) {
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

function updateQuestProgress(type) {
  var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  activeQuests.forEach(function (quest) {
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
  var questIndex = activeQuests.findIndex(function (q) {
    return q.id === questId;
  });
  if (questIndex === -1) return;
  var quest = activeQuests[questIndex];
  quest.completed = true; // Награда

  player.coins += quest.reward.coins;
  addXP(quest.reward.xp); // Перемещение в завершенные

  activeQuests.splice(questIndex, 1);
  completedQuests.push(quest);
  log("\u041A\u0432\u0435\u0441\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D: \"".concat(quest.title, "\"! +").concat(quest.reward.coins, "\uD83D\uDCB0 +").concat(quest.reward.xp, " \u043E\u043F\u044B\u0442\u0430"));
  showNotification("\u041A\u0432\u0435\u0441\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D: ".concat(quest.title, "!"), "success");
  updateQuestsDisplay();
  updateUI();
  saveGame();
}

function updateQuestsDisplay() {
  var activeContainer = document.getElementById('active-quests');
  var completedContainer = document.getElementById('completed-quests');
  if (!activeContainer) return; // Активные квесты

  activeContainer.innerHTML = '<h4 style="margin-bottom: 10px;">Активные квесты</h4>';

  if (activeQuests.length === 0) {
    activeContainer.innerHTML += '<p style="color:#64748b; font-size:12px">Нет активных квестов</p>';
  } else {
    activeQuests.forEach(function (quest) {
      var questElement = document.createElement('div');
      questElement.className = 'quest-item';
      var progressPercent = Math.min(100, quest.progress / quest.target * 100);
      questElement.innerHTML = "\n                <div style=\"font-weight:bold; font-size:13px\">".concat(quest.title, "</div>\n                <div style=\"font-size:11px; color:#64748b; margin:5px 0\">").concat(quest.description, "</div>\n                <div style=\"background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden\">\n                    <div style=\"background:var(--success); height:100%; width:").concat(progressPercent, "%\"></div>\n                </div>\n                <div style=\"font-size:10px; text-align:right; margin-top:2px\">\n                    ").concat(quest.progress, "/").concat(quest.target, "\n                </div>\n            ");
      activeContainer.appendChild(questElement);
    });
  } // Завершенные квесты


  if (completedContainer) {
    completedContainer.innerHTML = '<h4 style="margin-bottom: 10px;">Завершенные квесты</h4>';

    if (completedQuests.length === 0) {
      completedContainer.innerHTML += '<p style="color:#64748b; font-size:12px">Нет завершенных квестов</p>';
    } else {
      completedQuests.slice(-3).reverse().forEach(function (quest) {
        var questElement = document.createElement('div');
        questElement.className = 'quest-item completed';
        questElement.innerHTML = "\n                    <div style=\"font-weight:bold; font-size:12px\">".concat(quest.title, "</div>\n                    <div style=\"font-size:10px; color:var(--success)\">\u2713 \u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E</div>\n                ");
        completedContainer.appendChild(questElement);
      });
    }
  }
} // Экспорт функций


window.showQuests = showQuests;
window.acceptQuest = acceptQuest;
window.completeQuest = completeQuest;
window.checkQuestsProgress = checkQuestsProgress;
window.updateQuestProgress = updateQuestProgress;
//# sourceMappingURL=quests.dev.js.map
