export default function BoardPlayer({
    playerBoard,
    playerShips,
    hoveredCells,
    hoverBoard,
    resetHoveredCells,
    handlePlaceShip,
    phase
}) {

    return (
        <div className="board" onMouseLeave={resetHoveredCells}>
            {playerBoard.map((row, i) => (
                    <div key={`player-${i}`} className="row">
                        {row.map((cell, j) => {
                            const isHovered = (hoveredCells && cell.shipId) || (hoveredCells && hoveredCells.values.find(c => c.x === j && c.y === i));
                            const classname = !cell.covered && cell.shipId ? 'cell red' : !cell.covered && !cell.shipId ? 'cell blue' : cell.covered && cell.shipId ? 'cell brown' : isHovered && hoveredCells.isValid ? 'cell hover' : isHovered && !hoveredCells.isValid ? 'cell grey' : 'cell'
                            return (
                                <div
                                    key={`player-${i}-${j}`}
                                    className={classname}
                                    onClick={phase === 'hasInitialised' ? () => handlePlaceShip(cell) : null}
                                    onMouseEnter={phase === 'hasInitialised' && !playerShips.every(ship => ship.isPlaced) ? () => hoverBoard(i, j) : null}
                                >{}</div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
}
