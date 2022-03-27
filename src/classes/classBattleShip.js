const phases = ['hasInitialised', 'gameIsRunning'];

class Battleship {
    constructor(gridSize = 10, shipSizes = [5, 4, 3, 3, 2]) {
        this.gridSize = gridSize;
        this.shipSizes = shipSizes;
        this.playerShips = this.initShips(false);
        this.compShips = this.initShips(true)
        this.playerBoard = new Board(gridSize);
        this.compBoard = this.populateCompBoard();
        this.phase = phases[0];
        this.winner = null;
        this.compKnows = this.initCompKnows()
    }

    initShips = (isComp) => this.shipSizes.map((size,i) => {
        const id = i + 1;
        const isHori = isComp ? Math.random() < 0.5 : true;
        const isPlaced = false;
        const isSelected = !isComp && i === 0;
        return new Ship(id, size, isHori, isPlaced, isSelected)
    })

    initCompKnows = () => ({startX:null, startY: null, x: null, y: null, isHori: null, testingIsHori:null, nextCellToTry:null});

    populateCompBoard(){
        this.compBoard = new Board(this.gridSize);
        this.compShips.forEach(ship => this.compBoard.placeCompShip(ship))
        return this.compBoard;
    }

    selectPlayerShip = id => this.playerShips = this.playerShips.map(ship => {
        ship.isSelected = ship.id === id
        return ship
    })

    selectNextPlayerShip = () => {
        const allShipsPlaced = this.playerShips.every(ship => ship.isPlaced);
        if (allShipsPlaced){
            this.playerShips = this.playerShips.map(ship => {
                ship.isSelected = false;
                return ship;
            })
            return;
        }
        const nextShip = this.playerShips.find(ship => !ship.isPlaced);
        this.playerShips = this.playerShips.map(ship => {
            ship.isSelected = ship.id === nextShip.id;
            return ship
        })
    }

    resetPlayerBoard = () => {
        this.playerShips = this.initShips(false)
        this.playerBoard = new Board(this.gridSize)
    }

    playerMove(cell){
        if (!cell.covered){
            return false;
        }
        cell.covered = false;
        if (cell.shipId){
            this.compShips = this.compShips.map(ship => {
                if (ship.id === cell.shipId){
                    ++ship.damage;
                    if (ship.damage === ship.shipSize){
                        ship.isDestroyed = true;
                    }
                }
                return ship
            })
        }
        if (this.compShips.every(ship => ship.isDestroyed)){
            this.winner = 'player'
        }
        return true
    }

    isAdjacentHori = (cell, x, y) => (cell.x === x-1 && cell.y === y) || (cell.x === x+1 && cell.y === y);
    isAdjacentVert = (cell, x, y) => (cell.x === x && cell.y === y-1) || (cell.x === x && cell.y === y+1);
    shuffle = arr => arr.sort(() => Math.random() - 0.5)

