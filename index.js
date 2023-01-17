var buttonColors = ["red", "blue", "green", "yellow"];
var gamePattern;
var userClickedPattern ;
var levels;
var lives;
var difficulty;
var timeTrial;
var points;
var pressButton = true;

// Easy difficulty

$("#easy").on("click", function () {
    newGame("easy", 1, 5);
});

// Medium difficulty

$("#medium").on("click", function () {
    newGame("medium", 1, 3);
});

// Hard difficulty

$("#hard").on("click", function () {
    newGame("hard", 1, 3);
});

// "Random" difficulty

$("#random").on("click", function () {
    newGame("random", 1, 3);
});

// "Survivor" difficulty

$("#survivor").on("click", function () {
    newGame("survivor", 1, 1);
});

// Time trial 1.

$("#time-1").on("click", function () {
    newGameTime("Time1", 180);
});

// Time trial 2.

$("#time-2").on("click", function () {
    newGameTime("Time2", 420);
});

$("#memory").on("click", function () {
    newMemoryGame("Memory");
});

// Start a game

function newGame(diff, level, life) {
    difficulty = diff;
    levels = level;
    lives = life;
    timeTrial = false;
    gamePattern = [];
    userClickedPattern = [];
    $(".diff-container").hide();
    $(".button-container").show();
    $("#level-title").text("Level " + levels);
    $("h2").text("Megmaradt életek: " + lives);
    nextSequence();
}

function newGameTime(diff, startingTime) {
    difficulty = diff;
    levels = 1;
    time = startingTime;
    timeTrial = true;
    gamePattern = [];
    userClickedPattern = [];
    $(".diff-container").hide();
    $(".button-container").show();
    $("#level-title").text("Level " + levels);
    if (difficulty === "Time1") {
        $("h2").text("Idő: 03:00");
    } else {
        $("h2").text("Idő: 07:00");
    }
    nextSequence();
}

function newMemoryGame(diff) {
    difficulty = diff;
    levels = 6;
    lives = 5;
    points = 0;
    timeTrial = false;
    gamePattern = [];
    userClickedPattern = [];
    $(".diff-container").hide();
    $(".button-container").show();
    $("#level-title").text("Pontszám " + points);
    $("h2").text("Megmaradt életek: " + lives);
    setTimeout(function () {
        randomSequence();
    }, 1500);
}


// Put a new element into the pattern array and show the sequence to the player

function nextSequence() {
    // Reset user clicked pattern
    userClickedPattern = [];

    // Add random color to the game pattern
    var randomNumber = Math.floor(Math.random()*4);
    var randomColor = buttonColors[randomNumber];
    gamePattern.push(randomColor);

    // Show the sequence (on easy and on medium to lvl10)
    if (difficulty === "easy" || difficulty === "survivor" || (difficulty === "medium" && levels <= 10) || difficulty === "Time1" || difficulty === "Time2") {
        showSequence(gamePattern);
    }
    
    
}

// Random sequence for random difficulty

function randomSequence() {
    gamePattern = [];
    userClickedPattern = [];
    for(var i=1; i<=levels; i++) {
        var randomNumber = Math.floor(Math.random()*4);
        var randomColor = buttonColors[randomNumber];
        gamePattern.push(randomColor);
    }
    showSequence(gamePattern);
}


// Show the full pattern

function showSequence (gamePattern) {
    notPressButton(gamePattern.length);
    for (var i = 0; i < gamePattern.length; i++) {
        currentButtonColor(i);
    }
}

function currentButtonColor (i) {
    setTimeout(function () {
        playSound(gamePattern[i]);
    }, 750*i);
}

// The player can't press any button when the sequence is shown

function notPressButton(length) {
    pressButton = false;
    setTimeout(function () {
        pressButton = true;
    }, 750*length)
}

function notPressButtonWhenError() {
    pressButton = false;
    setTimeout(function () {
        pressButton = true;
    }, 1000)
}


// Animation and sound for the clicked button

$(".btn").on("click", function () {
    if (pressButton) {
        var userChosenColor = $(this).attr("id"); // we can get the pressed button's id attribute with this
        playSound(userChosenColor);
        userClickedPattern.push(userChosenColor);
        animatePress(userChosenColor);
        checkAnswer(userClickedPattern.length-1);
    }
});


