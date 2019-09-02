import * as GameActionTypes from '../actionTypes/gameActionTypes'

export const joinGame = (uid) => {
    return {type: GameActionTypes.JOIN_GAME, payload: uid}
};

export const joinGameSuccessful = () => {
    return {type: GameActionTypes.JOIN_GAME_SUCCESS}
};

export const joinGameError = (error) => {
    return {type: GameActionTypes.JOIN_GAME_FAILED, payload: error}
};

export const leaveGame = (uid) => {
    return {type: GameActionTypes.LEAVE_GAME, payload: uid}
};

export const leaveGameSuccessful = () => {
    return {type: GameActionTypes.LEAVE_GAME_SUCCESS}
};

export const leaveGameError = (error) => {
    return {type: GameActionTypes.LEAVE_GAME_FAILED, payload: error}
};

export const startGame = () => {
    return {type: GameActionTypes.STARTING}
};

export const gameStarted = () => {
    return {type: GameActionTypes.STARTED}
};

export const gameStartFailed = (error) => {
    return {type: GameActionTypes.START_FAILED, payload: error}
};

export const notifyStarted = () => {
    return {type: GameActionTypes.STARTED}
};

export const notifyLeaving = () => {
    return {type: GameActionTypes.LEAVING}
};

export const notifyLeaft = () => {
    return {type: GameActionTypes.LEFT}
};

export const notifyCardPlay = () => {
    return {type: GameActionTypes.PLAYING_CARD}
};

export const notifyCardPlayed = () => {
    return {type: GameActionTypes.CARD_PLAYED}
};

export const notifyAuthBusy = () => {
    return {type: GameActionTypes.AUTH_BUSY}
};

export const notifyAuthComplete = () => {
    return {type: GameActionTypes.AUTH_COMPLETE}
};