import React, {Component} from 'react'
import {connect} from 'react-redux'

import PlayerHand from './PlayerHand'
import OpponentHand from './OpponentHand'
import {compose} from "redux";
import {firestoreConnect} from "react-redux-firebase";

class Player extends Component {

    isActiveUser = () => {
        const {activeUser, player} = this.props;
        return activeUser && activeUser.value === player.id;
    };

    isOpponent = () => {
        const {auth, player} = this.props;
        return auth.uid !== player.id;
    };

    render() {
        const {player} = this.props;

        return (
            <div className={`player seat-${this.props.seat} ` + (this.isActiveUser() ? ' active ' : '')
            + (this.props.isOpponent ? ' opponent ' : ' current-player ')}>
                
                <div className="player-avatar">
                    <img src={`https://api.adorable.io/avatars/100/${player.id}.png`} alt=""/>
                </div>

                <div className="nickname">{player.nickname}</div>
                <div className="points">{player.points}</div>
                {this.props.isOpponent
                    ?
                    <OpponentHand cards={player.cards}/>
                    :
                    <PlayerHand cards={player.cards}/>}
            </div>
        )
    }
}

const mapStateToProps = (state, thisProps) => {
    const game = state.firestore.ordered['game'];
    const joinedPlayers = state.firestore.ordered['joined-players'];
    return {
        player: joinedPlayers && joinedPlayers.find(kvp => kvp.id === thisProps.player_id),
        profile: state.firebase.profile,
        auth: state.firebase.auth,
        activeUser: game && game.find(kvp => {
            return kvp.id === 'active_user';
        }),
        game: state.game,
    }
};


export default compose(
    connect(mapStateToProps),
    firestoreConnect([
        {collection: 'joined-players', orderBy: ['time', 'asc']},
    ])
)(Player)