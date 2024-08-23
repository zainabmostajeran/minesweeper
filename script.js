document.getElementById("start-btn").addEventListener("click", startGame);

const boardSize = 10;
let board, mineCount, gameOver, startTime;

function startGame() {
  initializeGame();
  if (!validateMineCount()) return;

  startTime = new Date();
  createBoard();
}

function initializeGame() {
  gameOver = false;
  toggleElementVisibility("start-btn", false);
  toggleElementVisibility("mine-input-container", false);
  updateGameStatus("Game Started", "visible");
  hideRestartButton();
  mineCount = parseInt(document.getElementById("mine-count").value);
}

function validateMineCount() {
  if (isNaN(mineCount) || mineCount < 1 || mineCount > 99) {
    alert("Please enter a valid number of mines.");
    toggleElementVisibility("start-btn", true);
    toggleElementVisibility("mine-input-container", true);
    return false;
  }
  return true;
}

function createBoard() {
  resetBoard();
  const minePositions = generateMinePositions(boardSize, mineCount);
  board = createEmptyBoard(boardSize);

  placeMines(minePositions);
  calculateNumbersForCells();
  renderCells();
}

function resetBoard() {
  document.getElementById("game-board").innerHTML = "";
}

function placeMines(minePositions) {
  minePositions.forEach(([row, col]) => {
    board[row][col].isMine = true;
  });
}

function calculateNumbersForCells() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (!board[row][col].isMine) {
        board[row][col].number = countAdjacentMines(row, col);
      }
    }
  }
}

function renderCells() {
  const boardElement = document.getElementById("game-board");

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = createCellElement(row, col);
      boardElement.appendChild(cell);
    }
  }
}

function createCellElement(row, col) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.addEventListener("click", () => handleCellClick(row, col));
  return cell;
}

function handleCellClick(row, col) {
  if (gameOver) return;

  if (board[row][col].isMine) {
    endGame(false);
  } else {
    revealCell(row, col);
    renderBoard();
    checkWinCondition();
  }
}

function generateMinePositions(boardSize, mineCount) {
  const positions = new Set();
  while (positions.size < mineCount) {
    const pos = Math.floor(Math.random() * boardSize * boardSize);
    positions.add(pos);
  }
  return Array.from(positions).map((pos) => [
    Math.floor(pos / boardSize),
    pos % boardSize,
  ]);
}

function createEmptyBoard(boardSize) {
  return Array.from({ length: boardSize }, () =>
    Array.from({ length: boardSize }, () => ({
      isMine: false,
      revealed: false,
      number: 0,
    }))
  );
}

function countAdjacentMines(row, col) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  return directions.reduce((count, [dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (isValidCell(newRow, newCol) && board[newRow][newCol].isMine) {
      count++;
    }
    return count;
  }, 0);
}

function isValidCell(row, col) {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
}

function revealCell(row, col) {
  if (board[row][col].revealed) return;
  board[row][col].revealed = true;

  if (board[row][col].number === 0) {
    revealAdjacentCells(row, col);
  }
}

function revealAdjacentCells(row, col) {
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const queue = [[row, col]];

  while (queue.length) {
    const [r, c] = queue.shift();
    directions.forEach(([dx, dy]) => {
      const newRow = r + dx;
      const newCol = c + dy;
      if (isValidCell(newRow, newCol) && !board[newRow][newCol].revealed) {
        board[newRow][newCol].revealed = true;
        if (board[newRow][newCol].number === 0) {
          queue.push([newRow, newCol]);
        }
      }
    });
  }
}

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const cellData = board[row][col];

    if (cellData.revealed) {
      cell.classList.add("revealed");
      if (cellData.isMine) {
        cell.classList.add("mine");
        cell.innerHTML = "💣";
      } else if (cellData.number > 0) {
        cell.innerHTML = cellData.number;
      }
    }
  });
}

function endGame(isWin) {
  showAllMines();
  const elapsedTime = calculateElapsedTime();
  displayGameStatus(
    isWin
      ? `You won! Elapsed Time: ${elapsedTime}`
      : `Game Over! Elapsed Time: ${elapsedTime}`,
    !isWin
  );
  gameOver = true;
  showRestartButton();
}

function showAllMines() {
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell.isMine) cell.revealed = true;
    })
  );
  renderBoard();
}

function checkWinCondition() {
  const nonMineCells = board.flat().filter((cell) => !cell.isMine);
  const revealedCells = nonMineCells.filter((cell) => cell.revealed);

  if (revealedCells.length === nonMineCells.length) {
    setTimeout(() => endGame(true), 100);
  }
}

function calculateElapsedTime() {
  const elapsedTime = (new Date() - startTime) / 1000;
  return `${elapsedTime.toFixed(2)} seconds`;
}

function displayGameStatus(message, isGameOver = false) {
  const statusElement = document.getElementById("game-status");
  statusElement.textContent = message;
  statusElement.style.visibility = "visible";
  statusElement.style.color = isGameOver ? "red" : "";
}

function toggleElementVisibility(elementId, isVisible) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = isVisible ? "inline-block" : "none";
  } else {
    console.error(`Element with ID '${elementId}' not found.`);
  }
}

function showRestartButton() {
  let restartButton = document.getElementById("restart-btn");

  if (!restartButton) {
    restartButton = document.createElement("button");
    restartButton.textContent = "Restart Game";
    restartButton.id = "restart-btn";
    restartButton.addEventListener("click", restartGame);
    document.querySelector(".controls").appendChild(restartButton);
  }
  toggleElementVisibility("restart-btn", true);
}

function hideRestartButton() {
  toggleElementVisibility("restart-btn", false);
}

function restartGame() {
  gameOver = false;
  document.getElementById("game-board").innerHTML = "";
  toggleElementVisibility("mine-input-container", true);
  toggleElementVisibility("start-btn", true);
  updateGameStatus("", "hidden");
  hideRestartButton();
}

function updateGameStatus(message, visibility) {
  const statusElement = document.getElementById("game-status");
  statusElement.textContent = message;
  statusElement.style.visibility = visibility;
}
