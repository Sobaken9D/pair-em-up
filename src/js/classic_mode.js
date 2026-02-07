import {DataStorage} from "./data_storage.js";

export default function ClassicMode(data) {
  const container = document.createElement("div");
  container.classList.add('container');
  container.id = 'container';

  const gameBlock = document.createElement("div");
  gameBlock.classList.add('game-block');
  gameBlock.id = 'game-block-classic';

  const infoClassicGameBlock = document.createElement("div");
  infoClassicGameBlock.classList.add('info-block');

  let gameState = {
    mode: 'Classic',
    gameResult: undefined,
    points: 0,
    validMoves: 0,
    addNumbers: 10,
    shuffle: 5,
    eraser: 5,
    timer: {
      startTime: null,
      time: null,
      timeForSort: null,
      timerInterval: 1000,
      accumulatedTime: null,
      paused: null,
      pausedAt: null,
    },
    mainArrayOfRowsDigits: createGameBoardArray(),
    isWaitingForErase: false,
    currentEraserHandler: null,
    conditionOfWin: {
      conditionOfPoints: 5
    },
    conditionOfLose: {
      conditionOfRows: 10,
      conditionOfValidMoves: 0,
      conditionOfAddNumbers: 0,
      conditionOfShuffle: 0,
      conditionOfEraser: 0,
    }
  };

  if (data !== undefined) {
    gameState = data;
    // Восстанавливаем игру — запускаем таймер
    resumeTimer(gameState);
  }

  const timerBlock = document.createElement("div");
  timerBlock.classList.add('timer-block');
  timerBlock.id = 'timer';
  createTimer(gameState);
  if (gameState.timer.time) {
    timerBlock.innerText = `${"Time: " + gameState.timer.time}`;
  } else {
    timerBlock.innerText = `Time: 00:00`;
  }

  const pointsBlock = document.createElement("div");
  pointsBlock.id = 'points-block';
  pointsBlock.innerText = `Points: ${gameState.points} | ${gameState.conditionOfWin.conditionOfPoints}`;

  const validMovesBlock = document.createElement("div");
  validMovesBlock.id = 'valid-moves-block';
  calculateValidMoves(gameState);
  validMovesBlock.innerText = `Valid moves: ${gameState.validMoves}`;

  const addNumbersButton = document.createElement("button");
  addNumbersButton.id = 'add-numbers-button';
  addNumbersButton.innerText = `Add numbers (${gameState.addNumbers})`;
  addNumbersButton.addEventListener('click', () => handleAddNumbersButton(gameState));

  const shuffleButton = document.createElement("button");
  shuffleButton.id = 'shuffle-button';
  shuffleButton.innerText = `Shuffle (${gameState.shuffle})`;
  shuffleButton.addEventListener('click', () => handleShuffleButton(gameState));

  const eraserButton = document.createElement("button");
  eraserButton.id = 'eraser-button';
  eraserButton.innerText = `Eraser (${gameState.eraser})`;
  eraserButton.addEventListener('click', () => handleEraserButton(gameState));

  const optionsButton = createOptionsButton(gameState);

  infoClassicGameBlock.append(timerBlock, pointsBlock, validMovesBlock, addNumbersButton, shuffleButton, eraserButton, optionsButton);

  let mainElementsArray = createMainElementsArray(gameState);

  mainElementsArray.forEach((row) => {
    row.forEach((digitButton) => {
      gameBlock.append(digitButton);
    })
  });

  container.append(gameBlock, infoClassicGameBlock);

  DataStorage.setClassicModeData(gameState); // только нажали и уже можем перезагружать с сохранением

  return container;
};

function checkFullValid(firstPositionRow, firstPositionCol, firstDigit, secondPositionRow, secondPositionCol, secondDigit, mainArray) {
  let addScore = checkValidPair(firstDigit, secondDigit).addScore;
  let conditionOfPair = checkValidPair(firstDigit, secondDigit).valid;
  let conditionOfMove = checkValidMove({
    firstCol: Number(firstPositionCol),
    firstRow: Number(firstPositionRow),
    secondCol: Number(secondPositionCol),
    secondRow: Number(secondPositionRow),
    fullArray: mainArray
  });

  if (conditionOfPair && conditionOfMove) {
    return {
      valid: true,
      addScore: addScore
    };
  }
  return {
    valid: false,
    addScore: addScore
  };
}

