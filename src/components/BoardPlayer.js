export default function BoardPlayer({
    playerBoard,
    selectedId,
    isHori,
    highlightCells,
    resetHighlightCells,
    highlightedCells,
    handlePlaceShip,
    phase
}) {
    return (
        <div className="board" onMouseLeave={resetHighlightCells}>
            {playerBoard &&
                playerBoard.map((row, i) => (
                    <div key={`player-${i}`} className="row">
                        {row.map((value, j) => {
                            const isHighlighted = value >= 1 || (highlightedCells.x.includes(j) && highlightedCells.y.includes(i));
                            const classname = isHighlighted ? 'cell highlight' : value === 's' ? 'cell red' : value === 'w' ? 'cell blue' : 'cell';
                            return (
                                <div
                                    key={`player-${i}-${j}`}
                                    className={classname}
                                    onClick={() => handlePlaceShip(i, j, isHori)}
                                    onMouseEnter={phase === 'hasInitialised' && selectedId !== null ? () => highlightCells(i, j) : null}
                                ></div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
}
