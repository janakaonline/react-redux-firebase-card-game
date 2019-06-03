import React, {Component} from 'react';
import {compose} from 'redux'
import {connect} from 'react-redux'
import {firestoreConnect} from 'react-redux-firebase'
import {Card, Button, ListGroup, Alert, Badge} from 'react-bootstrap';
import victoryGif from '../../assets/victory.gif'

class Scoreboard extends Component {
    goToLobby = (e) => {
        e.preventDefault();
        this.props.history.push('/');
    };

    render() {

        const {gameHistory} = this.props;
        const sortedResults = gameHistory ? gameHistory.result.sort((a, b) => b.points - a.points) : [];

        if (!sortedResults.length) {
            return (
                <Alert variant="secondary">
                    Scoreboard is loading. Please wait...
                </Alert>
            );
        }

        const highestScore = sortedResults[0].points;


        return (
            <div className="container scoreboard">
                <h1>Scoreboard</h1>
                <Card>
                    <Card.Body>
                        <ListGroup>
                            {sortedResults.map((item, idx) => {
                                return (
                                    <ListGroup.Item key={idx}>


                                        <span className="mr-2">{item.nickname}</span>

                                        <Badge variant='light'>
                                            Hands won: {item.points}
                                        </Badge>

                                        {highestScore === item.points
                                            ?
                                            <span>
                                                <Badge variant='success'>!!!Winner!!!</Badge>
                                                <img className="victory-ani" src={victoryGif} alt="Victory!!!"/>
                                            </span>
                                            : null}
                                    </ListGroup.Item>
                                )
                            })}
                        </ListGroup>
                        <Button className="mt-3" variant="secondary" onClick={this.goToLobby}>Back to Lobby</Button>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

const mapStateToProps = (state, thisProps) => {
    const gameHistoryId = thisProps.match.params.id;
    const gameHistories = state.firestore.ordered['game-history'];
    return ({
        gameHistory: gameHistories && gameHistories.find(item => {
            return item.id === gameHistoryId;
        })
    })
};
export default compose(
    connect(mapStateToProps),
    firestoreConnect([
        {collection: 'game-history'}
    ])
)(Scoreboard);