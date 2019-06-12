import * as GameActionTypes from '../actionTypes/gameActionTypes'
import * as GameActions from "../../enums/gameActionType";
import * as GameStatusTypes from "../../enums/gameStatusType";

export const joinGame = (uid) => {
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
};

export const startGame = () => {
    return (dispatch, getState, {getFirestore}) => {
        return getFirestore().collection('game').doc('game_status').set({value: GameStatusTypes.Starting});
    }
};

export const notifyStarted = () => {
    return (dispatch) => {
        dispatch({type: GameActionTypes.STARTED});
    }
};

export const notifyLeaving = () => {
    return (dispatch, getState, {getFirebase}) => {
        dispatch({type: GameActionTypes.LEAVING});
    }
};

export const notifyLeaft = () => {
    return (dispatch) => {
        dispatch({type: GameActionTypes.LEFT});
    }
};

export const notifyCardPlay = () => {
    return (dispatch, getState, {getFirebase}) => {
        dispatch({type: GameActionTypes.PLAYING_CARD});
    }
};

export const notifyCardPlayed = () => {
    return (dispatch) => {
        dispatch({type: GameActionTypes.CARD_PLAYED});
    }
};

export const notifyAuthBusy = () => {
    return (dispatch, getState, {getFirebase}) => {
        dispatch({type: GameActionTypes.AUTH_BUSY});
    }
};

export const notifyAuthComplete = () => {
    return (dispatch) => {
        dispatch({type: GameActionTypes.AUTH_COMPLETE});
    }
};