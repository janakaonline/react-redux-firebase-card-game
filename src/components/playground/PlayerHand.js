import React, {Component} from 'react'
import {connect} from 'react-redux'
import {selectCard} from "../../store/actions/playerHandActions";
import {firestoreConnect} from 'react-redux-firebase'
import {compose} from 'redux'

class PlayerHand extends Component {

    canSelectCard = () => {
        const {activeUser, auth} = this.props;
        return activeUser && activeUser.value === auth.uid;
    };

    handleSelectCard = (e, card) => {
        e.preventDefault();

        if (!this.canSelectCard()) {
            return;
        }

        this.props.selectCard(card);
    };

    render() {
        const {selectedCard} = this.props;

        return (
            <div className="player-hand">
                {this.props.cards && this.props.cards.map((card) => {
                    return (
                        <div onClick={(e) => this.handleSelectCard(e, card)}
                             className={`player-card ` + (selectedCard && selectedCard.code === card.code ? ' selected ' : '')}
                             key={card.code}>
                            <img src={card.image} alt={card.code}/>
                        </div>
                    )
                })}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {game} = state.firestore.ordered;
    return ({
        selectedCard: state.playerHand.selectedCard,
        auth: state.firebase.auth,
        activeUser: game && game.find(kvp => {
            return kvp.id === 'active_user';
        }),
    })
};

const mapDispatchToProps = (dispatch) => {
    return ({
        selectCard: (selectedCard) => dispatch(selectCard(selectedCard))
    })
};

export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    firestoreConnect([
        {collection: 'game'},
    ])
)(PlayerHand)