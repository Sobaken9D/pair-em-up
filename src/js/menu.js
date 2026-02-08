import {DataStorage} from "./data_storage.js";
import menuClickSound from "../assets/sounds/click_2.mp3";

export default function Menu() {
  const buttonsBlock = document.createElement('div');
  buttonsBlock.classList.add('menu-buttons-block');

  const classicModeButton = document.createElement('button');
  classicModeButton.classList.add('buttons-block__button', 'menu-button');
  classicModeButton.innerText = 'Classic';
  classicModeButton.id = 'classic-mode-button';

  const randomModeButton = document.createElement('button');
  randomModeButton.classList.add('buttons-block__button', 'menu-button');
  randomModeButton.innerText = 'Random';
  randomModeButton.id = 'random-mode-button';

  const chaoticModeButton = document.createElement('button');
  chaoticModeButton.classList.add('buttons-block__button', 'menu-button');
  chaoticModeButton.innerText = 'Chaotic';
  chaoticModeButton.id = 'chaotic-mode-button';

  const menuOptionButton = document.createElement('button');
  menuOptionButton.classList.add('buttons-block__button', 'menu-button');
  menuOptionButton.innerText = 'Options';
  menuOptionButton.id = 'menu-options-button';
  menuOptionButton.addEventListener('click', handleClickOptionsButton);

  buttonsBlock.append(classicModeButton, randomModeButton, chaoticModeButton, menuOptionButton);

  buttonsBlock.querySelectorAll('.menu-button').forEach(button => {
    button.addEventListener('click', () => {
      playSound(menuClickSound);
    });
  });

  return buttonsBlock;
};

function handleClickOptionsButton() {
  let modal = createOptionsModal();
  modal.style.display = 'block';
  document.body.append(modal);
  document.body.style.overflow = 'hidden';
}

function createOptionsModal() {
  let modalOverlay = document.createElement("div");
  modalOverlay.classList.add('modal-overlay');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
      document.body.style.overflow = 'auto';
    }
  });

  let modalContent = document.createElement("div");
  modalContent.classList.add('modal-content');

  let closeButton = document.createElement("span");
  closeButton.classList.add('modal-close-button');
  closeButton.innerHTML = 'X';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modalOverlay);
    document.body.style.overflow = 'auto';
  });

  let modalButtonsBlock = document.createElement('div');
  modalButtonsBlock.classList.add('modal-buttons-block');
  modalButtonsBlock.id = 'modal-buttons-block';

  let historyButton = document.createElement("button");
  historyButton.classList.add('modal-history-button', 'modal-button');
  historyButton.id = 'modal-history-button';
  historyButton.innerText = 'History';
  if (!DataStorage.getScoreHistoryData().length) {
    historyButton.setAttribute('disabled', 'disabled');
  }
  historyButton.addEventListener('click', handleClickHistoryButton);

  let clearHistoryButton = document.createElement("button");
  clearHistoryButton.classList.add('modal-history-button', 'modal-button');
  clearHistoryButton.id = 'modal-clear-history-button';
  clearHistoryButton.innerText = 'Clear History';
  if (!DataStorage.getScoreHistoryData().length) {
    clearHistoryButton.setAttribute('disabled', 'disabled');
  }
  clearHistoryButton.addEventListener('click', handleClickClearHistoryButton);

  let soundsOptionsButton = document.createElement("button");
  soundsOptionsButton.classList.add('modal-sounds-options-button', 'modal-button');
  soundsOptionsButton.id = 'modal-sounds-options-button';
  soundsOptionsButton.innerText = 'Sounds';
  soundsOptionsButton.addEventListener('click', handleClickSoundsButton);

  modalButtonsBlock.append(historyButton, clearHistoryButton, soundsOptionsButton);
  modalContent.append(closeButton, modalButtonsBlock);
  modalOverlay.append(modalContent);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      playSound(menuClickSound);
    }
  });

  return modalOverlay;
}

