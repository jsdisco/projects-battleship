export default function BoardComp({ phase, compBoard, handlePlayerMove }) {
    return (
        <div className={phase === 'gameIsRunning' ? 'board active' : 'board'}>
            {compBoard.map((row, i) => (
                <div key={`comp-${i}`} className="row">
                    {row.map(cell => {
                        const classname = cell.covered ? 'cell' : cell.shipId ? 'cell red' : 'cell blue';
                        return <div key={cell.id} className={classname} onClick={() => handlePlayerMove(cell)}></div>;
                    })}
                </div>
            ))}
        </div>
    );
}
