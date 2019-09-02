import {ofType} from 'redux-observable';
import {from, merge, of} from 'rxjs';
import {mapTo, mergeMap, catchError} from 'rxjs/operators';
import {leaveGameSuccessful, leaveGameError, joinGameSuccessful, joinGameError, gameStarted, gameStartFailed}
    from '../store/actions/gameActions';
import * as GameActionTypes from '../store/actionTypes/gameActionTypes';
import * as GameActions from '../enums/gameActionType';

export const joinGame = (actions$, state$, getFirebase, getFirestore) => {
    const firestore = getFirestore();
    return actions$.pipe(
        ofType(GameActionTypes.JOIN_GAME),
        mergeMap(action => from(
            firestore.collection('game_actions').add({
                action: GameActions.JoinGame,
                payload: {uid: action.payload},
            })
        )),
        mapTo(joinGameSuccessful()),
        catchError((error, caught) => merge(of(joinGameError(error)), caught))
    );
};

export const leaveGame = (actions$, state$, getFirebase, getFirestore) => {
    const firestore = getFirestore();
    return actions$.pipe(
        ofType(GameActionTypes.LEAVE_GAME),
        mergeMap(action => from(
            firestore.collection('game_actions').add({
                action: GameActions.LeaveGame,
                payload: {uid: action.payload},
            })
        )),
        mapTo(leaveGameSuccessful()),
        catchError((error, caught) => merge(of(leaveGameError(error)), caught))
    );
};

/*export const joinGame = (uid) => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {
        //let joinGame = getFirebase().functions().httpsCallable('joinGame');
        dispatch({type: GameActionTypes.JOINING});
        const firestore = getFirestore();

        console.log('joinGame function call', uid);

        return firestore.collection('game_actions').add({
            action: GameActions.JoinGame,
            payload: {uid},
        }).then(() => {
            console.log(GameActionTypes.JOIN_GAME_SUCCESS);
            dispatch({type: GameActionTypes.JOIN_GAME_SUCCESS});
        }).catch((error) => {
            console.log(GameActionTypes.JOIN_GAME_FAILED);
            dispatch({type: GameActionTypes.JOIN_GAME_FAILED, error});
        });
    }
};

export const leaveGame = (uid) => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {

        dispatch({type: GameActionTypes.LEAVING});
        console.log('leaveGame function call');

        return getFirestore().collection('game_actions').add({
            action: GameActions.LeaveGame,
            payload: {uid},
        }).then(ref => {
            dispatch({type: GameActionTypes.LEAVE_GAME_SUCCESS});
        }).catch(error => {
            dispatch({type: GameActionTypes.LEAVE_GAME_FAILED, error});
        });
    }
};*/