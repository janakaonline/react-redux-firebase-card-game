import fetch from 'cross-fetch'
import * as CardDeckActionTypes from '../actionTypes/cardDeckActionTypes'
import {notifyStarted, startGame} from "./gameActions";
import * as GameActions from "../../enums/gameActionType";

export const dealCards = (uid) => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {
        // let dealCards = getFirebase().functions().httpsCallable('dealCards');
        const firestore = getFirestore();

        dispatch(startGame());


        return fetch('https://deckofcardsapi.com/api/deck/new/shuffle/').then(response => response.json())
            .then(data => {
                return fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=50`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('dealCards function called');
                        //dispatch({type: CardDeckActionTypes.SHUFFLE_SUCCESS});
                        return firestore.collection('game_actions').add({
                            action: GameActions.StartGame,
                            payload: {uid, cards: data.cards},
                        });

                        /*return dealCards({cards: data.cards}).then(() => {
                            console.log(CardDeckActionTypes.SHUFFLE_SUCCESS);
                            dispatch({type: CardDeckActionTypes.SHUFFLE_SUCCESS});
                            dispatch(notifyStarted());
                        }).catch((error) => {
                            console.log(CardDeckActionTypes.SHUFFLE_FAILED);
                            dispatch({type: CardDeckActionTypes.SHUFFLE_FAILED, error});
                        });*/
                    })
                    .catch((error) => {
                        console.log(CardDeckActionTypes.SHUFFLE_FAILED, error);
                        dispatch({type: CardDeckActionTypes.SHUFFLE_FAILED, error});
                    })
            })
            .catch((error) => {
                console.log(CardDeckActionTypes.SHUFFLE_FAILED, error);
                dispatch({type: CardDeckActionTypes.SHUFFLE_FAILED, error});
            })
    }
};