    compMove(){
        let possibleCells = this.playerBoard.grid.flat().filter(cell => cell.covered && cell.isValidGuess)

        // if comp already knows something, pick nextCellToTry, otherwise pick randomly from all available cells, minus those that are directly adjacent to a ship
        const cellToTry = this.compKnows.nextCellToTry || possibleCells[Math.floor(Math.random() * possibleCells.length)];

        this.playerBoard.grid = this.playerBoard.grid.map(row => row.map(cell => {
            if (cell.id === cellToTry.id){
                cell.covered = false;

                // update possibleCells, because comp needs those later to decide which cell to try next
                possibleCells = possibleCells.filter(c => c.id !== cell.id)

                // if this is a hit
                if (cell.shipId){
                    this.compKnows.x = cell.x
                    this.compKnows.y = cell.y
                    let nextCellsToTry;

                    // if this is first hit
                    if (this.compKnows.startX === null){
                        /** initialise "this.compKnows" values
                         * - startX and startY are saved in case comp hits the edge of a ship and needs to go back in the other direction
                         * - testingIsHori is a random choice to determine whether comp picks a horizontally or vertically adjacent nextCellToTry
                         * **/
                        this.compKnows.startX = cell.x;
                        this.compKnows.startY = cell.y;
                        this.compKnows.testingIsHori = Math.random() < 0.5;

                        nextCellsToTry = this.compKnows.testingIsHori ? possibleCells.filter(c => this.isAdjacentHori(c, cell.x, cell.y)) : possibleCells.filter(c => this.isAdjacentVert(c, cell.x, cell.y))
                        // if nextCells is empty, it means that comp's random choice of isHori lead to a situation where he already ruled out the other direction by previous (random) shoots
                        if (nextCellsToTry.length === 0){
                            this.compKnows.testingIsHori = !this.compKnows.testingIsHori;
                            this.compKnows.isHori = this.compKnows.testingIsHori;
                            nextCellsToTry = this.compKnows.isHori ? possibleCells.filter(c => this.isAdjacentHori(c, cell.x, cell.y)) : possibleCells.filter(c => this.isAdjacentVert(c, cell.x, cell.y))
                        }
                    // second/third/... hit
                    } else {
                        /**
                         * - isHori is now known
                         * - nextCellsToTry depend on the direction comp is already going
                         * **/
                        if (this.compKnows.isHori === null){ // make sure I don't override previous knowledge
                            this.compKnows.isHori = this.compKnows.testingIsHori;
                        }
                        nextCellsToTry = this.compKnows.isHori ? possibleCells.filter(c => this.isAdjacentHori(c, cell.x, cell.y)) : possibleCells.filter(c => this.isAdjacentVert(c, cell.x, cell.y))
                    }


                    // if there's still no nextCells, comp has reached edge of ship and already uncovered the next cell in a previous shoot
                    if (nextCellsToTry.length === 0){
                        // go back to start and in the other direction
                        let nextCoordsToTry;
                        if (this.compKnows.isHori){
                            nextCoordsToTry = this.compKnows.x > this.compKnows.startX ? [this.compKnows.startX - 1, this.compKnows.startY] : [this.compKnows.startX + 1, this.compKnows.startY]
                        } else if (this.compKnows.isHori === false) {
                            nextCoordsToTry = this.compKnows.y > this.compKnows.startY ? [this.compKnows.startX, this.compKnows.startY - 1] : [this.compKnows.startX, this.compKnows.startY + 1]
                        }
                        nextCellsToTry = [possibleCells.find(cell => cell.x === nextCoordsToTry[0] && cell.y === nextCoordsToTry[1])]
                    }

                    this.compKnows.nextCellToTry = nextCellsToTry[Math.floor(Math.random() * nextCellsToTry.length)]

                    // update playerShips (increase damage and determine whether ship is destroyed or not)
                    this.playerShips = this.playerShips.map(ship => {
                        if (ship.id === cell.shipId){
                            ++ship.damage;
                            if (ship.damage === ship.shipSize){
                                ship.isDestroyed = true;
                                this.compKnows = this.initCompKnows()

                                // remove cells around the ship from pool of possible cells to try
                                const shipCoords = this.playerBoard.grid.flat().filter(c => c.shipId === ship.id).map(c =>({x: c.x, y: c.y, isShip:true}));
                                const bordersAround = this.playerBoard.addBordersAroundShip(ship, shipCoords)
                                bordersAround.forEach(({x, y, isShip}) => {
                                    if (!isShip) {
                                        this.playerBoard.grid[y][x].isValidGuess = false
                                    }
                                })
                            }
                        }
                        return ship;
                    })
                } else {
                    // no hit, but comp is already testing
                    if (this.compKnows.startX !== null){
                        this.compKnows.x = cell.x
                        this.compKnows.y = cell.y

                        if (this.compKnows.isHori !== null){
                            // if comp already knows ship orientation but got no hit this time -> reached edge of ship
                            /**
                             * nextCellToTry: going back to the first hit (startX, startY) and walking in the other direction
                             * **/
                            let nextCoordsToTry;
                            if(this.compKnows.isHori){
                                nextCoordsToTry = this.compKnows.x > this.compKnows.startX ? [this.compKnows.startX - 1, this.compKnows.startY] : [this.compKnows.startX + 1, this.compKnows.startY]
                            } else {
                                nextCoordsToTry = this.compKnows.y > this.compKnows.startY ? [this.compKnows.startX, this.compKnows.startY - 1] : [this.compKnows.startX, this.compKnows.startY + 1]
                            }

                            this.compKnows.nextCellToTry = possibleCells.find(cell => cell.x === nextCoordsToTry[0] && cell.y === nextCoordsToTry[1])
                        } else {
                            // comp is still busy finding the ship's orientation
                            /**
                             * nextCellsToTry are either above/below or left/right of the starting position, depending on testingIsHori
                             * **/
                            let nextCellsToTry = this.compKnows.testingIsHori ? possibleCells.filter(c => this.isAdjacentHori(c, this.compKnows.startX, this.compKnows.startY)) : possibleCells.filter(c => this.isAdjacentVert(c, this.compKnows.startX, this.compKnows.startY));
                            // if comp has tried both sides (above and below/left and right) and both were no hit (or are unavailable because it's the corner of the board),
                            // -> isHori is now known
                            if (nextCellsToTry.length === 0){
                                this.compKnows.isHori = !this.compKnows.testingIsHori;
                            }
                            if (this.compKnows.isHori !== null){
                                nextCellsToTry = this.compKnows.isHori ? possibleCells.filter(c => this.isAdjacentHori(c, this.compKnows.startX, this.compKnows.startY)) : possibleCells.filter(c => this.isAdjacentVert(c, this.compKnows.startX, this.compKnows.startY))
                            }
                            this.compKnows.nextCellToTry = nextCellsToTry[Math.floor(Math.random() * nextCellsToTry.length)]
                        }
                    }
                }
            }
            return cell;
        }))
        if (this.playerShips.every(ship => ship.isDestroyed)){
            this.winner = 'computer'
        }
    }

    startGame() {
        this.phase = phases[1];
    }
}

