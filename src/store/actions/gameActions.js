import * as GameActionTypes from '../actionTypes/gameActionTypes'

export const joinGame = () => {
    return (dispatch, getState, {getFirebase}) => {
        let joinGame = getFirebase().functions().httpsCallable('joinGame');
        dispatch({type: GameActionTypes.JOINING});

        joinGame({}).then(() => {
            console.log(GameActionTypes.JOIN_GAME_SUCCESS);
            dispatch({type: GameActionTypes.JOIN_GAME_SUCCESS});
        }).catch((error) => {
            console.log(GameActionTypes.JOIN_GAME_FAILED);
            dispatch({type: GameActionTypes.JOIN_GAME_FAILED, error});
        });

    }
};

export const leaveGame = () => {
    return (dispatch, getState, {getFirebase}) => {
        let leaveGame = getFirebase().functions().httpsCallable('leaveGame');
        dispatch({type: GameActionTypes.LEAVING});

        leaveGame({}).then(() => {
            console.log(GameActionTypes.LEAVE_GAME_SUCCESS);
            dispatch({type: GameActionTypes.LEAVE_GAME_SUCCESS});
        }).catch((error) => {
            console.log(GameActionTypes.LEAVE_GAME_FAILED);
            dispatch({type: GameActionTypes.LEAVE_GAME_FAILED, error});
        });

    }
};

export const startGame = () => {
    return (dispatch, getState, {getFirebase}) => {
        dispatch({type: GameActionTypes.STARTING});
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