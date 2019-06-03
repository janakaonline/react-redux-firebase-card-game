import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/functions'

var firebaseConfig = {
    apiKey: "AIzaSyBmeNiDdV5nZ3eQIYLe_FrpUgEi32xImnE",
    authDomain: "card-game-119ee.firebaseapp.com",
    databaseURL: "https://card-game-119ee.firebaseio.com",
    projectId: "card-game-119ee",
    storageBucket: "card-game-119ee.appspot.com",
    messagingSenderId: "846842453031",
    appId: "1:846842453031:web:a452b43725f7b472"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


export default firebase