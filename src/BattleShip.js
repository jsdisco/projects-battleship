import React, { useState, useEffect } from 'react';

import Header from './components/Header';
import ShipsPlayer from './components/ShipsPlayer';
import ShipsComp from './components/ShipsComp';
import BoardComp from './components/BoardComp';
import BoardPlayer from './components/BoardPlayer';
import EndMsg from './components/EndMsg';

import Battleship from './classes/classBattleShip';

export default function BattleShip() {
    const [game, setGame] = useState(null);
    const [hoveredCells, setHoveredCells] = useState(null);
    const [compBoard, setCompBoard] = useState([]);
    const [playerBoard, setPlayerBoard] = useState([]);
    const [playerShips, setPlayerShips] = useState([]);
    const [isPlayerMove, setIsPlayerMove] = useState(false);

    useEffect(() => {
        if (!game) {
            const newGame = new Battleship();
            setGame(newGame);
            setCompBoard(newGame.compBoard.grid);
            setPlayerBoard(newGame.playerBoard.grid);
            setPlayerShips(newGame.playerShips);
        }
    }, [game]);

    const changeOrientation = () => game.playerShips.forEach(ship => ship.rotateShip());

    const hoverBoard = (i, j) => {
        const ship = playerShips.find(s => s.isSelected);
        if (ship) {
            setHoveredCells(game.playerBoard.startcellToHoverCoords(ship, j, i));
        }
    };

    const resetHoveredCells = () => setHoveredCells(null);

    const selectShip = id => {
        game.selectPlayerShip(id);
        setPlayerShips(game.playerShips);
    };

    const handleResetBoard = () => {
        game.resetPlayerBoard(false);
        setPlayerBoard(game.playerBoard.grid);
        setPlayerShips(game.playerShips);
    };

    const handlePlaceShip = cell => {
        const ship = game.playerShips.find(s => s.isSelected);
        const wasPlaced = game.playerBoard.placePlayerShip(ship, cell);

        if (wasPlaced) {
            game.selectNextPlayerShip();
            setPlayerShips(game.playerShips);
        }
    };

    const handleStartGame = () => {
        game.startGame();
        setIsPlayerMove(true);
    };

    const handleNewGame = () => {
        const newGame = new Battleship();
        setGame(newGame);
        setCompBoard(newGame.compBoard.grid);
        setPlayerBoard(newGame.playerBoard.grid);
        setPlayerShips(newGame.playerShips);
        setIsPlayerMove(false);
        setHoveredCells(null);
    };

    const handlePlayerMove = cell => {
        if (isPlayerMove) {
            const wasValidMove = game.playerMove(cell);
            if (wasValidMove) {
                setIsPlayerMove(false);
                setCompBoard(game.compBoard.grid);
                if (!game.winner) {
                    setTimeout(() => {
                        game.compMove();
                        setPlayerBoard(game.playerBoard.grid);
                        setIsPlayerMove(true);
                    }, 900);
                }
            }
        }
    };

    return (
        <div className="app">
            <Header />

            {game?.winner && <EndMsg winner={game.winner} />}

            <div className="flex">
                <BoardComp phase={game?.phase} compBoard={compBoard} handlePlayerMove={handlePlayerMove} />
                <ShipsComp compShips={game?.compShips} />
            </div>

            <div className="flex">
                <BoardPlayer
                    playerBoard={playerBoard}
                    playerShips={playerShips}
                    hoveredCells={hoveredCells}
                    hoverBoard={hoverBoard}
                    resetHoveredCells={resetHoveredCells}
                    handlePlaceShip={handlePlaceShip}
                    phase={game?.phase}
                />
                <ShipsPlayer
                    playerShips={playerShips}
                    phase={game?.phase}
                    selectShip={selectShip}
                    changeOrientation={changeOrientation}
                    handleResetBoard={handleResetBoard}
                    handleStartGame={handleStartGame}
                    handleNewGame={handleNewGame}
                />
            </div>
        </div>
    );
}
