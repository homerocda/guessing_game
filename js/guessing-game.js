/**
 * Notification Animation Constants
 */
const ANIMATION_TIME_MS = 800;
const FONT_INCREASE_FACTOR = 4;
const BASE_FONT_SIZE = 2;
const MESSAGES = {
    HIGHER : {
        color: '#ff3333',
        text: 'HIGHER!'
    },
    LOWER : {
        color: '#3333ff',
        text: 'LOWER!'
    },
    CORRECT : {
        color: '#33aa33',
        text: 'CORRECT!'
    }
};

/**
 * Keyboard Constants, used to process input.
 */
const KEYS = {
    DELETE: 127,
    BACKSPACE: 8,
    ENTER: 13,
    ZERO: 48,
    NINE: 57
};

/**
 * Sound constants.
 */
const BACKGROUND_MUSIC = 'sfx/background.mp3';
const BACKGROUND_MUSIC_VOLUME = 0.4;
const SOUND_FX = {
    MISSED: 'sfx/try.wav',
    CORRECT: 'sfx/right.wav',
    GAME_OVER: 'sfx/game-over.wav',
    HIGH_SCORE: 'sfx/high-score.wav'
};

/**
 * Hourglass Constants
 */
const HOURGLASS = {
    TIMEOUT_MS: 30000,
    WARNING_PCT: 30,
    WARNING_COLOR: '#FD7777',
    REGULAR_COLOR: '#7777FD'
};

/**
 * Game constants
 */
const NEXT_LEVEL_POINTS = 10;
const ONE_SECOND = 1000;
const LOWER_BOUND = 1;
const HIGHER_BOUND = 100;

/**
 * UI Controls
 */
var notificationBox = document.getElementById('notificationBox');
var lastGuess = document.getElementById('lastGuess');
var userGuess = document.getElementById('userGuess');
var gameOverNumber = document.getElementById('gameOverNumber');
var gameOverScore = document.getElementById('gameOverScore');
var gameOverDialog = document.getElementById('gameOverDialog');
var playAgainButton = document.getElementById('playAgain');
var scoreDisplay = document.getElementById('scoreDisplay');

/**
 * Game variables
 */
var userScore = 0;
var chosenNumber = 0;

/**
 * Audio tracks
 */
var bgMusic = new Audio(BACKGROUND_MUSIC);
var sndFx = new Audio();

// The welcome dialog shows instructions on how to play. It should
// be the first thing shown to the player when he opens the page.
showWelcomeDialog();

function showWelcomeDialog() {
    $('#time').text(HOURGLASS.TIMEOUT_MS / ONE_SECOND);
    $('#lowerBound').text(LOWER_BOUND);
    $('#higherBound').text(HIGHER_BOUND);
    $('#basePoint').text(NEXT_LEVEL_POINTS);
    $('#welcomeDialog').modal('show');
    $('#welcomeDialog').on('hidden.bs.modal', () => $('#welcomeDialog').modal('dispose'));
    $('#welcomePlay').on('click', () => {
        $('#welcomeDialog').modal('hide');
        startGame();
    });
}

function selectNumber() {
    // Randomly select a number between the lower and higher bounds
    let totalValues = HIGHER_BOUND - LOWER_BOUND + 1;
    return Math.floor(Math.random() * totalValues) + LOWER_BOUND;
}

function startGame() {
    // Bind the keyboard listener to check guesses when the user press Enter
    userGuess.onkeydown = (event) => actOnKey(event, KEYS.ENTER, () => checkGuess(userGuess.value));
    startHourglass();
    startSounds();
    chosenNumber = selectNumber();
    $('#gameOverDialog').modal('hide');
    playAgainButton.onclick = startGame;
    userGuess.disabled = false;
    userGuess.value = '';
    lastGuess.innerHTML = '0';
    userScore = 0;
    updateScore();
    // Set the user focus to the guessing text box.
    userGuess.focus();
}

function endGame() {
    // Stop the music and display the Game Over dialog.
    userGuess.disabled = true;
    bgMusic.pause();

    gameOverScore.innerText = userScore;
    gameOverNumber.innerText = chosenNumber;
    $('#gameOverDialog').modal('show');
    playSound(SOUND_FX.GAME_OVER);
}

function startSounds() {
    // Start the background music and prepare the sound effects track
    sndFx.loop = false;
    bgMusic.loop = true;
    bgMusic.volume = BACKGROUND_MUSIC_VOLUME;
    bgMusic.fastSeek(0);
    bgMusic.play();
}

function playSound(selectedSound) {
    // Play a specific sound effect
    sndFx.src = selectedSound;
    sndFx.play();
}

function startHourglass() {
    // starts the hourglass animation. We are using jQuery for this.
    let hourglass = $('#hourglass');
    hourglass.css('background-color', HOURGLASS.REGULAR_COLOR);
    hourglass.stop();
    hourglass.width('100%');
    hourglass.animate({
        width : '0%'
    }, {
        duration: HOURGLASS.TIMEOUT_MS,
        easing: 'linear',
        step: function(now, fx) {
            if (now < HOURGLASS.WARNING_PCT) {
                this.style.backgroundColor = HOURGLASS.WARNING_COLOR;
            }
        },
        complete: endGame
    });
}

function startAnimation(el, message) {
    // Start the notification animation. This is done in pure HTML.
    el.innerHTML = message.text;
    el.style.color = message.color;

    // Clear any timeouts left from the last animation.
    clearTimeout(el.timeoutId);
    el.style.transition = `opacity ${ANIMATION_TIME_MS}ms, font-size ${ANIMATION_TIME_MS}ms`;
    el.style.opacity = 0;
    let originalSize = parseInt(el.style.fontSize);
    originalSize = isNaN(originalSize) ? BASE_FONT_SIZE : originalSize;
    el.style.fontSize = `${originalSize * FONT_INCREASE_FACTOR}em`;
    el.style.visibility = 'visible';
    // Set the timeout to clear the animation element after the animation is done
    el.timeoutId = setTimeout(clearAnimation, ANIMATION_TIME_MS, el);
    return true;
}

function clearAnimation(el) {
    // Hides the notification box after the animation is complete
    el.style.transition = '';
    el.style.visibility = 'hidden';
    el.style.opacity = 1;
    el.style.fontSize = '2em';
}

function actOnKey(event, key, func) {
    let iKey = event.which || event.keyCode;
    if (iKey == key) {
        return func();
    } else if (iKey == KEYS.DELETE || iKey == KEYS.BACKSPACE) {
        return true;
    } else if (iKey < KEYS.ZERO || iKey > KEYS.NINE) {
        return false;
    }
    return true;
}

function rightGuess() {
    // If the user guessed the number, notify him
    // update the score and restart the hourglass
    startAnimation(notificationBox, MESSAGES.CORRECT);
    playSound(SOUND_FX.CORRECT);
    userScore += NEXT_LEVEL_POINTS;
    updateScore();
    chosenNumber = selectNumber();
    startHourglass();
}

function wrongGuess(direction) {
    // If he guessed wrong, notify in the correct direction
    startAnimation(notificationBox, MESSAGES[direction]);
    playSound(SOUND_FX.MISSED);
}

function updateScore() {
    // Updates the score display
    scoreDisplay.innerHTML = userScore;
}

function checkGuess(guess) {
    // Verify a user guess
    if (guess.length == 0) {
        return;
    }
    if (guess == chosenNumber) {
        rightGuess();
    } else {
        wrongGuess(guess < chosenNumber ? 'HIGHER' : 'LOWER');
    }
    // Clear the box so he can try again
    userGuess.value = '';
    lastGuess.innerHTML = guess;
}