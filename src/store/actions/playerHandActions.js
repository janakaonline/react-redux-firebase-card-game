import * as PlayerHandActionType from "../actionTypes/playerHandActionTypes";
import {notifyCardPlay, notifyCardPlayed} from "./gameActions";

export const selectCard = (selectedCard) => {
    return (dispatch, getState) => {
        console.log(PlayerHandActionType.CARD_SELECTED);
        dispatch({type: PlayerHandActionType.CARD_SELECTED, selectedCard});
    }
};

export const playCard = (selectedCard) => {
    return (dispatch, getState, {getFirebase}) => {
        let playCard = getFirebase().functions().httpsCallable('playCard');
        dispatch(notifyCardPlay());
        console.log('playCard function called');
        //dispatch({type: PlayerHandActionType.PLAY_CARD_SUCCESS});
        playCard({card: selectedCard}).then(() => {
            console.log(PlayerHandActionType.PLAY_CARD_SUCCESS);
            dispatch({type: PlayerHandActionType.PLAY_CARD_SUCCESS});
            dispatch(notifyCardPlayed());
        }).catch((error) => {
            console.log(PlayerHandActionType.PLAY_CARD_ERROR);
            dispatch({type: PlayerHandActionType.PLAY_CARD_ERROR, error});
            dispatch(notifyCardPlayed());
        });
    }
};