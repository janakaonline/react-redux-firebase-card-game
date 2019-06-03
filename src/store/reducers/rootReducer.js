import {combineReducers} from 'redux'
import {firestoreReducer} from 'redux-firestore'
import {firebaseReducer} from 'react-redux-firebase'

import authReducer from './authReducer'
import gameReducer from './gameReducer'
import cardDeckReducer from './cardDeckReducer'
import playersReducer from './playersReducer'
import playerHandReducer from './playerHandReducer'

const rootReducer = combineReducers({
    auth: authReducer,
    game: gameReducer,
    cardDeck: cardDeckReducer,
    players: playersReducer,
    playerHand: playerHandReducer,
    firestore: firestoreReducer,
    firebase: firebaseReducer
})

export default rootReducer