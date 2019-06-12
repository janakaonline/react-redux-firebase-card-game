export const WaitingForPlayers = 'Waiting for players';
export const ReadyToStart = 'Ready to start';
export const Starting = 'Starting';
export const CardPlaying = 'Card Playing';
export const Started = 'Started';
export const Busy = 'Busy';
export const Dealing = 'Dealing';
export const Playing = 'Playing';
export const InProgress = 'In progress';
export const Finished = 'Finished';

export const isReadyToStart = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === ReadyToStart
};

export const isWaitingForPlayers = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === WaitingForPlayers
};

export const isCardPlaying = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === CardPlaying
};

export const isGameStarting = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === Starting
};

export const isFinished = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === Finished
};

export const isGameInProgress = (props) => {
    const {gameStatus} = props;
    return gameStatus && gameStatus.value === InProgress
};