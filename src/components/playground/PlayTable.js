import React, {Component} from 'react'
import {connect} from 'react-redux'
import Player from './Player'
import PreloadImages from './PreloadImages'
import {firestoreConnect} from 'react-redux-firebase'
import {compose} from 'redux'
import {Button, Modal, Alert} from 'react-bootstrap'
import LeaveConfirmationDialog from './LeaveConfirmationDialog'
import * as PlayerStatusType from "../../enums/playerStatusType";
import * as GameStatusType from "../../enums/gameStatusType";
import {Redirect} from 'react-router-dom'
import tableImg from '../../assets/table.jpg'
import {ToastContainer, toast} from 'react-toastify';

import {ucFirst} from "../../helpers/stringHelper";

import {leaveGame} from "../../store/actions/gameActions";
import {dealCards} from "../../store/actions/cardDeckActions";
import {playCard} from "../../store/actions/playerHandActions";

class PlayTable extends Component {

    state = {
        showLeaveConfirmation: false,
        selectedCard: null,
        canPlay: false,
        activePlayer: null,
    };


    componentDidUpdate(prevProps) {
        const {currentJoinedPlayer} = this.props;

        if (currentJoinedPlayer && prevProps.currentJoinedPlayer
            && currentJoinedPlayer.take_action_time !== prevProps.currentJoinedPlayer.take_action_time) {
            // console.log(prevProps, currentJoinedPlayer.take_action, currentJoinedPlayer.take_action_data);
            this.processNextAction(currentJoinedPlayer.take_action, currentJoinedPlayer.take_action_data);
        }
    };

    processNextAction = (action, actionData) => {
        switch (action) {
            case  'ShowHandWinner':
                this.showHandWinner(actionData.id, actionData.nickname, actionData.winning_card);
                break;
            case  'ShowResults':
                this.showResults(actionData.game_history_id);
                break;
            default:
        }
    };

    showResults = (gameHistoryId) => {
        this.props.leaveGame(this.props.fbAuth.uid);
        this.props.history.push(`/scoreboard/${gameHistoryId}`);
    };

    showHandWinner = (winnerId, nickname, card) => {
        const cardName = ucFirst(card.value) + ' of ' + ucFirst(card.suit);

        // console.log('##################calling winner toast', cardName);
        toast.info(`${nickname} won the hand with the high card ${cardName}`);
    };

    getSeatingMapping = (() => {
        const {joinedPlayers, fbAuth} = this.props;
        const seatingMapping = {};

        if (!joinedPlayers) {
            return seatingMapping;
        }

        const joinedPlayersCopy = JSON.parse(JSON.stringify(joinedPlayers));
        const currentIndexOfPlayer = joinedPlayersCopy.map(x => x.id).indexOf(fbAuth.uid);
        const playerToLeft = joinedPlayersCopy.slice(currentIndexOfPlayer, joinedPlayersCopy.length);
        const playerToRight = joinedPlayersCopy.slice(null, currentIndexOfPlayer);

        playerToLeft.forEach((player, i) => {
            player.seat = i + 1;
            seatingMapping[player.id] = player.seat;
            return player;
        });

        playerToRight.reverse().forEach((player, i) => {
            player.seat = 5 - i;
            seatingMapping[player.id] = player.seat;
        });

        return seatingMapping;
    });

    handleLeaveGame = (e) => {
        e.preventDefault();
        this.setState((oldState) => {
            return ({
                ...oldState,
                showLeaveConfirmation: false
            })
        });


        this.props.leaveGame(this.props.fbAuth.uid);
    };

    handleCancelLeave = (e) => {
        e.preventDefault();
        this.setState((oldState) => {
            return ({
                ...oldState,
                showLeaveConfirmation: false
            })
        });
    };

    confirmLeave = (e) => {
        e.preventDefault();
        this.setState((oldState) => {
            return ({
                ...oldState,
                showLeaveConfirmation: true
            })
        });
    };

    handleStartGame = (e) => {
        e.preventDefault();
        this.props.dealCards(this.props.fbAuth.uid);
    };

    canPlay = () => {
        const {fbAuth, selectedCard, game} = this.props;
        return this.isActiveUser(fbAuth.uid) && !!selectedCard && GameStatusType.isGameInProgress(this.props)
            && !game.playingCard
    };

    handlePlayCard = (e) => {
        e.preventDefault();
        if (!this.canPlay()) {
            return false
        }

        this.props.playCard(this.props.fbAuth.uid, this.props.selectedCard);
    };


    isActiveUser = (uid) => {
        const {activeUser} = this.props;
        return activeUser && activeUser.value === uid;
    };

    //renditions
    renderActionPanel = () => {
        return (
            <div className="d-flex justify-content-between">
                <Button onClick={this.confirmLeave} variant="danger">Leave Game</Button>
                <Button disabled={!this.canPlay()} onClick={this.handlePlayCard} variant="success">Play</Button>
            </div>
        )
    };

