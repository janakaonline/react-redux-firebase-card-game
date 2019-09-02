import {ofType} from 'redux-observable';
import {mapTo, mergeMap} from 'rxjs/operators';
import * as PlayerHandActionType from '../store/actionTypes/playerHandActionTypes'
import {from} from 'rxjs';
import {playCardFailed, playCardSuccessful} from '../store/actions/playerHandActions'
import * as GameActions from "../enums/gameActionType";
import {merge, of} from "rxjs/index";
import {catchError} from "rxjs/operators/index";

export const playCard = (actions$, state$, getFirebase, getFirestore) => {
    const firestore = getFirestore();

    return actions$.pipe(
        ofType(PlayerHandActionType.PLAY_CARD),
        mergeMap((action) => from(firestore.collection('game_actions').add({
                action: GameActions.PlayCard,
                payload: {uid: action.payload.uid, card: action.payload.selectedCard},
            })),
            (action) => (action)
        ),
        mapTo(playCardSuccessful()),
        catchError((error, caught) => merge(of(playCardFailed(error)), caught))
    )
};