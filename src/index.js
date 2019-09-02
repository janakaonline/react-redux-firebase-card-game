import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware, compose} from 'redux'
import rootReducer from './store/reducers/rootReducer'
import {Provider} from 'react-redux'
import {rootEpic} from './epics';
import {createEpicMiddleware} from 'redux-observable';
import {reactReduxFirebase} from 'react-redux-firebase'
import {reduxFirestore} from 'redux-firestore'
import fbConfig from './config/fbConfig'


const epicMiddleware = createEpicMiddleware();


const store = createStore(rootReducer,
    compose(
        applyMiddleware(epicMiddleware),
        reduxFirestore(fbConfig),
        reactReduxFirebase(fbConfig, {attachAuthIsReady: true, useFirestoreForProfile: true, userProfile: 'players'})
    )
);


store.firebaseAuthIsReady.then(() => {
    ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://bit.ly/CRA-PWA
    serviceWorker.unregister();
});


epicMiddleware.run(rootEpic);
