import React, {Component} from 'react'
import {connect} from 'react-redux'

import PlayerHand from './PlayerHand'
import OpponentHand from './OpponentHand'

class Player extends Component {

    render() {
        return (
            <div className={`player seat-${this.props.seat} ` + (this.props.active ? ' active ' : '')
            + (this.props.isOpponent ? ' opponent ' : ' current-player ')}>
                <div className="player-avatar">
                    <img src={`https://api.adorable.io/avatars/100/${this.props.player.id}.png`} alt=""/>
                </div>
                <div className="nickname">{this.props.player.nickname}</div>
                <div className="points">{this.props.player.points}</div>
                {this.props.isOpponent
                    ?
                    <OpponentHand cards={this.props.player.cards}/>
                    :
                    <PlayerHand cards={this.props.player.cards}/>}
            </div>
        )
    }
}

export default connect()(Player)