import {ofType} from 'redux-observable';
import {mapTo, mergeMap} from 'rxjs/operators';
import * as CardDeckActionTypes from '../store/actionTypes/cardDeckActionTypes'
import {from} from 'rxjs';
import {ajax} from 'rxjs/ajax';
import {dealFailed, dealSuccessful} from '../store/actions/cardDeckActions'
import * as GameActions from "../enums/gameActionType";
import * as GameStatusTypes from "../enums/gameStatusType";
import {merge, of} from "rxjs/index";
import {catchError} from "rxjs/operators/index";

export const dealCards = (actions$, state$, getFirebase, getFirestore) => {
    const firestore = getFirestore();

    return actions$.pipe(
        ofType(CardDeckActionTypes.DEAL_CARDS),
        mergeMap(() => from(firestore.collection('game').doc('game_status').set({value: GameStatusTypes.Starting})),
            (action) => (action)
        ),
        mergeMap(() => ajax.getJSON('https://deckofcardsapi.com/api/deck/new/shuffle/'),
            (action, res) => ({action, res})
        ),
        mergeMap(({action, res}) => ajax.getJSON(`https://deckofcardsapi.com/api/deck/${res.deck_id}/draw/?count=50`),
            (action, res) => ({action: action.action, res})
        ),
        mergeMap(({action, res}) => {
            return from(
                firestore.collection('game_actions').add({
                    action: GameActions.StartGame,
                    payload: {uid: action.payload, cards: res.cards},
                })
            )
        }),
        mapTo(dealSuccessful()),
        catchError((error, caught) => merge(of(dealFailed(error)), caught))
    )
};