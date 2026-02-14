"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// ===== UI УТИЛИТЫ =====
function log(message) {
  var logElement = document.getElementById('battle-log');
  var timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  logElement.innerHTML = "<span style=\"opacity:0.7\">[".concat(timestamp, "]</span> ").concat(message);
  logElement.style.animation = 'none';
  setTimeout(function () {
    logElement.style.animation = 'fadeIn 0.3s';
  }, 10);
}

function showNotification(message) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
  var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
  var notificationArea = document.getElementById('notification-area');
  var notification = document.createElement('div');
  notification.className = "notification ".concat(type);
  notification.textContent = message;
  notificationArea.appendChild(notification);
  setTimeout(function () {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-100%)';
    setTimeout(function () {
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
  var skillsList = document.getElementById('skills-list');
  var currentSkills = document.getElementById('current-skills');
  skillsList.innerHTML = '<h4>Все навыки:</h4>';
  currentSkills.innerHTML = '';
  Object.entries(SKILLS).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        skill = _ref2[1];

    var isUnlocked = player.unlockedSkills.includes(key);
    var skillElement = document.createElement('div');
    skillElement.style.background = '#f1f5f9';
    skillElement.style.borderRadius = '10px';
    skillElement.style.padding = '10px';
    skillElement.style.margin = '5px 0';
    skillElement.style.opacity = isUnlocked ? '1' : '0.6';
    skillElement.innerHTML = "\n            <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n                <div>\n                    <div style=\"font-weight: bold; font-size: 13px\">".concat(skill.name, "</div>\n                    <div style=\"font-size: 11px; color: #64748b\">").concat(skill.description, "</div>\n                </div>\n                <div style=\"font-size: 12px;\">\n                    ").concat(isUnlocked ? '<span style="color: var(--success)">✓ Разблокирован</span>' : "<span style=\"color: #64748b\">\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D</span>", "\n                </div>\n            </div>\n            <div style=\"font-size: 10px; margin-top: 5px;\">\n                ").concat(skill.cost > 0 ? "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C: ".concat(skill.cost, " MP") : 'Бесплатно', "\n            </div>\n        ");
    skillsList.appendChild(skillElement);
  }); // Текущие навыки

  player.unlockedSkills.forEach(function (skillKey) {
    var skill = SKILLS[skillKey];

    if (skill) {
      var skillSpan = document.createElement('span');
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
  var skillButtons = {
    'fireball': document.getElementById('skill-fireball'),
    'ice': document.getElementById('skill-ice'),
    'heal': document.getElementById('skill-heal')
  };
  Object.entries(skillButtons).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        skill = _ref4[0],
        button = _ref4[1];

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
//# sourceMappingURL=ui.dev.js.map
