import * as AuthActionTypes from '../actionTypes/authActionTypes'

const initState = {
    authError: null,
    authBusy: false
};

const authReducer = (state = initState, action) => {
    switch (action.type) {
        case AuthActionTypes.REGISTER_USER:
            return {
                ...state,
                authBusy: true
            };
        case AuthActionTypes.REGISTER_SUCCESS:
            return {
                ...state,
                authError: null,
                authBusy: false
            };
        case AuthActionTypes.REGISTER_ERROR:
            return {
                ...state,
                authError: action.payload.message,
                authBusy: false
            };
        case AuthActionTypes.LOGIN_USER:
            return {
                ...state,
                authError: null,
                authBusy: true
            };
        case AuthActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                authError: null,
                authBusy: false
            };
        case AuthActionTypes.LOGOUT_USER:
            return {
                ...state,
                authError: null,
                authBusy: true
            };
        case AuthActionTypes.LOGIN_ERROR:
            return {
                ...state,
                authError: 'Login failed',
                authBusy: false
            };
        case AuthActionTypes.LOGOUT_SUCCESS:
            return {
                ...state,
                authError: null,
                authBusy: false
            };
        default:
            return state
    }
};

export default authReducer