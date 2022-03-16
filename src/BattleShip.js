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
    const [isHori, setIsHori] = useState(true);
    const [highlightedCells, setHighlightedCells] = useState({ x: [], y: [] });
    const [selectedId, setSelectedId] = useState(1);
    const [compBoard, setCompBoard] = useState([]);
    const [isPlayerMove, setIsPlayerMove] = useState(false);

    useEffect(() => {
        if (!game) {
            const newGame = new Battleship();
            setGame(newGame);
            setCompBoard(newGame.compBoard);
        }
    }, [game]);

    const changeOrientation = () => setIsHori(prev => !prev);

    const highlightCells = (i, j) => {
        setHighlightedCells(game.getHighlightedCoordinates(i, j, selectedId, isHori));
    };

    const resetHighlightCells = () => setHighlightedCells({ x: [], y: [] });

    const selectShip = id => setSelectedId(prev => (prev === null || prev !== id ? id : null));

    const handleResetBoard = () => {
        game.resetPlayerBoard();
        setSelectedId(1);
        setIsHori(true);
    };

    const handlePlaceShip = (y, x, isHori) => {
        const wasPlaced = game.placePlayerShip(y, x, selectedId, isHori);
        if (wasPlaced) {
            setSelectedId(prev => (prev < game.ships.length ? prev + 1 : null));
        }
    };

    const handleStartGame = () => {
        game.startGame();
        setIsPlayerMove(true);
    };

    const handleNewGame = () => {
        const newGame = new Battleship();
        setGame(newGame);
        setCompBoard(newGame.compBoard);
        setIsPlayerMove(false);
        setIsHori(true);
        setSelectedId(1);
        setHighlightedCells({ x: [], y: [] });
    };

    const handlePlayerMove = (i, j) => {
        if (isPlayerMove) {
            setIsPlayerMove(false);
            game.playerMove(j, i);
            setCompBoard(game.compBoard);
            setTimeout(() => {
                game.compMove();
                setIsPlayerMove(true);
            }, 1200);
        }
    };

    return (
        <div className="app">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Header />
                <div>
                    <button onClick={() => console.log(game)}>log</button>
                </div>
            </div>

            {game?.winner && <EndMsg winner={game.winner} />}

            <div className="flex">
                <BoardComp phase={game?.phase} compBoard={compBoard} handlePlayerMove={handlePlayerMove} />
                <ShipsComp compShips={game?.compShips} />
            </div>

            <div className="flex">
                <BoardPlayer
                    playerBoard={game?.playerBoard}
                    selectedId={selectedId}
                    isHori={isHori}
                    highlightCells={highlightCells}
                    resetHighlightCells={resetHighlightCells}
                    highlightedCells={highlightedCells}
                    handlePlaceShip={handlePlaceShip}
                    phase={game?.phase}
                />
                <ShipsPlayer
                    playerShips={game?.playerShips}
                    phase={game?.phase}
                    selectedId={selectedId}
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
