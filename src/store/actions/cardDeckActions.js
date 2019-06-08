import fetch from 'cross-fetch'
import * as CardDeckActionTypes from '../actionTypes/cardDeckActionTypes'
import {notifyStarted, startGame} from "./gameActions";

export const dealCards = () => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {
        let dealCards = getFirebase().functions().httpsCallable('dealCards');
        dispatch(startGame());

        fetch('https://deckofcardsapi.com/api/deck/new/shuffle/').then(response => response.json())
            .then(data => {
                return fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=50`)
                    .then(response => response.json())
                    .then(data => {
                        console.log('dealCards function called');
                        //dispatch({type: CardDeckActionTypes.SHUFFLE_SUCCESS});
                        return dealCards({cards: data.cards}).then(() => {
                            console.log(CardDeckActionTypes.SHUFFLE_SUCCESS);
                            dispatch({type: CardDeckActionTypes.SHUFFLE_SUCCESS});
                            dispatch(notifyStarted());
                        }).catch((error) => {
                            console.log(CardDeckActionTypes.SHUFFLE_FAILED);
                            dispatch({type: CardDeckActionTypes.SHUFFLE_FAILED, error});
                        });
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