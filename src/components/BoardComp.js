export default function BoardComp({ phase, compBoard, handlePlayerMove }) {
    return (
        <div className={phase === 'gameIsRunning' ? 'board active' : 'board'}>
            {compBoard.map((row, i) => (
                <div key={`comp-${i}`} className="row">
                    {row.map((value, j) => {
                        const classname = value === 's' ? 'cell red' : value === 'w' ? 'cell blue' : 'cell';
                        return <div key={`comp-${i}-${j}`} className={classname} onClick={() => handlePlayerMove(i, j)}></div>;
                    })}
                </div>
            ))}
        </div>
    );
}