    renderPlayers = () => {
        const {fbAuth, joinedPlayers} = this.props;

        if (!joinedPlayers) {
            return null;
        }

        const joinedPlayersCopy = JSON.parse(JSON.stringify(joinedPlayers));
        const currentIndexOfPlayer = joinedPlayersCopy.map(x => x.id).indexOf(fbAuth.uid);
        const playerToLeft = joinedPlayersCopy.slice(currentIndexOfPlayer, joinedPlayersCopy.length);
        const playerToRight = joinedPlayersCopy.slice(null, currentIndexOfPlayer);

        const seatingMapping = {};
        let orderedPlayerList = playerToLeft.map((player, i) => {
            player.seat = i + 1;
            seatingMapping[player.id] = player.seat;
            return player;
        });

        orderedPlayerList = orderedPlayerList.concat(playerToRight.reverse().map((player, i) => {
            player.seat = 5 - i;
            seatingMapping[player.id] = player.seat;
            return player;
        }));


        return (
            orderedPlayerList.map((player, i) => {
                return <Player player_id={player.id} key={player.id} seat={player.seat}
                               isOpponent={fbAuth.uid !== player.id}/>
            })
        )
    };

    renderPlayedCards = () => {
        const {playedCards} = this.props;
        const seatingMapping = this.getSeatingMapping();
        if (!playedCards) {
            return null;
        }

        return playedCards.map((card) => {
            const playerSeat = seatingMapping[card.played_by] || 0;
            return <div className={`played-card seat-${playerSeat}`} key={card.code}>
                <img src={card.image} alt={card.code}/>
            </div>
        });
    };


    render() {
        const {fbAuth, profile, game, joinedPlayers} = this.props;

        if (!fbAuth.uid) {
            return <Redirect to="sign-in"/>
        }

        if (!game || !profile || !joinedPlayers) {
            return <Alert variant="secondary">
                Loading. Please wait...
            </Alert>
        }

        if (profile.status === PlayerStatusType.Idle) {
            return <Redirect to="/"/>
        }

        return (
            <div className="container playground">
                <ToastContainer autoClose={2500}/>
                <div className="play-table mb-2 mt-2">
                    <div className="played-cards">
                        {this.renderPlayedCards()}
                    </div>
                    <div className="player-list">
                        {this.renderPlayers()}
                    </div>

                    {GameStatusType.isReadyToStart(this.props) || GameStatusType.isWaitingForPlayers(this.props)
                        ?
                        <Button disabled={!GameStatusType.isReadyToStart(this.props)} onClick={this.handleStartGame}
                                className={'btn btn-lg btn-primary ' +
                                (GameStatusType.isReadyToStart(this.props) ? 'start-button' : 'not-enough-players-button')}>
                            {!GameStatusType.isWaitingForPlayers(this.props) ? 'Start Game' : 'Not enough players to start'}
                        </Button>
                        :
                        null
                    }

                    <img src={tableImg} alt="" className="play-table-bg"/>

                    {this.renderActionPanel()}
                </div>


                <LeaveConfirmationDialog show={this.state.showLeaveConfirmation}
                                         onClickNo={this.handleCancelLeave}
                                         onClickYes={this.handleLeaveGame}
                />

                <Modal show={GameStatusType.isGameStarting(this.props)}
                       backdrop="static" centered={true}>
                    <Modal.Body>
                        <h2>Game is starting... Please wait</h2>
                    </Modal.Body>
                </Modal>

                <Modal show={game && game.leaving} backdrop="static" centered={true}>
                    <Modal.Body>
                        <h2>Leaving the game... Please wait</h2>
                    </Modal.Body>
                </Modal>

                <Modal show={game && game.playingCard} backdrop="static" centered={true}>
                    <Modal.Body>
                        <h2>Playing card... Please wait</h2>
                    </Modal.Body>
                </Modal>

                <PreloadImages />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const game = state.firestore.ordered['game'];
    const joinedPlayers = state.firestore.ordered['joined-players'];
    return {
        cards: state.cardDeck.cards,
        joinedPlayers: joinedPlayers,
        currentJoinedPlayer: joinedPlayers && joinedPlayers.find(kvp => kvp.id === state.firebase.auth.uid),
        profile: state.firebase.profile,
        fbAuth: state.firebase.auth,
        selectedCard: state.playerHand.selectedCard,
        activeUser: game && game.find(kvp => {
            return kvp.id === 'active_user';
        }),
        gameStatus: game && game.find(kvp => {
            return kvp.id === 'game_status';
        }),
        playedCards: state.firestore.ordered['played-cards'],
        game: state.game,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        leaveGame: (uid) => dispatch(leaveGame(uid)),
        dealCards: (uid) => dispatch(dealCards(uid)),
        playCard: (uid, selectedCard) => dispatch(playCard(uid, selectedCard)),
    }
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect([
        {collection: 'played-cards', orderBy: ['time', 'asc']},
        {collection: 'joined-players', orderBy: ['time', 'asc']},
        {collection: 'game'},
    ])
)(PlayTable)