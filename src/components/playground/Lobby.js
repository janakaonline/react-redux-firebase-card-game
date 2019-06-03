import React, {Component} from 'react';
import {compose} from 'redux'
import {connect} from 'react-redux'
import {firestoreConnect} from "react-redux-firebase";
import {Redirect} from 'react-router-dom'
import GameStatus from './GameStatus'
import * as PlayerStatusType from '../../enums/playerStatusType'
import * as GameStatusType from '../../enums/gameStatusType'
import Notifications from './Notifications'
import {joinGame} from "../../store/actions/gameActions";
import {leaveGame} from "../../store/actions/gameActions";
import {Button, Badge} from 'react-bootstrap'


class Lobby extends Component {

    handleJoinGame = (e) => {
        e.preventDefault();
        this.props.joinGame(this.state);
    };

    handleLeaveGame = (e) => {
        e.preventDefault();
        this.props.leaveGame(this.state);
    };

    renderActionButtons = (player) => {
        const {game, gameStatus} = this.props;
        if (!game || !gameStatus) {
            return null;
        }

        const status = gameStatus.find(kvp => {
            return kvp.id === 'game_status';
        });

        if([GameStatusType.ReadyToStart,GameStatusType.WaitingForPlayers].indexOf(status.value) < 0){
            return <Badge size="sm" variant='warning'>Game in progress</Badge>
        }

        return (
            player.status === PlayerStatusType.InGame
                ?
                <Button variant="danger" onClick={this.handleLeaveGame}>Leave</Button>
                :
                <Button variant="success" size="sm" disabled={game.joining} onClick={this.handleJoinGame}>
                    {game.joining ? 'JOINING...' : 'JOIN'}
                </Button>
        )
    };

    renderPlayerRows = () => {
        return this.props.players && this.props.players.map(player => {
            return (
                <tr key={player.id}>
                    <td>{player.nickname}</td>

                    <td>{player.status}</td>
                    <td>
                        {player.id === this.props.auth.uid ? this.renderActionButtons(player) : null}
                    </td>
                </tr>
            )
        })
    };

    render() {
        const {auth, gameStatus, notifications, profile} = this.props;

        if (!auth.uid) {
            return <Redirect to="sign-in"/>
        }

        if (profile.status !== PlayerStatusType.Idle) {
            return <Redirect to="table"/>
        }

        return (
            <div className="container pt-3">
                <h1 className="mb-3">Lobby</h1>

                <div className="mb-2">
                    <GameStatus game={gameStatus}/>
                </div>

                <div className="row">
                    <div className="col-6">
                        <h2>Player list</h2>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Player</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {this.renderPlayerRows()}
                            </tbody>
                        </table>
                    </div>
                    <div className="col-6">
                        <h2>Activities</h2>
                        <Notifications notifications={notifications}/>
                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        profile: state.firebase.profile,
        players: state.firestore.ordered.players,
        gameStatus: state.firestore.ordered.game,
        notifications: state.firestore.ordered.notifications,
        auth: state.firebase.auth,
        game: state.game,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        joinGame: () => dispatch(joinGame()),
        leaveGame: () => dispatch(leaveGame()),
    }
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect([
        {collection: 'players'},
        {collection: 'game', doc: 'game_status'},
        {collection: 'notifications', limit: 5, orderBy: ['time', 'desc']}
    ])
)(Lobby);