import * as AuthActionTypes from '../actionTypes/authActionTypes'
import * as PlayerStatus from '../../enums/playerStatusType'
import {notifyAuthBusy, notifyAuthComplete} from "./gameActions";

export const signUp = (newUser) => {
    return (dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase();
        const firestore = getFirestore();
        dispatch(notifyAuthBusy());

        firebase.auth().createUserWithEmailAndPassword(
            newUser.email,
            newUser.password
        ).then((res) => {
            return firestore.collection('players').doc(res.user.uid).set({
                nickname: newUser.nickname,
                points: 0,
                status: PlayerStatus.Idle
            });

        }).then(() => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.REGISTER_SUCCESS
            })
        }).catch((error) => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.REGISTER_ERROR,
                error
            })
        })
    }
};

export const signIn = (credentials) => {
    return (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        dispatch(notifyAuthBusy());

        firebase.auth().signInWithEmailAndPassword(
            credentials.email,
            credentials.password
        ).then(() => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.LOGIN_SUCCESS
            })
        }).catch((error) => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.LOGIN_ERROR,
                error
            })
        })
    }
};

export const signOut = () => {
    return (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();
        dispatch(notifyAuthBusy());

        firebase.auth().signOut().then(() => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.LOGOUT_SUCCESS
            })
        }).catch((error) => {
            dispatch(notifyAuthComplete());
            dispatch({
                type: AuthActionTypes.LOGOUT_ERROR,
                error
            })
        })
    }
};