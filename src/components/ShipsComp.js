export default function ShipsComp({ compShips }) {
    return (
        <div className="ships-container">
            <div className="ships comp">
                {compShips &&
                    compShips.map(ship => (
                        <div
                            key={`comp-${ship.id}`}
                            className={ship.isDestroyed ? 'ship destroyed' : 'ship disabled'}
                            style={{ width: `${ship.size * 30}px` }}
                        >
                            {ship.isDestroyed && <span>SUNK</span>}
                        </div>
                    ))}
            </div>
        </div>
    );
}
