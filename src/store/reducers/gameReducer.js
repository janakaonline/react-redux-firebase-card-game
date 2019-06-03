import * as GameActionTypes from '../actionTypes/gameActionTypes'

const initState = {
    gameStarting: false,
    joining: false,
    leaving: false,
    inProgress: false,
    playingCard: false,
    authBusy: false,
};

const gameReducer = (state = initState, action) => {
    switch (action.type) {
        case GameActionTypes.JOINING:
            return {
                ...state,
                joining: true
            };
        case GameActionTypes.JOINED:
            return {
                ...state,
                joining: false
            };
        case GameActionTypes.JOIN_GAME_SUCCESS:
            return {
                ...state,
                gameError: null,
                joining: false
            };
        case GameActionTypes.JOIN_GAME_FAILED:
            return {
                ...state,
                gameError: action.error.message,
                joining: false
            };
        case GameActionTypes.LEAVING:
            return {
                ...state,
                leaving: true,
            };
        case GameActionTypes.LEFT:
            return {
                ...state,
                leaving: false,
            };
        case GameActionTypes.LEAVE_GAME_SUCCESS:
            return {
                ...state,
                gameError: null,
                leaving: false,
            };
        case GameActionTypes.LEAVE_GAME_FAILED:
            return {
                ...state,
                gameError: action.error.message,
                leaving: false,
            };
        case GameActionTypes.STARTING:
            return {
                ...state,
                gameStarting: true,
            };
        case GameActionTypes.STARTED:
            return {
                ...state,
                gameStarting: false,
                inProgress: true,
            };
        case GameActionTypes.PLAYING_CARD:
            return {
                ...state,
                playingCard: true,
            };
        case GameActionTypes.CARD_PLAYED:
            return {
                ...state,
                playingCard: false,
            };
        case GameActionTypes.AUTH_BUSY:
            return {
                ...state,
                authBusy: true,
            };
        case GameActionTypes.AUTH_COMPLETE:
            return {
                ...state,
                authBusy: false,
            };
        default:
            return state;
    }
};

export default gameReducer