import * as PlayerHandActionType from "../actionTypes/playerHandActionTypes";

export const selectCard = (selectedCard) => {
    return {type: PlayerHandActionType.CARD_SELECTED, payload: selectedCard}
};

export const playCard = (uid, selectedCard) => {
    return {type: PlayerHandActionType.PLAY_CARD, payload: {uid, selectedCard}}
};

export const playCardSuccessful = () => {
    return {type: PlayerHandActionType.PLAY_CARD_SUCCESS}
};

export const playCardFailed = (error) => {
    return {type: PlayerHandActionType.PLAY_CARD_ERROR, payload: error}
};
