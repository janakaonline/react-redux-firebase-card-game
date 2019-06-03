import * as AuthActionTypes from '../actionTypes/authActionTypes'

const initState = {};

const authReducer = (state = initState, action) => {
    switch (action.type) {
        case AuthActionTypes.REGISTER_SUCCESS:
            console.log('register success');
            return {
                ...state,
                authError: null
            };
        case AuthActionTypes.REGISTER_ERROR:
            console.log('register error');
            return {
                ...state,
                authError: action.error.message
            };
        case AuthActionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                authError: null
            };
        case AuthActionTypes.LOGIN_ERROR:
            return {
                ...state,
                authError: 'Login failed'
            };
        case AuthActionTypes.LOGOUT_SUCCESS:
            return state;
        default:
            return state
    }
};

export default authReducer