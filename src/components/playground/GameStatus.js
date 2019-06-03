import React from 'react'

const GameStatus = (props) => {

    if (!props.game) {
        return null;
    }


    let status = props.game.find(kvp => {
        return kvp.id === 'game_status';
    });

    status = status ? status.value : 'Unknown';


    return (
        <div>
            Game status: <span className="badge badge-primary">{status}</span>
        </div>
    )
};

export default (GameStatus)