// Play the correct sound for the colored buttons

function playSound(name) {
    var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
}


// A press animation for the pressed button

function animatePress(currentColor) {
    $("." + currentColor).addClass("pressed");
    setTimeout(function () {
        $("." + currentColor).removeClass("pressed");
    }, 100)
}

// Remaining time for time trials

var timeUp = true;

var showTime = setInterval(
    function () {
        if(time > 0) {
            --time;
            timeUp = false;
        }
        minutes = time / 60;
        seconds = time % 60;
        if (minutes < 10 && seconds < 10) {
            $("h2").text("Idő: " + "0" + Math.floor(minutes) + ":0" + seconds);
        } else if (minutes < 10 && seconds >= 10) {
            $("h2").text("Idő: " + "0" + Math.floor(minutes) + ":" + seconds);
        } else if (minutes >= 10 && seconds < 10) {
            $("h2").text("Idő: " + Math.floor(minutes) + ":0" + seconds);
        } else {
            $("h2").text("Idő: " + Math.floor(minutes) + ":" + seconds);
        }

        if(time === 0 && timeUp === false) {
            gameOver();
            timeUp = true;
        }

        if(time === 0 && timeTrial === true) {
            $(".message").text("A pontszámod: " + (levels-1));
        }
    }, 1000
);

// Check, if your choose is good or wrong

function checkAnswer(currentLevel) {
    if (userClickedPattern[currentLevel] === gamePattern[currentLevel]){
        if(currentLevel === gamePattern.length-1) {
            if (difficulty === "Memory") {
                points++;
                $("#level-title").text("Pontszám " + points);
                setTimeout(randomSequence, 1000);
            } else {
                if(difficulty === "Time1") {
                    time = time + (levels*2);
                } else {
                    getLife();
                }
                newLevel();
                if(difficulty !== "random") {
                    setTimeout(nextSequence, 1000);
                } else {
                    setTimeout(randomSequence, 1000);
                }
            }
        }
    } else {
        if (difficulty === "Time1" || difficulty === "Time2" || lives > 1) {
            error();
        } else {
            gameOver();
        }
    }
}


// After returning the correct pattern, you level up

function newLevel() {
    levels++;
    $("#level-title").text("Level " + levels);
}


// Extra life - the player gets an extra life (easy: after every 5 levels, medium: every 8 levels, hard: every 10 levels)

function getLife() {
    if ((difficulty === "easy" || difficulty === "random") && (levels % 5 === 0)) {
        lives++;
        $(".message").text("Megmaradt életek: " + lives);
    } else if ((difficulty === "medium" && levels % 8 === 0)) {
        lives++;
        $(".message").text("Megmaradt életek: " + lives);
    } else if ((difficulty === "hard" && levels % 10 === 0)) {
        lives++;
        $(".message").text("Megmaradt életek: " + lives);
    }
}

// If you choose a wrong button, you lose a life

function error() {
    userClickedPattern = [];
    wrongAnswer();
    if (difficulty === "Time1" || difficulty === "Time2") {
        notPressButtonWhenError();
        setTimeout(function () {
            showSequence(gamePattern);
        }, 1000);
    } else {
        lives--;
        $("h2").text("Megmaradt életek: " + lives);
        notPressButtonWhenError();
        setTimeout(function () {
            showSequence(gamePattern);
        }, 1000);
    }
}


// The background turns red for 0.2 sec, if the player chooses a wrong answer

function wrongAnswer() {
    playSound("wrong");
    $("body").addClass("error");
    setTimeout(function () {
        $("body").removeClass("error");
    }, 200);
}


// If you lose all of your lives, your game is over

function gameOver() {
    wrongAnswer();
    $("#level-title").text("Játék vége! Szeretnél újra játszani?");
    if (difficulty === "Memory") {
        $(".message").text("A pontszámod: " + (points));
    } else {
        $(".message").text("A pontszámod: " + (levels-1));
    }
    $(".button-container").hide();
    $(".diff-container").show();
}