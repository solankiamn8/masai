// TicTacToe.ts

type PlayerSymbol = string;
type Coordinate = string; // e.g., "A1"

class Player {
  name: string;
  symbol: PlayerSymbol;

  constructor(name: string, symbol: PlayerSymbol) {
    this.name = name;
    this.symbol = symbol;
  }
}

class Board {
  grid: PlayerSymbol[][];
  lockedBy: Player | null; // for diagonal lock on center

  constructor() {
    // Initialize 3x3 grid with "_"
    this.grid = Array.from({ length: 3 }, () => ["_", "_", "_"]);
    this.lockedBy = null;
  }

  display() {
    console.log("   1 2 3");
    const rows = ["A", "B", "C"];
    rows.forEach((row, i) => {
      console.log(row + "  " + this.grid[i].join(" "));
    });
    console.log("");
  }

  isCellEmpty(row: number, col: number): boolean {
    return this.grid[row][col] === "_";
  }

  markCell(row: number, col: number, player: Player) {
    if (!this.isCellEmpty(row, col)) {
      throw new Error(`Cell is already occupied`);
    }
    if (row === 1 && col === 1 && this.lockedBy && this.lockedBy !== player) {
      throw new Error(`Center cell B2 is locked by ${this.lockedBy.name}`);
    }
    this.grid[row][col] = player.symbol;

    // Check for diagonal lock
    this.updateDiagonalLock(player);
  }

  private updateDiagonalLock(player: Player) {
    const s = player.symbol;
    const g = this.grid;

    // Check A1 & C3
    if (g[0][0] === s && g[2][2] === s && g[1][1] === "_") {
      this.lockedBy = player;
    }

    // Check A3 & C1
    if (g[0][2] === s && g[2][0] === s && g[1][1] === "_") {
      this.lockedBy = player;
    }
  }

  checkWin(player: Player): boolean {
    const s = player.symbol;
    const g = this.grid;

    // Rows and columns
    for (let i = 0; i < 3; i++) {
      if (g[i][0] === s && g[i][1] === s && g[i][2] === s) return true;
      if (g[0][i] === s && g[1][i] === s && g[2][i] === s) return true;
    }

    // Diagonals
    if (g[0][0] === s && g[1][1] === s && g[2][2] === s) return true;
    if (g[0][2] === s && g[1][1] === s && g[2][0] === s) return true;

    return false;
  }

  isFull(): boolean {
    return this.grid.every(row => row.every(cell => cell !== "_"));
  }
}

class TicTacToeGame {
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  gameOver: boolean;

  constructor(player1: Player, player2: Player) {
    if (player1.symbol === "_" || player2.symbol === "_") {
      throw new Error("Symbol '_' is reserved for empty cell.");
    }
    if (player1.symbol === player2.symbol) {
      throw new Error("Players cannot have the same symbol.");
    }

    this.players = [player1, player2];
    this.board = new Board();
    this.currentPlayerIndex = 0;
    this.gameOver = false;
  }

  playMove(coordinate: Coordinate) {
    if (this.gameOver) {
      console.log("Game is over. No more moves allowed.");
      return;
    }

    const rowMap = { A: 0, B: 1, C: 2 };
    const colMap = { "1": 0, "2": 1, "3": 2 };

    const rowChar = coordinate[0].toUpperCase();
    const colChar = coordinate[1];

    if (!(rowChar in rowMap) || !(colChar in colMap)) {
      throw new Error("Invalid coordinate!");
    }

    const row = rowMap[rowChar];
    const col = colMap[colChar];

    const player = this.players[this.currentPlayerIndex];
    this.board.markCell(row, col, player);

    this.board.display();

    if (this.board.checkWin(player)) {
      console.log(`${player.name} wins!`);
      this.gameOver = true;
      return;
    }

    if (this.board.isFull()) {
      console.log("Game ended in a draw!");
      this.gameOver = true;
      return;
    }

    // Switch turn
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
  }
}

// ✅ Example usage
const player1 = new Player("Alice", "X");
const player2 = new Player("Bob", "O");
const game = new TicTacToeGame(player1, player2);

game.board.display();

// Sample moves
game.playMove("A1"); // Alice
game.playMove("B1"); // Bob
game.playMove("C3"); // Alice -> locks B2
try {
  game.playMove("B2"); // Bob should get error
} catch (e) {
  console.log((e as Error).message);
}
game.playMove("B2"); // Alice claims center
