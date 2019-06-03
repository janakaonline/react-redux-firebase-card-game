const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const createNotification = (notification) => {
    return db.collection('notifications').add(notification);
};

const resetGame = () => {
    return Promise.all([
        db.collection('game').doc('active_user').set({value: null}),
        db.collection('game').doc('game_status').set({value: 'Waiting for players'}),
        db.collection('game').doc('next_action').set({value: null}),
        db.collection('game').doc('played_rounds').set({value: 0}),
        db.collection('game').doc('results').delete(),
        db.collection('played-cards').get().then((snap) => {
            let batch = db.batch();
            snap.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            return batch.commit();
        })
    ])
};

const PictureCardValue = {
    JACK: 11,
    QUEEN: 12,
    KING: 13,
    ACE: 14
};

exports.userJoined = functions.firestore.document('joined-players/{joinedPlayerId}').onCreate(async doc => {
    const joinedPlayer = doc.data();
    const notification = {
        content: `${joinedPlayer.nickname} joined the game`,
        player: joinedPlayer.nickname,
        time: admin.firestore.FieldValue.serverTimestamp()
    };
    const joinedPlayersRef = db.collection('joined-players');

    const dbPromises = [];
    const joinedPlayersSnap = await joinedPlayersRef.orderBy('time', 'desc').get();

    if (joinedPlayersSnap.size > 1) {
        dbPromises.push(db.collection('game').doc('game_status').set({value: 'Ready to start'}));
    }

    if (joinedPlayersSnap.size === 5) {
        dbPromises.push(db.collection('game').doc('game_status').set({value: 'Starting'}));
        dbPromises.push(
            joinedPlayersRef.doc(joinedPlayersSnap.docs[0].ref).update(
                {
                    take_action: 'Deal',
                    take_action_data: {},
                    take_action_time: admin.firestore.FieldValue.serverTimestamp()
                }
            )
        );
    }

    dbPromises.push(createNotification(notification));

    return Promise.all(dbPromises);
});

exports.userLeaved = functions.firestore.document('joined-players/{joinedPlayerId}').onDelete(async (doc) => {
    const joinedPlayer = doc.data();
    const notification = {
        content: `${joinedPlayer.nickname} left the game`,
        player: joinedPlayer.nickname,
        time: admin.firestore.FieldValue.serverTimestamp()
    };

    const dbPromises = [];
    const joinedPlayersSnap = await db.collection('joined-players').get();

    if (joinedPlayersSnap.size < 2) {
        dbPromises.push(resetGame());
    }


    dbPromises.push(createNotification(notification));

    return Promise.all(dbPromises);
});

exports.joinGame = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    const joinedPlayersRef = db.collection('joined-players');

    const joinedPlayersSnapshot = await joinedPlayersRef.get();

    if (joinedPlayersSnapshot.size > 4) {
        throw new functions.https.HttpsError('failed-precondition', 'Maximum 5 players already joined the game.');
    }


    return db.collection('joined-players').doc(context.auth.uid).get().then((joinedPlayer) => {
        if (joinedPlayer.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'You have already joined the game');
        } else {
            return db.collection('players').doc(context.auth.uid).get().then((doc) => {
                if (!doc.exists) {
                    throw new functions.https.HttpsError('failed-precondition', 'Invalid user');
                }

                let player = doc.data();

                db.collection('joined-players').doc(context.auth.uid).set({
                    nickname: player.nickname,
                    points: 0,
                    time: admin.firestore.FieldValue.serverTimestamp()
                });

                db.collection('players').doc(doc.id).set({
                    ...player,
                    status: 'In Game'
                });

                console.log('join game called by ', context.auth.uid);

                return player;
            }).catch((error) => {
                throw new functions.https.HttpsError('unknown', error.message, error);
            });
        }
    }).catch((error) => {
        throw new functions.https.HttpsError('unknown', error.message, error);
    });
});

exports.leaveGame = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    return db.collection('joined-players').doc(context.auth.uid).get().then((joinedPlayerDoc) => {
        if (!joinedPlayerDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'You have not joined the game yet');
        } else {
            let player = joinedPlayerDoc.data();

            db.collection('joined-players').doc(context.auth.uid).delete();

            db.collection('players').doc(joinedPlayerDoc.id).set({
                ...player,
                status: 'Idle'
            });
        }
    }).catch((error) => {
        throw new functions.https.HttpsError('unknown', error.message, error);
    });
});

exports.dealCards = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
    }

    let joinedPlayers = db.collection('joined-players');
    const cardsToDeal = data.cards;
    let dbPromises = [];

    const querySnapshot = await joinedPlayers.get();

    querySnapshot.forEach((doc) => {
        let player = doc.data();
        dbPromises.push(joinedPlayers.doc(doc.id).set({
            ...player,
            cards: cardsToDeal.splice(0, 10)
        }));
    });

    dbPromises.push(db.collection('game').doc('game_status').set({value: 'In progress'}));
    dbPromises.push(db.collection('game').doc('played_rounds').set({value: 0}));
    dbPromises.push(db.collection('game').doc('active_user').set({value: context.auth.uid}));

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

    //collection refs
    const joinedPlayersRef = db.collection('joined-players');
    const gameRef = db.collection('game');
    const playedCardsRef = db.collection('played-cards');
    const gameHistoryRef = db.collection('game-history');

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

        console.log('promise call completed');

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
            let highestValuedCard = {
                value: '0'
            };

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