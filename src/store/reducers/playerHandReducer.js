import * as PlayerHandActionType from "../actionTypes/playerHandActionTypes";

const initState = {
    selectedCard: null,
    handActionError: null
};

const playersReducer = (state = initState, action) => {
    switch (action.type) {

        case PlayerHandActionType.CARD_SELECTED:
            return {
                ...state,
                selectedCard: action.payload
            };
        case PlayerHandActionType.PLAY_CARD_SUCCESS:
            return {
                ...state,
                selectedCard: null,
                handActionError: null
            };
        case PlayerHandActionType.PLAY_CARD_ERROR:
            return {
                ...state,
                handActionError: action.error.message
            };

        default:
            return state
    }
};

export default playersReducer