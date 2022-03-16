const phases = ['hasInitialised', 'gameIsRunning'];

class Battleship {
    constructor(gridSize = 10, ships = [5, 4, 3, 3, 2]) {
        this.gridSize = gridSize;
        this.ships = ships;
        this.playerShips = this.initPlayerShips();
        this.compShips = this.initCompShips();
        this.playerBoard = this.createBoard(gridSize);
        this.compBoard = this.createCompBoard(gridSize);
        this.phase = phases[0];
        this.allCompMoves = this.initAllCompMoves();
        this.compMoves = [];
        this.winner = null;
    }

    createBoard = size =>
        Array(size)
            .fill(0)
            .map(_ => Array(size).fill(0));

    getShipFields(y, x, size, isHori, board) {
        let fields = [];
        if (isHori) {
            fields = board[y].slice(x, x + size);
        } else {
            for (let i = 0; i < size; i++) {
                fields.push(board[y + i][x]);
            }
        }
        return fields;
    }

    canPlaceShip = arr => arr.every(element => element === 0);

    isValidPosition(y, x, size, isHori, board) {
        if (isHori && x > this.gridSize - size) {
            return false;
        }
        if (!isHori && y > this.gridSize - size) {
            return false;
        }
        const fields = this.getShipFields(y, x, size, isHori, board);
        return this.canPlaceShip(fields);
    }

    getRandomPosition(board, size, isHori) {
        const values = [];

        if (isHori) {
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x <= this.gridSize - size; x++) {
                    if (this.isValidPosition(y, x, size, isHori, board)) {
                        values.push([y, x, size, isHori]);
                    }
                }
            }
        } else {
            for (let y = 0; y <= this.gridSize - size; y++) {
                for (let x = 0; x <= this.gridSize; x++) {
                    if (this.isValidPosition(y, x, size, isHori, board)) {
                        values.push([y, x, size, isHori]);
                    }
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * values.length);
        return values[randomIndex];
    }

    placeShip(y, x, size, isHori, id, board) {
        if (isHori) {
            for (let i = x; i < size + x; i++) {
                // ship placement
                board[y][i] = id;

                // borders above and below
                if (y > 0) {
                    board[y - 1][i] = -1;
                }
                if (y < this.gridSize - 1) {
                    board[y + 1][i] = -1;
                }
            }
            // borders left and right
            if (x > 0) {
                board[y][x - 1] = -1;
            }
            if (x + size < this.gridSize) {
                board[y][x + size] = -1;
            }
        } else {
            for (let i = y; i < size + y; i++) {
                // ship placement
                board[i][x] = id;

                // borders left and right
                if (x > 0) {
                    board[i][x - 1] = -1;
                }
                if (x < this.gridSize - 1) {
                    board[i][x + 1] = -1;
                }
            }
            // borders above and below
            if (y > 0) {
                board[y - 1][x] = -1;
            }
            if (y + size < this.gridSize) {
                board[y + size][x] = -1;
            }
        }
    }

    createCompBoard(size) {
        const board = this.createBoard(size);
        this.compShips.forEach(ship => {
            const values = this.getRandomPosition(board, ship.size, Math.random() < 0.5);
            this.placeShip(...values, ship.id, board);
        });
        return board;
    }

    placePlayerShip(y, x, id, isHori) {
        const size = this.playerShips.find(ship => ship.id === id).size;
        if (this.isValidPosition(y, x, size, isHori, this.playerBoard)) {
            this.placeShip(y, x, size, isHori, id, this.playerBoard);
            this.playerShips = this.playerShips.map(ship => {
                if (ship.id === id) {
                    ship.isPlaced = true;
                }
                return ship;
            });
            return true;
        }
        return false;
    }

    getHighlightedCoordinates(y, x, id, isHori) {
        const size = this.playerShips.find(ship => ship.id === id).size;
        const coords = { x: [], y: [] };
        if (this.isValidPosition(y, x, size, isHori, this.playerBoard)) {
            if (isHori) {
                coords.y = [y];
                for (let i = 0; i < size; i++) {
                    coords.x.push(x + i);
                }
            } else {
                coords.x = [x];
                for (let i = 0; i < size; i++) {
                    coords.y.push(y + i);
                }
            }
        }
        return coords;
    }

    initCompShips() {
        return this.ships.map((s, i) => ({ id: i + 1, size: s, damaged: 0, isDestroyed: false }));
    }

    initPlayerShips() {
        return this.ships.map((s, i) => ({ id: i + 1, size: s, isPlaced: false, damaged: 0, isDestroyed: false }));
    }

    initAllCompMoves() {
        return this.createBoard(this.gridSize)
            .map((row, i) => row.map((_, j) => ({ x: j, y: i, hit: false })))
            .flat();
    }

    resetPlayerBoard() {
        this.playerBoard = this.createBoard(this.gridSize);
        this.playerShips = this.initPlayerShips();
    }

    playerMove(x, y) {
        const fieldValue = this.compBoard[y][x];

        // ship ids are 1, 2, 3, 4, 5;
        const isShip = fieldValue > 0 && fieldValue <= this.ships.length;
        const copy = JSON.parse(JSON.stringify(this.compBoard));
        copy[y][x] = isShip ? 's' : 'w';
        this.compBoard = copy;

        if (isShip) {
            this.compShips = this.compShips.map(ship => {
                if (ship.id === fieldValue) {
                    ship.damaged++;
                    if (ship.damaged === ship.size) {
                        ship.isDestroyed = true;
                    }
                }
                return ship;
            });
            if (this.compShips.every(ship => ship.isDestroyed)) {
                this.winner = 'player';
            }
        }
    }

    compMove() {
        if (this.compMoves.length === 0 || !this.compMoves[this.compMoves.length - 1].hit) {
            const randomIndex = Math.floor(Math.random() * this.allCompMoves.length);
            const nextMove = this.allCompMoves.splice(randomIndex, 1)[0];

            const fieldValue = this.playerBoard[nextMove.y][nextMove.x];
            const isShip = fieldValue > 0 && fieldValue <= this.ships.length;
            const copy = JSON.parse(JSON.stringify(this.playerBoard));
            copy[nextMove.y][nextMove.x] = isShip ? 's' : 'w';
            this.playerBoard = copy;
            if (isShip) {
                this.playerShips = this.playerShips.map(ship => {
                    if (ship.id === fieldValue) {
                        ship.damaged++;
                        if (ship.damaged === ship.size) {
                            ship.isDestroyed = true;
                        }
                    }
                    return ship;
                });
                //nextMove.hit = true;
            }
            this.compMoves.push(nextMove);
        } else {
            console.log('TODO');
        }
        if (this.playerShips.every(ship => ship.isDestroyed)) {
            this.winner = 'comp';
        }
    }

    startGame() {
        this.phase = phases[1];
    }
}

export default Battleship;
