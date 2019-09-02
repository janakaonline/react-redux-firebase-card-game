import {combineEpics} from 'redux-observable';
import {signUp, signOut, signIn} from './auth';
import {joinGame, leaveGame} from './gameActions';
import {dealCards} from './cardDeckActions';
import {playCard} from './playerHandActions';
import {getFirebase} from 'react-redux-firebase';
import {getFirestore} from 'redux-firestore';

export const rootEpic = (...args) => combineEpics(
    signUp, signOut, signIn, joinGame, leaveGame, dealCards, playCard
)(...args, getFirebase, getFirestore);
