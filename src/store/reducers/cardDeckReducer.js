import * as CardDeckActionTypes from '../actionTypes/cardDeckActionTypes'

const initState = {
    dealingCards: false,
    dealingCardsError: null
};

const cardDeckReducer = (state = initState, action) => {
    switch (action.type) {
        case CardDeckActionTypes.DEAL_CARDS:
            return {
                ...state,
                dealingCards: true
            };
        case CardDeckActionTypes.DEAL_SUCCESSFUL:
            return {
                ...state,
                dealingCards: false
            };
        case CardDeckActionTypes.DEAL_FAILED:
            return {
                ...state,
                dealingCards: false,
                dealingCardsError: action.payload.message,
            };
        default:
            return state
    }
};

export default cardDeckReducer