import React, {Component} from 'react'
import cardBackImg from '../../assets/cardBack.png'

class OpponentHand extends Component {

    render() {
        const {cards} = this.props;
        return (
            <div className="player-hand">
                {cards && cards.map((card) => {
                    return (
                        <div className="player-card" key={card.code}><img src={cardBackImg} alt=""/></div>
                    )
                })}
            </div>
        )
    }
}

export default OpponentHand