import { AiOutlineRotateLeft } from 'react-icons/ai';
import { FaTrash } from 'react-icons/fa';

export default function ShipsPlayer({
    playerShips,
    phase,
    selectedId,
    selectShip,
    changeOrientation,
    handleResetBoard,
    handleStartGame,
    handleNewGame
}) {
    return (
        <div className="ships-container">
            <div className="ships player">
                {playerShips &&
                    playerShips.map(ship => (
                        <div
                            key={`player-${ship.id}`}
                            className={
                                selectedId === ship.id
                                    ? 'ship selected'
                                    : ship.isDestroyed
                                    ? 'ship destroyed'
                                    : ship.isPlaced
                                    ? 'ship disabled'
                                    : 'ship'
                            }
                            onClick={() => (phase === 'hasInitialised' ? selectShip(ship.id) : null)}
                            style={{ width: `${ship.size * 30}px` }}
                        >
                            {ship.isDestroyed && <span>SUNK</span>}
                        </div>
                    ))}
            </div>

            <div className="btns-container">
                {phase === 'hasInitialised' && (
                    <div className="btns-container-top">
                        <button onClick={changeOrientation} disabled={selectedId === null}>
                            <AiOutlineRotateLeft />
                        </button>
                        <button onClick={handleResetBoard}>
                            <FaTrash />
                        </button>
                    </div>
                )}
                {phase === 'hasInitialised' && playerShips && (
                    <button className={!playerShips.every(ship => ship.isPlaced) ? 'disabled' : null} onClick={handleStartGame}>
                        done
                    </button>
                )}
                {phase === 'gameIsRunning' && <button onClick={handleNewGame}>new game</button>}
            </div>
        </div>
    );
}
