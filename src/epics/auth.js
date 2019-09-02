import {ofType} from 'redux-observable';
import {from, merge, of} from 'rxjs';
import {mapTo, mergeMap, catchError} from 'rxjs/operators';
import {signOutSuccessful, signOutFailed, signUpSuccessful, signUpFailed, signInFailed, signInSuccessful}
    from '../store/actions/authActions';
import * as AuthActionTypes from '../store/actionTypes/authActionTypes';
import * as PlayerStatus from '../enums/playerStatusType';


export const signIn = (actions$, state$, getFirebase, getFirestore) => {
    const firebase = getFirebase();
    const firestore = getFirestore();

    return actions$.pipe(
        ofType(AuthActionTypes.LOGIN_USER),
        mergeMap(action => from(
            firebase.auth().signInWithEmailAndPassword(
                action.payload.email,
                action.payload.password
            ))
        ),
        mergeMap(() => from(
            firestore.collection('players')
                .doc(firebase.auth().currentUser.uid)
                .update({
                    points: 0,
                    status: PlayerStatus.Idle
                }))
        ),
        mapTo(signInSuccessful()),
        catchError((error, caught) => merge(of(signInFailed(error)), caught))
    );
};


export const signUp = (actions$, state$, getFirebase, getFirestore) => {
    const firebase = getFirebase();
    const firestore = getFirestore();

    return actions$.pipe(
        ofType(AuthActionTypes.REGISTER_USER),
        mergeMap(action => from(
            firebase.auth().createUserWithEmailAndPassword(
                action.payload.email,
                action.payload.password
            )),
            (action, res) => ({action, res})
        ),
        mergeMap(({action, res}) => from(
            firestore.collection('players')
                .doc(res.user.uid)
                .set({
                    nickname: action.payload.nickname,
                    points: 0,
                    status: PlayerStatus.Idle
                })
            )
        ),
        mapTo(signUpSuccessful()),
        catchError((error, caught) => merge(of(signUpFailed(error)), caught))
    );
};

export const signOut = (actions$, state$, getFirebase, getFirestore) => {
    const firebase = getFirebase();
    const firestore = getFirestore();

    return actions$.pipe(
        ofType(AuthActionTypes.LOGOUT_USER),
        mergeMap(() => from(
            firestore.collection('players')
                .doc(firebase.auth().currentUser.uid)
                .update({
                    points: 0,
                    status: PlayerStatus.Offline
                })
            )
        ),
        mergeMap(() => from(firebase.auth().signOut())),
        mapTo(signOutSuccessful()),
        catchError((error, caught) => merge(of(signOutFailed(error)), caught))
    );
};