function checkValidPair(firstDigit, secondDigit) {
  if (Number(firstDigit) === 5 && Number(secondDigit) === 5) {
    return {
      valid: true,
      addScore: 3,
    }
  }
  if (Number(firstDigit) === Number(secondDigit)) {
    return {
      valid: true,
      addScore: 1,
    }
  }
  if (Number(firstDigit) + Number(secondDigit) === 10) {
    return {
      valid: true,
      addScore: 2,
    }
  }
  return {
    valid: false,
    addScore: 0,
  };
}

function checkValidMove({firstCol, firstRow, secondCol, secondRow, fullArray}) {

  if (firstRow === secondRow && Math.abs(firstCol - secondCol) === 1) {

    return true
  } else if (firstCol === secondCol && Math.abs(firstRow - secondRow) === 1) {

    return true
  } else if (firstRow === secondRow) {

    const start = Math.min(firstCol, secondCol);
    const end = Math.max(firstCol, secondCol);
    for (let c = start + 1; c < end; c++) {
      if (fullArray[firstRow][c] !== '') return false;
    }
    return true;
  } else if (firstCol === secondCol) {

    const start = Math.min(firstRow, secondRow);
    const end = Math.max(firstRow, secondRow);
    for (let r = start + 1; r < end; r++) {
      if (fullArray[r][firstCol] !== '') return false;
    }
    return true;
  } else { // убрать счет справо налево

    let topRow, bottomRow, topCol, bottomCol;
    if (firstRow < secondRow) {
      topRow = firstRow;
      topCol = firstCol;
      bottomRow = secondRow;
      bottomCol = secondCol;
    } else if (firstRow > secondRow) {
      topRow = secondRow;
      topCol = secondCol;
      bottomRow = firstRow;
      bottomCol = firstCol;
    }

    if ((topCol === (fullArray[0].length - 1) && bottomCol === 0) && (Math.abs(bottomRow - topRow) === 1)) {
      return true;
    }

    let startRow, startCol, colLimiter, rowLimiter;
    if (topCol === 8) {
      startRow = topRow + 1;
      startCol = 0;
    } else {
      startRow = topRow;
    }

    for (let row = startRow; row <= bottomRow; row++) {
      if (row === bottomRow) {
        colLimiter = bottomCol;
      } else {
        colLimiter = 9;
      }
      for (let col = startCol; col < colLimiter; col++) {
        if (fullArray[row][col] !== '') {
          return false;
        }
      }
      startCol = 0;
    }

    return true;
  }

}

function createGameBoardArray() {
  let interArrayOfDigits = [];
  let mainArrayOfRowsDigits = [];
  let rowSize = 9;
  let rows = 3;

  for (let i = 1; i <= 19; i++) {
    let strNumber = String(i);
    if (strNumber.length >= 2) {
      if (strNumber[1] !== '0') {
        interArrayOfDigits.push(strNumber[0]);
        interArrayOfDigits.push(strNumber[1]);
      }
    } else {
      interArrayOfDigits.push(strNumber);
    }
  }

  let counter = 0;
  for (let i = 0; i < rows; i++) {
    let interArray = [];
    for (let j = 0; j < rowSize; j++) {
      interArray.push(interArrayOfDigits[counter]);
      counter += 1;
    }
    mainArrayOfRowsDigits.push(interArray);
  }

  return mainArrayOfRowsDigits;
}

function createMainElementsArray(gameState) { // переписать чтобы работы была с DOM а не нашим массивом
  let selectedButtons = {
    firstButton: null,
    secondButton: null,
  };

  return gameState.mainArrayOfRowsDigits.map((row, rowIndex) => {
    return row.map((digit, colIndex) => {
      let button = document.createElement('button');
      button.innerText = `${digit}`;
      button.classList.add('game-button');
      button.dataset.gamePosition = `(${rowIndex}, ${colIndex})`;

      button.addEventListener('click', (e) => handledDigitGameButtonClick(e, selectedButtons, gameState.mainArrayOfRowsDigits, gameState));

      return button;
    });
  });
}

