import * as AuthActionTypes from '../actionTypes/authActionTypes'

export const signIn = (credentials) => {
    return {type: AuthActionTypes.LOGIN_USER, payload: credentials}
};

export const signInSuccessful = () => {
    return {type: AuthActionTypes.LOGIN_SUCCESS}
};

export const signInFailed = (error) => {
    return {type: AuthActionTypes.LOGIN_ERROR, payload: error}
};

export const signUp = (newUser) => {
    return {type: AuthActionTypes.REGISTER_USER, payload: newUser}
};

export const signUpSuccessful = () => {
    return {type: AuthActionTypes.REGISTER_SUCCESS}
};

export const signUpFailed = (error) => {
    return {type: AuthActionTypes.REGISTER_ERROR, payload: error}
};

export const signOut = () => {
    return {type: AuthActionTypes.LOGOUT_USER}
};

export const signOutSuccessful = () => {
    return {type: AuthActionTypes.LOGOUT_SUCCESS}
};

export const signOutFailed = (error) => {
    return {type: AuthActionTypes.LOGOUT_ERROR, payload: error}
};