function handleClickHistoryButton(event) {
  let modalButtonsBlock = document.getElementById('modal-buttons-block');
  if (!modalButtonsBlock) return;

  let parent = modalButtonsBlock.parentElement;
  if (!parent) return;

  let table = document.createElement('table');
  table.classList.add('history-table')

  let thead = document.createElement('thead');
  let tr1 = document.createElement('tr');

  let th1 = document.createElement('th');
  th1.innerText = 'Result';
  let th2 = document.createElement('th');
  th2.innerText = 'Mode';
  let th3 = document.createElement('th');
  th3.innerText = 'Score';
  let th4 = document.createElement('th');
  th4.innerText = 'Time';

  tr1.append(th1, th2, th3, th4);
  thead.append(tr1);

  let tbody = document.createElement('tbody');

  const scoreHistoryData = DataStorage.getScoreHistoryData() || [];
  // scoreHistoryData.sort((a, b) => b.points - a.points);
  scoreHistoryData.sort((a, b) => a.timer.timeForSort - b.timer.timeForSort);

  for (let i = 0; i < scoreHistoryData.length; i++) {
    let gameData = scoreHistoryData[i];
    let tr = document.createElement('tr');

    let td1 = document.createElement('td');

    td1.innerText = gameData.gameResult || '-';

    let td2 = document.createElement('td');
    td2.innerText = gameData.mode || '-';

    let td3 = document.createElement('td');
    td3.innerText = String(gameData.points) || '-';

    let td4 = document.createElement('td');
    td4.innerText = gameData.timer.time || '-';

    tr.append(td1, td2, td3, td4);
    tbody.append(tr);
  }

  table.append(thead, tbody);

  modalButtonsBlock.remove();
  parent.appendChild(table);
}

function handleClickClearHistoryButton() { // anctive incative
  let clearButton = document.getElementById('modal-clear-history-button');
  let historyButton = document.getElementById('modal-history-button');

  if (!clearButton) return;
  clearButton.setAttribute('disabled', 'disabled');
  historyButton.setAttribute('disabled', 'disabled');

  DataStorage.clearScoreHistoryData();
}

function handleClickSoundsButton() {
  let modalButtonsBlock = document.getElementById('modal-buttons-block');
  if (!modalButtonsBlock) return;

  let parent = modalButtonsBlock.parentElement;
  if (!parent) return;

  if (Object.keys(DataStorage.getGameOptionsData()).length === 0) {
    DataStorage.setGameOptionsData({
      soundsSettings: {
        volume: "50"
      }
    });
  }

  let soundsOptionsBlock = document.createElement('div');
  soundsOptionsBlock.classList.add('sounds-options-block');

  let textVolume = document.createElement('p');
  textVolume.classList.add('volume-text');
  textVolume.innerText = `Volume: `;

  let inputVolume = document.createElement('input');
  inputVolume.classList.add('volume-slider');
  inputVolume.type = 'range';
  inputVolume.min = '0';
  inputVolume.max = '100';
  inputVolume.step = '1';
  console.log(DataStorage.getGameOptionsData().soundsSettings);
  inputVolume.value = DataStorage.getGameOptionsData().soundsSettings.volume;
  inputVolume.addEventListener('change', (e) => {
    let newData = {
      ...DataStorage.getGameOptionsData(),
      soundsSettings: {
        ...DataStorage.getGameOptionsData().soundsSettings,
        volume: e.target.value
      }
    };
    DataStorage.setGameOptionsData(newData);
  });

  soundsOptionsBlock.append(textVolume, inputVolume);

  modalButtonsBlock.remove();
  parent.appendChild(soundsOptionsBlock);
}

function playSound(sound) {
  const audio = new Audio(sound);
  audio.volume = Number(DataStorage.getGameOptionsData().soundsSettings.volume) / 100;
  audio.play();
}