function handledDigitGameButtonClick(e, selectedButtons, mainArrayOfRowsDigits, gameState) {

  if (gameState.currentEraserHandler) { // обработка условия нажатой кнопки eraser
    return;
  }

  const clickedButton = e.target;

  // Если нажата уже выбранная кнопка - снимаем выделение
  if (clickedButton.classList.contains('game-button_selected')) {
    clickedButton.classList.remove('game-button_selected');

    // Удаляем из selectedButtons
    if (selectedButtons.firstButton === clickedButton) {
      selectedButtons.firstButton = null;
    } else if (selectedButtons.secondButton === clickedButton) {
      selectedButtons.secondButton = null;
    }

    return;
  }

  // Если еще нет первой выбранной кнопки
  if (!selectedButtons.firstButton) {
    clickedButton.classList.add('game-button_selected');
    selectedButtons.firstButton = clickedButton;
  }
  // Если уже есть первая, но нет второй
  else if (!selectedButtons.secondButton) {
    clickedButton.classList.add('game-button_selected');
    selectedButtons.secondButton = clickedButton;

    // Здесь можно добавить логику проверки кнопок

    let firstPosition = selectedButtons.firstButton.getAttribute('data-game-position');
    let firstPositionRow = firstPosition.match(/\d+/g)[0];
    let firstPositionCol = firstPosition.match(/\d+/g)[1];
    let firstDigit = mainArrayOfRowsDigits[firstPositionRow][firstPositionCol];

    let secondPosition = selectedButtons.secondButton.getAttribute('data-game-position');
    let secondPositionRow = secondPosition.match(/\d+/g)[0];
    let secondPositionCol = secondPosition.match(/\d+/g)[1];
    let secondDigit = mainArrayOfRowsDigits[secondPositionRow][secondPositionCol];

    let checkFullValidObj = checkFullValid(firstPositionRow, firstPositionCol, firstDigit, secondPositionRow, secondPositionCol, secondDigit, mainArrayOfRowsDigits);
    if (checkFullValidObj.valid) {
      selectedButtons.firstButton.innerText = '';
      selectedButtons.secondButton.innerText = '';
      mainArrayOfRowsDigits[firstPositionRow][firstPositionCol] = '';
      mainArrayOfRowsDigits[secondPositionRow][secondPositionCol] = '';

      handleUpdatePointsButton(gameState, checkFullValidObj.addScore);
    }

    // Сбрасываем обе кнопки через небольшой таймаут для визуального эффекта
    setTimeout(() => {
      if (selectedButtons.firstButton) {
        selectedButtons.firstButton.classList.remove('game-button_selected');
      }
      if (selectedButtons.secondButton) {
        selectedButtons.secondButton.classList.remove('game-button_selected');
      }

      // Сбрасываем состояние
      selectedButtons.firstButton = null;
      selectedButtons.secondButton = null;
    }, 100);

    calculateValidMoves(gameState);
    checkWin(gameState);
    checkLose(gameState);

    DataStorage.setClassicModeData(gameState);
  }

}

function handleUpdatePointsButton(gameState, addScore) {
  gameState.points = gameState.points + addScore;
  const pointsBlock = document.getElementById('points-block');
  pointsBlock.innerText = `Points: ${gameState.points} | ${gameState.conditionOfWin.conditionOfPoints}`;
}

function handleAddNumbersButton(gameState) {
  const addNumbersButton = document.getElementById('add-numbers-button');

  if (gameState.addNumbers <= 0) {
    return;
  } else {
    gameState.addNumbers = gameState.addNumbers - 1;
    addNumbersButton.innerText = `Add numbers (${gameState.addNumbers})`;
  }

  let addArrayOfDigits = [];
  for (let i = 0; i < gameState.mainArrayOfRowsDigits.length; i++) {
    for (let j = 0; j < gameState.mainArrayOfRowsDigits[i].length; j++) {
      if (gameState.mainArrayOfRowsDigits[i][j] !== '') {
        addArrayOfDigits.push(gameState.mainArrayOfRowsDigits[i][j]);
      }
    }
  }

  let addArrayOfRowsDigits = [];
  for (let i = 0; i < Math.ceil(addArrayOfDigits.length / 9); i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      const index = i * 9 + j;
      if (index < addArrayOfDigits.length) {
        row.push(addArrayOfDigits[index]);
      }
    }
    addArrayOfRowsDigits.push(row);
  }

  gameState.mainArrayOfRowsDigits = [...gameState.mainArrayOfRowsDigits, ...addArrayOfRowsDigits]
  calculateValidMoves(gameState);

  checkLose(gameState);
  DataStorage.setClassicModeData(gameState);

  const gameBlock = document.getElementById('game-block-classic');
  gameBlock.innerHTML = '';
  let mainElementsArray = createMainElementsArray(gameState);
  mainElementsArray.forEach((row) => {
    row.forEach((digitButton) => {
      gameBlock.append(digitButton);
    })
  });
}

