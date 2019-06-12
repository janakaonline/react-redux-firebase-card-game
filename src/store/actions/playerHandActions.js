import * as PlayerHandActionType from "../actionTypes/playerHandActionTypes";
import {notifyCardPlay, notifyCardPlayed} from "./gameActions";
import * as GameActions from "../../enums/gameActionType";

export const selectCard = (selectedCard) => {
    return (dispatch, getState) => {
        console.log(PlayerHandActionType.CARD_SELECTED);
        dispatch({type: PlayerHandActionType.CARD_SELECTED, selectedCard});
    }
};

export const playCard = (uid, selectedCard) => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {
        //let playCard = getFirebase().functions().httpsCallable('playCard');
        const firestore = getFirestore();
        dispatch(notifyCardPlay());
        console.log('playCard function called');
        //dispatch({type: PlayerHandActionType.PLAY_CARD_SUCCESS});

        return firestore.collection('game_actions').add({
            action: GameActions.PlayCard,
            payload: {uid, card: selectedCard},
        }).then(() => {
            console.log(PlayerHandActionType.PLAY_CARD_SUCCESS);
            dispatch({type: PlayerHandActionType.PLAY_CARD_SUCCESS});
            dispatch(notifyCardPlayed());
        }).catch((error) => {
            console.log(PlayerHandActionType.PLAY_CARD_ERROR);
            dispatch({type: PlayerHandActionType.PLAY_CARD_ERROR, error});
            dispatch(notifyCardPlayed());
        });

        /*playCard({card: selectedCard}).then(() => {
            console.log(PlayerHandActionType.PLAY_CARD_SUCCESS);
            dispatch({type: PlayerHandActionType.PLAY_CARD_SUCCESS});
            dispatch(notifyCardPlayed());
        }).catch((error) => {
            console.log(PlayerHandActionType.PLAY_CARD_ERROR);
            dispatch({type: PlayerHandActionType.PLAY_CARD_ERROR, error});
            dispatch(notifyCardPlayed());
        });*/
    }
};