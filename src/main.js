import './style.scss';
import Menu from "./js/menu.js";
import ClassicMode from "./js/classic_mode.js";
import RandomMode from "./js/random_mode.js";
import ChaoticMode from "./js/chaotic_mode.js";
import {DataStorage} from "./js/data_storage.js";

const MenuElement = Menu();

const title = document.createElement('h1');
title.innerText = 'Pair-Em-Up';
title.classList.add('title');

const wrapper = document.createElement('div');
wrapper.classList.add('wrapper');
wrapper.append(title, MenuElement);

const app = document.getElementById('app');
app.append(wrapper);

const classicModeButton = document.getElementById('classic-mode-button');
classicModeButton.addEventListener('click', () => {
  if (document.getElementById('container')) {
    clearInterval(DataStorage.getClassicModeData().timer.timerInterval);
    document.getElementById('container').remove();
  }

  const ClassicModeElement = ClassicMode();

  localStorage.setItem('currentMode', 'Classic');
  wrapper.append(ClassicModeElement);
});

const randomModeButton = document.getElementById('random-mode-button');
randomModeButton.addEventListener('click', () => {
  if (document.getElementById('container')) {
    clearInterval(DataStorage.getClassicModeData().timer.timerInterval);
    document.getElementById('container').remove();
  }

  const RandomModeElement = RandomMode();
  localStorage.setItem('currentMode', 'Random');
  wrapper.append(RandomModeElement);
});

const chaoticModeButton = document.getElementById('chaotic-mode-button');
chaoticModeButton.addEventListener('click', () => {
  if (document.getElementById('container')) {
    clearInterval(DataStorage.getClassicModeData().timer.timerInterval);
    document.getElementById('container').remove();
  }

  const ChaoticModeElement = ChaoticMode();
  localStorage.setItem('currentMode', 'Chaotic');
  wrapper.append(ChaoticModeElement);
});

window.addEventListener('beforeunload', () => {
  let newObj = {...DataStorage.getClassicModeData()};

  newObj.timer.paused = true; // нету когда только зашли
  newObj.timer.pausedAt = Date.now();

  if (newObj.timer.timerInterval) {
    clearInterval(newObj.timer.timerInterval);
    newObj.timer.timerInterval = null;

    if (newObj.timer.startTime) {
      const elapsed = Date.now() - newObj.timer.startTime;
      newObj.timer.accumulatedTime = elapsed;
    }
  }

  DataStorage.setClassicModeData(newObj);
});

window.addEventListener('load', () => {
  let currentMode = localStorage.getItem('currentMode');
  let options = DataStorage.getGameOptionsData();

  let condition =
    Object.keys(DataStorage.getClassicModeData()).length > 0 ||
    Object.keys(DataStorage.getRandomModeData()).length > 0 ||
    Object.keys(DataStorage.getChaoticModeData()).length > 0;

  if (condition) {
    switch (currentMode) {
      case 'Classic':
        const ClassicModeElement = ClassicMode(DataStorage.getClassicModeData());
        wrapper.append(ClassicModeElement); // не сохраняется таймерc
        break;
      case 'Random':
        const RandomModeElement = RandomMode(DataStorage.getRandomModeData());
        wrapper.append(RandomModeElement); // не сохраняется таймер
        break;
      case 'Chaotic':
        const ChaoticModeElement = ChaoticMode(DataStorage.getChaoticModeData());
        wrapper.append(ChaoticModeElement); // не сохраняется таймер
        break;
    }
  }
});