function handleShuffleButton(gameState) {
  const shuffleButton = document.getElementById('shuffle-button');

  if (gameState.shuffle <= 0) {
    return;
  } else {
    gameState.shuffle = gameState.shuffle - 1;
    shuffleButton.innerText = `Shuffle (${gameState.shuffle})`;
  }

  let arrayOfDigitsForShuffle = gameState.mainArrayOfRowsDigits.flat(Infinity);

  const nonEmptyIndices = [];
  const nonEmptyValues = [];

  arrayOfDigitsForShuffle.forEach((value, index) => {
    if (value !== '') {
      nonEmptyIndices.push(index);
      nonEmptyValues.push(value);
    }
  });

  const shuffledValues = [...nonEmptyValues].sort(() => Math.random() - 0.5);

  const shuffleArray = [...arrayOfDigitsForShuffle]; // Копия исходного
  nonEmptyIndices.forEach((originalIndex, i) => {
    shuffleArray[originalIndex] = shuffledValues[i];
  });

  let addArrayOfRowsDigits = [];
  for (let i = 0; i < Math.ceil(shuffleArray.length / 9); i++) {
    let row = [];
    for (let j = 0; j < 9; j++) {
      const index = i * 9 + j;
      if (index < shuffleArray.length) {
        row.push(shuffleArray[index]);
      }
    }
    addArrayOfRowsDigits.push(row);
  }

  gameState.mainArrayOfRowsDigits = [...addArrayOfRowsDigits]
  calculateValidMoves(gameState);

  checkLose(gameState);
  DataStorage.setClassicModeData(gameState);

  const gameBlock = document.getElementById('game-block-classic');
  gameBlock.innerHTML = '';
  let mainElementsArray = createMainElementsArray(gameState);
  mainElementsArray.forEach((row) => {
    row.forEach((digitButton) => {
      gameBlock.append(digitButton);
    })
  });
}

function handleEraserButton(gameState) {
  const eraserButton = document.getElementById('eraser-button');
  const gameBlock = document.getElementById('game-block-classic');

  if (gameState.eraser <= 0) {
    return;
  }

  if (gameState.isWaitingForErase) {
    gameState.isWaitingForErase = false;
    eraserButton.classList.remove('eraser-button_active');
    eraserButton.innerText = `Eraser (${gameState.eraser})`;

    if (gameState.currentEraserHandler) {
      gameBlock.removeEventListener('click', gameState.currentEraserHandler);
      gameState.currentEraserHandler = null;

      checkLose(gameState);
      DataStorage.setClassicModeData(gameState);
    }
  } else {
    gameState.isWaitingForErase = true;
    eraserButton.classList.add('eraser-button_active');

    if (gameState.currentEraserHandler) {
      gameBlock.removeEventListener('click', gameState.currentEraserHandler);
    }

    gameState.currentEraserHandler = (event) => handleCellClick(event, gameState);
    gameBlock.addEventListener('click', gameState.currentEraserHandler);
  }
}

function handleCellClick(event, gameState) {
  const eraserButton = document.getElementById('eraser-button');
  const gameBlock = document.getElementById('game-block-classic');

  if (!gameState.isWaitingForErase) return;

  if (event.target.classList.contains('game-button') && event.target.textContent !== '') {
    let firstPosition = event.target.getAttribute('data-game-position');
    let firstPositionRow = firstPosition.match(/\d+/g)[0];
    let firstPositionCol = firstPosition.match(/\d+/g)[1];
    gameState.mainArrayOfRowsDigits[firstPositionRow][firstPositionCol] = '';
    calculateValidMoves(gameState);
    gameState.eraser--;
    event.target.textContent = '';

    eraserButton.innerText = `Eraser (${gameState.eraser})`;

    gameState.isWaitingForErase = false;
    eraserButton.classList.remove('eraser-button_active');

    if (gameState.currentEraserHandler) {
      gameBlock.removeEventListener('click', gameState.currentEraserHandler);
      gameState.currentEraserHandler = null;
    }

    event.target.classList.remove('game-button_selected');
  }
}

