import React, { useState, useEffect, createContext } from 'react';

import Battleship from '../classes/classBattleShip';

export const GameContext = createContext({});

export default function GameContextProvider({ children }) {
    const [game, setGame] = useState(null);
    const [phase, setPhase] = useState('hasInitialised');
    const [playerShips, setPlayerShips] = useState([]);
    const [playerBoard, setPlayerBoard] = useState([]);
    const [compShips, setCompShips] = useState([]);
    const [compBoard, setCompBoard] = useState([]);
    const [isPlayerMove, setIsPlayerMove] = useState(false);
    //const [getHighlightedCoordinates, setGetHighlightedCoordinates] = useState(null);
    const [playerMove, setPlayerMove] = useState(null);

    const [selectedId, setSelectedId] = useState(1);

    useEffect(() => {
        if (!game) {
            const newGame = new Battleship();
            setGame(newGame);
            setPlayerShips(newGame.playerShips);
            setPlayerBoard(newGame.playerBoard);
            setCompShips(newGame.compShips);
            setCompBoard(newGame.compBoard);
            setIsPlayerMove(newGame.isPlayerMove);
            setPlayerMove(newGame.playerMove);
        }
    }, []);

    const startGame = () => game.startGame();

    const resetPlayerBoard = () => {
        game.resetPlayerBoard();
        setSelectedId(1);
    };

    const selectShip = id => setSelectedId(prev => (prev === null || prev !== id ? id : null));

    const placeShip = (y, x, isHori) => {
        const wasPlaced = game.placePlayerShip(y, x, selectedId, isHori);
        if (wasPlaced) {
            setSelectedId(prev => (prev < game.ships.length ? prev + 1 : null));
        }
    };

    return (
        <GameContext.Provider
            value={{
                phase,
                startGame,
                resetPlayerBoard,
                playerBoard,
                selectShip,
                placeShip,
                selectedId,
                isPlayerMove,
                compBoard,
                playerShips,
                compShips,
                playerMove
            }}
        >
            {children}
        </GameContext.Provider>
    );
}
