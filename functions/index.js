const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const PictureCardValue = {
    JACK: 11,
    QUEEN: 12,
    KING: 13,
    ACE: 14
};

//collection refs
const joinedPlayersRef = db.collection('joined-players');
const gameRef = db.collection('game');
const playedCardsRef = db.collection('played-cards');
const playersRef = db.collection('players');
const gameHistoryRef = db.collection('game-history');
const notificationRef = db.collection('notifications');

const createNotification = (notification) => {
    return notificationRef.add(notification);
};
const resetGame = () => {
    return Promise.all([
        gameRef.doc('active_user').set({value: null}),
        gameRef.doc('game_status').set({value: 'Waiting for players'}),
        gameRef.doc('next_action').set({value: null}),
        gameRef.doc('played_rounds').set({value: 0}),
        gameRef.doc('results').delete(),
        playedCardsRef.get().then((snap) => {
            let batch = db.batch();
            snap.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
    ])
};


exports.userJoined = functions.firestore.document('joined-players/{joinedPlayerId}').onCreate(async doc => {

    const dbPromises = [];
    const joinedPlayer = doc.data();
    const notification = {
        content: `${joinedPlayer.nickname} joined the game`,
        player: joinedPlayer.nickname,
        time: admin.firestore.FieldValue.serverTimestamp()
    };

    const joinedPlayersSnap = await joinedPlayersRef.orderBy('time', 'desc').get();
    if (joinedPlayersSnap.size > 1) {
        dbPromises.push(gameRef.doc('game_status').set({value: 'Ready to start'}));
    }

    if (joinedPlayersSnap.size === 5) {
        dbPromises.push(gameRef.doc('game_status').set({value: 'Starting'}));
        dbPromises.push(joinedPlayersRef.doc(joinedPlayersSnap.docs[0].ref).update({
            take_action: 'Deal',
            take_action_data: {},
            take_action_time: admin.firestore.FieldValue.serverTimestamp()
        }));
    }

    dbPromises.push(createNotification(notification));

    return Promise.all(dbPromises);
});

exports.userLeaved = functions.firestore.document('joined-players/{joinedPlayerId}').onDelete(async (doc) => {

    const dbPromises = [];
    const joinedPlayer = doc.data();
    const notification = {
        content: `${joinedPlayer.nickname} left the game`,
        player: joinedPlayer.nickname,
        time: admin.firestore.FieldValue.serverTimestamp()
    };


    const joinedPlayersSnap = await joinedPlayersRef.get();

    if (joinedPlayersSnap.size < 2) {
        dbPromises.push(resetGame());
    }

    dbPromises.push(createNotification(notification));

    return Promise.all(dbPromises);
});

exports.joinGame = functions.https.onCall(async (data, context) => {

    const dbPromises = [];
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    console.log('join game function called by ', context.auth.uid);

    const joinedPlayersSnapshot = await joinedPlayersRef.get();

    if (joinedPlayersSnapshot.size > 4) {
        throw new functions.https.HttpsError('failed-precondition', 'Maximum 5 players already joined the game.');
    }

    joinedPlayersSnapshot.forEach((doc) => {
        if (doc.id === context.auth.uid) {
            throw new functions.https.HttpsError('failed-precondition', 'You have already joined the game');
        }
    });

    const playerSnap = await playersRef.doc(context.auth.uid).get();
    const playerData = playerSnap.data();

    dbPromises.push(
        joinedPlayersRef.doc(context.auth.uid).set({
            nickname: playerData.nickname,
            points: 0,
            time: admin.firestore.FieldValue.serverTimestamp()
        })
    );

    dbPromises.push(
        playersRef.doc(context.auth.uid).set({
            ...playerData,
            status: 'In Game'
        })
    );

    return Promise.all(dbPromises);
});

exports.leaveGame = functions.https.onCall((data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    return joinedPlayersRef.doc(context.auth.uid).get().then((joinedPlayerDoc) => {
        if (!joinedPlayerDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'You have not joined the game yet');
        } else {
            joinedPlayersRef.doc(context.auth.uid).delete();

            playersRef.doc(joinedPlayerDoc.id).set({
                ...joinedPlayerDoc.data(),
                status: 'Idle'
            });
        }
    }).catch((error) => {
        throw new functions.https.HttpsError('unknown', error.message, error);
    });
});

exports.dealCards = functions.https.onCall(async (data, context) => {

    const dbPromises = [];
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    const cardsToDeal = data.cards;
    const querySnapshot = await joinedPlayersRef.get();

    querySnapshot.forEach((doc) => {
        let player = doc.data();
        dbPromises.push(joinedPlayersRef.doc(doc.id).set({
            ...player,
            cards: cardsToDeal.splice(0, 10)
        }));
    });

    dbPromises.push(gameRef.doc('game_status').set({value: 'In progress'}));
    dbPromises.push(gameRef.doc('played_rounds').set({value: 0}));
    dbPromises.push(gameRef.doc('active_user').set({value: context.auth.uid}));

    return Promise.all(dbPromises).then(() => {
        return 'dealt'
    });
});

exports.playCard = functions.https.onCall(async (data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    //input data
    const playedCard = data.card;

    //add card to the played cards
    await playedCardsRef.add({
        ...playedCard,
        played_by: context.auth.uid,
        time: admin.firestore.FieldValue.serverTimestamp()
    });

    //perform all get queries
    return Promise.all([
        joinedPlayersRef.orderBy('time', 'asc').get(),
        joinedPlayersRef.doc(context.auth.uid).get(),
        gameRef.get(),
        playedCardsRef.orderBy('time', 'asc').get()
    ]).then(async (data) => {
        const joinedPlayersSnapshot = data[0];
        const currentJoinedPlayerDoc = data[1];
        const gameSnapshot = data[2];
        const playedCardsSnapshot = data[3];
        const batch = db.batch();
        let playerNextAction = "NextPlayer";
        let playerNextActionData = {};

        //destruct game settings
        let gameSettings = {};
        gameSnapshot.forEach(doc => {
            gameSettings[doc.id] = doc.data() ? doc.data().value : null;
        });

        //check preconditions
        if (!currentJoinedPlayerDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'You have not joined the game yet');
        }

        if (!gameSettings.active_user || gameSettings.active_user !== context.auth.uid) {
            throw new functions.https.HttpsError('failed-precondition', 'Invalid operation');
        }

        const currentPlayer = currentJoinedPlayerDoc.data();
        const playedCardIndex = currentPlayer.cards.findIndex((item) => {
            return item.code === playedCard.code;
        });
        let winner = null;

        //check the played card is a valid card
        if (playedCardIndex < 0) {
            throw new functions.https.HttpsError('failed-precondition', 'Invalid card');
        }

        //remove the played card from the player's hand
        currentPlayer.cards.splice(playedCardIndex, 1);

        //check if this is the last play on this hand
        if (playedCardsSnapshot.docs.length === joinedPlayersSnapshot.docs.length) {
            //this is the last action of the current hand

            //valuate who won the hand
            let highestValuedCard = playedCard;

            playedCardsSnapshot.forEach((doc) => {
                let card = doc.data();
                const cardValue = isNaN(card.value) ? PictureCardValue[card.value] : parseInt(card.value);
                const highestCardValue = isNaN(highestValuedCard.value) ? PictureCardValue[highestValuedCard.value] : parseInt(highestValuedCard.value);
                if (cardValue >= highestCardValue) {
                    highestValuedCard = {...card};
                }

                //remove card
                batch.delete(doc.ref);
            });

            //find the winner of the hand
            const players = [];
            joinedPlayersSnapshot.forEach((doc) => {
                const player = doc.data();
                if (doc.id === highestValuedCard.played_by) {
                    player.points = player.points + 1;
                    winner = {...player, id: doc.id};
                    //update player points
                    batch.set(doc.ref, player);
                }

                players.push(player);
            });
            players.sort((a, b) => b.points - a.points);

            if (!winner) {
                throw new functions.https.HttpsError('failed-precondition', 'Winner is not in the game');
            }

            gameSettings['results'] = players;

            //check if the game is over
            if (gameSettings['played_rounds'] && gameSettings['played_rounds'] === 9) {
                //this is the last play of the game

                const newGameHistoryRef = await gameHistoryRef.add({
                    result: players,
                    time: admin.firestore.FieldValue.serverTimestamp()
                });

                const winnerNames = players.sort((a, b) => b.points - a.points).filter((i) => {
                    return i.points === players[0].points;
                }).map((i) => {
                    return i.nickname;
                }).join(', ');

                const winnerNotification = {
                    content: `${winnerNames} won the game`,
                    player: winnerNames,
                    time: admin.firestore.FieldValue.serverTimestamp()
                };

                createNotification(winnerNotification);

                gameSettings['played_rounds'] = 0;
                gameSettings['game_status'] = 'Finished';
                gameSettings['next_action'] = 'EndGame';

                playerNextAction = 'ShowResults';
                playerNextActionData = {
                    game_history_id: newGameHistoryRef.id
                }

            } else {
                gameSettings['next_action'] = 'EndHand';
                gameSettings['active_user'] = winner.id;
                playerNextAction = 'ShowHandWinner';
                playerNextActionData = {
                    id: winner.id,
                    nickname: winner.nickname,
                    winning_card: highestValuedCard,
                    played_player_id: currentJoinedPlayerDoc.id,
                    played_player_nickname: currentPlayer.nickname,
                    played_card: playedCard
                };

                //increase played rounds
                gameSettings['played_rounds'] = gameSettings['played_rounds'] ? gameSettings['played_rounds'] + 1 : 1;
            }

        } else {
            //this is not the last action of the current hand

            //set next player
            let nextUserIndex = joinedPlayersSnapshot.docs.findIndex((doc) => {
                return doc.id === context.auth.uid
            }) + 1;

            if (nextUserIndex === joinedPlayersSnapshot.docs.length) {
                nextUserIndex = 0;
            }

            const nextUser = joinedPlayersSnapshot.docs[nextUserIndex].data();

            gameSettings['active_user'] = joinedPlayersSnapshot.docs[nextUserIndex].id;
            gameSettings['next_action'] = 'NextPlayer';

            playerNextAction = 'EndTurn';
            playerNextActionData = {
                next_player_id: joinedPlayersSnapshot.docs[nextUserIndex].id,
                next_player_nickname: nextUser.nickname,
                played_player_id: currentJoinedPlayerDoc.id,
                played_player_nickname: currentPlayer.nickname,
                played_card: playedCard
            }
        }

        for (let k in gameSettings) {
            if (gameSettings.hasOwnProperty(k)) {
                console.log(`game setting ${k}`);
                gameRef.doc(k).set({
                    value: gameSettings[k]
                })
            }
        }

        joinedPlayersSnapshot.forEach((doc) => {
            const playerData = doc.id === currentJoinedPlayerDoc.id ? currentPlayer : doc.data();
            const playerPoints = winner && doc.id === winner.id ? winner.points : playerData.points;
            batch.set(doc.ref, {
                ...playerData,
                points: playerPoints,
                take_action: playerNextAction,
                take_action_data: playerNextActionData,
                take_action_time: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return batch.commit().then(() => {
            return gameSettings['next_action'];
        });
    }).catch((error) => {
        throw new functions.https.HttpsError('unknown', error.message, error);
    });
});