function checkWin(gameState) {
  if (gameState.conditionOfWin.conditionOfPoints <= gameState.points) {
    handleWin(gameState);
  }
}

function handleWin(gameState) {
  stopTimer(gameState);
  gameState.gameResult = 'Win';
  DataStorage.addScoreHistoryData(gameState);

  let modal = createEndGameModal(gameState);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.body.append(modal);
}

function checkLose(gameState) {
  let isLose = gameState.conditionOfLose.conditionOfRows <= gameState.mainArrayOfRowsDigits.length || (
    gameState.conditionOfLose.conditionOfValidMoves >= gameState.validMoves &&
    gameState.conditionOfLose.conditionOfAddNumbers >= gameState.addNumbers &&
    gameState.conditionOfLose.conditionOfShuffle >= gameState.shuffle &&
    gameState.conditionOfLose.conditionOfEraser >= gameState.eraser);

  if (isLose) {
    handleLose(gameState);
  }
}

function handleLose(gameState) {
  stopTimer(gameState);
  gameState.gameResult = 'Lose';
  DataStorage.addScoreHistoryData(gameState);

  let modal = createEndGameModal(gameState);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.body.append(modal);
}

function calculateValidMoves(gameState) {
  const {mainArrayOfRowsDigits} = gameState;
  let validMovesCount = 0;

  const rows = mainArrayOfRowsDigits.length;
  const cols = rows > 0 ? mainArrayOfRowsDigits[0].length : 0;

  for (let row1 = 0; row1 < rows; row1++) {
    for (let col1 = 0; col1 < cols; col1++) {
      const value1 = mainArrayOfRowsDigits[row1][col1];
      if (value1 === '') continue;

      for (let row2 = row1; row2 < rows; row2++) {
        let startCol = row2 === row1 ? col1 + 1 : 0;
        for (let col2 = startCol; col2 < cols; col2++) {
          const value2 = mainArrayOfRowsDigits[row2][col2];
          if (value2 === '') continue;

          const pairResult = checkValidPair(value1, value2);
          if (!pairResult.valid) continue;

          const canConnect = checkValidMove({
            firstCol: col1,
            firstRow: row1,
            secondCol: col2,
            secondRow: row2,
            fullArray: mainArrayOfRowsDigits
          });

          if (canConnect) {
            validMovesCount++;
          }
        }
      }
    }
  }

  gameState.validMoves = validMovesCount;
  const validMovesBlock = document.getElementById('valid-moves-block');
  if (validMovesBlock) {
    validMovesBlock.innerText = `Valid moves: ${validMovesCount}`;
  }

  return validMovesCount;
}

function createTimer(gameState, startTime) {
  if (!gameState.timer.startTime) {
    gameState.timer.startTime = Date.now();
  }

  const accumulatedTime = gameState.timer.accumulatedTime || 0;
  const actualStartTime = Date.now() - accumulatedTime;

  gameState.timer.startTime = actualStartTime;


  if (gameState.timer.timerInterval) {
    clearInterval(gameState.timer.timerInterval)
  }

  gameState.timer.timerInterval = setInterval(() => {
    updateTimer(gameState);
  }, 1000);
}

function updateTimer(gameState) {
  if (!gameState.timer.startTime) return;

  const currentTime = Date.now();
  const diff = Math.floor((currentTime - gameState.timer.startTime) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  let strTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  gameState.timer.time = strTime;

  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.innerText = `Time: ${strTime}`;
  }

  DataStorage.setClassicModeData(gameState);
}

function stopTimer(gameState) {
  if (gameState.timer.timerInterval) {
    clearInterval(gameState.timer.timerInterval);
    gameState.timer.timerInterval = null;
    gameState.timer.timeForSort = Date.now() - gameState.timer.startTime;
  }
}

function resumeTimer(gameState) {
  if (gameState.timer.paused) {
    gameState.timer.paused = false;

    if (gameState.timer.accumulatedTime) {
      const currentTime = Date.now();
      const adjustedStartTime = currentTime - gameState.timer.accumulatedTime;
      gameState.timer.startTime = adjustedStartTime;
    }

    if (gameState.timer.timerInterval) {
      clearInterval(gameState.timer.timerInterval);
    }

    gameState.timer.timerInterval = setInterval(() => {
      updateTimer(gameState);
    }, 1000);
  }
}