class Board {
    constructor(gridSize){
        this.gridSize = gridSize;
        this.grid = this.createCellsArray()
    }

    createCellsArray = () => Array(this.gridSize).fill(0).map((_, i) => Array(this.gridSize).fill(0).map((cell,j) => ({id: `${j}-${i}`, x:j, y:i, shipId:null, canPlaceShip:true, covered:true, isValidGuess:true})));

    startcellToShipCoords = (ship, cellX, cellY) => {
        const coords = []
        // walk through all cells that the ship would occupy
        for (let i=0; i < ship.shipSize; i++){
            const x = ship.isHori ? cellX + i : cellX;
            const y = ship.isHori ? cellY : cellY + i;

            // break loop if ship would be placed outside of board
            if (x > this.gridSize-1 || y > this.gridSize-1){
                break;
            }
            // break loop if cell is not free
            if (!this.grid[y][x].canPlaceShip){
                break;
            }
            coords.push({x, y, isShip:true})
        }
        // filter out coords arrays that are shorter than ship
        return coords.length === ship.shipSize ? coords : null
    }

    startcellToHoverCoords = (ship, cellX, cellY) => {
        const coords = [];
        let isValid = true;
        // walk through all cells that the ship would occupy
        for (let i=0; i < ship.shipSize; i++){
            const x = ship.isHori ? cellX + i : cellX;
            const y = ship.isHori ? cellY : cellY + i;

            // break loop if ship would be placed outside of board
            if (x > this.gridSize-1 || y > this.gridSize-1){
                isValid = false;
                break;
            }
            // setIsValid to false if ship is directly adjacent to another ship
            if (!this.grid[y][x].canPlaceShip){
                isValid = false
            }
            coords.push({x, y})
        }
        // return coords and isValid
        return isValid ? {values:coords, isValid:true} : {values:coords, isValid:false}
    }

    getRandomShipCoords = ship => {
        const positions = [];
        // walk through all grid cells and assume they could be possible starting coords of a ship
        this.grid.forEach(row => row.forEach(cell => {
            const coords = this.startcellToShipCoords(ship, cell.x, cell.y);
            if (coords){
                positions.push(coords)
            }
        }))
        // pick one random item from all possible positions
        return positions[Math.floor(Math.random() * positions.length)];
    }

    addBordersAroundShip = (ship, coords) => {
        // this is horrible
        if (ship.isHori){
            const above = coords[0].y > 0 ? coords.map(({x,y}) => ({x, y:y-1, isShip:false})) : [];
            const below = coords[0].y < this.gridSize-1 ? coords.map(({x,y}) => ({x, y:y+1, isShip:false})) : [];
            const left = coords[0].x > 0 ? [{x:coords[0].x-1, y: coords[0].y, isShip:false}] : [];
            const right = coords[coords.length-1].x < this.gridSize-1 ? [{x:coords[coords.length-1].x+1, y: coords[coords.length-1].y, isShip:false}] : [];
            coords.push(...above, ...below, ...left, ...right);
        } else {
            const above = coords[0].y > 0 ? [{x:coords[0].x, y: coords[0].y-1, isShip:false}] : [];
            const below = coords[coords.length-1].y < this.gridSize-1 ? [{x:coords[0].x, y: coords[coords.length-1].y+1, isShip:false}] : [];
            const left = coords[0].x > 0 ? coords.map(({x,y}) => ({x: x-1, y, isShip:false})) : [];
            const right = coords[coords.length-1].x < this.gridSize-1 ? coords.map(({x,y}) => ({x: x+1, y, isShip:false})) : [];
            coords.push(...above, ...below, ...left, ...right)
        }
        return coords
    }

    placeCompShip(ship){
        const shipCoords = this.getRandomShipCoords(ship);
        this.placeShipOnBoard(ship, shipCoords)
    }

    placePlayerShip(ship, cell){
        const coords = this.startcellToShipCoords(ship, cell.x, cell.y);
        if (!coords){
            return false;
        }
        this.placeShipOnBoard(ship, coords)
        return true;
    }

    placeShipOnBoard(ship, shipCoords){
        // add "borders" around ship coords (two ships can't be placed directly next to each other)
        const coords = this.addBordersAroundShip(ship, shipCoords);
        coords.forEach(({x, y, isShip}) => {
            this.grid[y][x].shipId = isShip ? ship.id : null;
            this.grid[y][x].canPlaceShip = false;
        })
        ship.isPlaced = true;
    }

    logGrid = () => {
        console.log('----------------------------')
        this.grid.forEach(row => console.log(row.map(cell => cell.shipId)))
        console.log('----------------------------')
    }
}




class Ship {
    constructor(id, shipSize, isHori, isPlaced, isSelected){
        this.id = id;
        this.shipSize = shipSize;
        this.isHori = isHori;
        this.isPlaced = isPlaced;
        this.isSelected = isSelected;
        this.damage = 0;
        this.isDestroyed = false;
    }

    rotateShip = () => this.isHori = !this.isHori;
}

export default Battleship;