function createOptionsButton(gameState) {
  const optionsButton = document.createElement("button");
  optionsButton.classList.add('options-button');
  optionsButton.id = 'options-button';
  optionsButton.innerText = `Game Options`;
  optionsButton.addEventListener('click', () => handleClickOptionsButton(gameState));

  return optionsButton;
}

function handleClickOptionsButton(gameState) {
  gameState.timer.paused = true;
  gameState.timer.pausedAt = Date.now();

  if (gameState.timer.timerInterval) {
    clearInterval(gameState.timer.timerInterval);
    gameState.timer.timerInterval = null;

    if (gameState.timer.startTime) {
      const elapsed = Date.now() - gameState.timer.startTime;
      gameState.timer.accumulatedTime = elapsed;
    }
  }

  let modal = createOptionsModal(gameState);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.body.append(modal);
}

function createOptionsModal(gameState) {
  let modalOverlay = document.createElement("div");
  modalOverlay.classList.add('modal-overlay');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      resumeTimer(gameState);
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
    resumeTimer(gameState);
    document.body.removeChild(modalOverlay);
    document.body.style.overflow = 'auto';
  });

  let modalButtonsBlock = document.createElement('div');
  modalButtonsBlock.classList.add('modal-buttons-block');

  let restartButton = document.createElement("button");
  restartButton.classList.add('modal-restart-button', 'modal-button');
  restartButton.id = 'modal-restart-button';
  restartButton.innerText = 'Restart Game';
  restartButton.addEventListener('click', (event) => handleClickRestartButton(event, gameState));

  let backToMenuButton = document.createElement("button");
  backToMenuButton.classList.add('back-to-menu-button', 'modal-button');
  backToMenuButton.id = 'modal-back-to-menu-button';
  backToMenuButton.innerText = 'Back To Menu';
  backToMenuButton.addEventListener('click', (event) => handleClickBackToMenuButton(event, gameState));

  modalButtonsBlock.append(restartButton, backToMenuButton);
  modalContent.append(closeButton, modalButtonsBlock);
  modalOverlay.append(modalContent);
  return modalOverlay;
}

function handleClickRestartButton(event, gameState) {
  stopTimer(gameState);

  const container = document.getElementById('container');
  if (!container) return;

  const parent = container.parentElement;
  if (!parent) return;

  container.remove();

  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }

  const newGame = ClassicMode();

  parent.appendChild(newGame);

  DataStorage.clearClassicModeData();
}

function createEndGameModal(gameState) {
  let modalOverlay = document.createElement("div");
  modalOverlay.classList.add('modal-overlay');

  let modalContent = document.createElement("div");
  modalContent.classList.add('modal-content');

  let modalButtonsBlock = document.createElement('div');
  modalButtonsBlock.classList.add('modal-buttons-block');

  let modalInfoBlock = document.createElement('div');
  modalInfoBlock.classList.add('modal-info-block');

  let gameResultInfo = document.createElement("p");
  gameResultInfo.innerText = ` You are ${gameState.gameResult}!`

  let scoreInfo = document.createElement('p');
  scoreInfo.innerText = ` Score: ${gameState.points}`;

  let timeInfo = document.createElement('p');
  timeInfo.innerText = ` Time: ${gameState.timer.time}`;

  let restartButton = document.createElement("button");
  restartButton.classList.add('modal-restart-button', 'modal-button');
  restartButton.id = 'modal-restart-button';
  restartButton.innerText = 'Restart Game';
  restartButton.addEventListener('click', (event) => handleClickRestartButton(event, gameState));

  let backToMenuButton = document.createElement("button");
  backToMenuButton.classList.add('back-to-menu-button', 'modal-button');
  backToMenuButton.id = 'modal-back-to-menu-button';
  backToMenuButton.innerText = 'Back To Menu';
  backToMenuButton.addEventListener('click', (event) => handleClickBackToMenuButton(event, gameState));

  modalInfoBlock.append(gameResultInfo, scoreInfo, timeInfo);
  modalButtonsBlock.append(restartButton, backToMenuButton);
  modalContent.append(modalInfoBlock, modalButtonsBlock);
  modalOverlay.append(modalContent);
  return modalOverlay;
}

function handleClickBackToMenuButton(event, gameState) {
  stopTimer(gameState);

  const container = document.getElementById('container');
  if (!container) return;

  const parent = container.parentElement;
  if (!parent) return;

  container.remove();

  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }

  DataStorage.clearClassicModeData();
}