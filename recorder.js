let gameStats = [];
let gameHashesRecorded = [];


function parse_game_stats(){
    let game = {};
    let scoreboard = document.getElementsByClassName("scoreboard-view")[0];
    let level_row = scoreboard.children[0];
    game['game_type'] = level_row.children[1].children[0].textContent;
    game['level_name'] = level_row.children[0].children[0].textContent;
    game['scores'] = [];
    let winning_score = 0;
    let has_nonzero_score = false;
    scoreboard.children[1].childNodes.forEach(function(stat_row, i){
        stat_row.childNodes.forEach(function(stats, j){
            if(j >= 1){
                let name = stats.children[0].children[1].textContent;
                let score = stats.children[1].textContent;
                let kills = stats.children[2].textContent;
                let deaths = stats.children[3].textContent;

                if(score != 0){
                    has_nonzero_score = true;
                }
                if(score != ""){
                    game['scores'].push({name, score, kills, deaths});
                    if(j == 1){
                        game['winner'] = name;
                        winning_score = score;
                    }
                    if(j > 1 && score == winning_score){
                        game['winner'] = game['winner'] + " - TIE - " + name;
                    }
                }
            }
        });
    });
    let gameHash = JSON.stringify(game);
    if(gameHashesRecorded.indexOf(gameHash) == -1 && game.scores.length > 1 && has_nonzero_score) {
        console.log("Pushing new game to our array.");
        gameHashesRecorded.push(gameHash);
        gameStats.push(game);
    }
}

function compile_game_stats() {
    let gamestr = format_games_string(gameStats);
    let winners = calculate_winners(gameStats);
    let playerstr = format_playerstr(calculate_player_stats(gameStats));
    let slackstr = format_slack_string(gameStats.length, winners, gamestr, playerstr);
    send_slack_message(slackstr);
    return "Check slack if your games have saved! If not run 'compile_game_stats()' in your console.";
}


function format_games_string(stats) {
    // assume no score/kills/deaths > 9999
    let gamestr = ""
    let margin = 2;
    let longest_name_length = stats.flatMap(
        (game) => game.scores.map((score) => score.name)
    ).reduce((acc, b) => Math.max(acc, b.length, 0), 0);
    stats.forEach(function(game) {
        gamestr += game.level_name + " - " + game.game_type + "\n"
        gamestr += "Name" + spaces(longest_name_length - 4 + margin) + "score  kills  deaths\n";
        game.scores.forEach(function(score) {
            gamestr += score.name 
                + spaces(longest_name_length - score.name.length + margin) 
                + right_align("score", score.score)
                + spaces(margin) 
                + right_align("kills", score.kills)
                + spaces(margin) 
                + right_align("deaths", score.deaths) 
                + "\n";
        });
        gamestr += "\n";

    });
    return gamestr;
}

function spaces(number) {
    if (number < -1) {
        number = -1;
    }
    return new Array(number + 1).join(" ");
}

function right_align(header_name, data) {
    return spaces(header_name.length - data.length) + data;
}

function calculate_winners(stats) {
    let winners = {};
    stats.forEach(function(game) {
        if(game.winner in winners){
            winners[game.winner]++;
        }else{
            winners[game.winner] = 1;
        }
    });
    return winners;
}

function score_update(currentScore, newScore) {
    return currentScore.map((value, index) => parseInt(value) += parseInt(newScore[index]))
};

function calculate_player_stats(stats) {
    let players = new Map();
    stats.forEach((game) => {
        game.scores.forEach(
            ({name, score, kills, deaths}) => {
                if (players.has(name)) {
                    players.set(name, score_update(players.get(name), [score, kills, deaths]))
                }
                else {
                    players.set(name, [score, kills, deaths])
                }
            }
        )
    }
    )
    return players
};

function format_playerstr(players) {
    playerstr = "";
    // assume no score/kills/deaths > 9999
    let margin = 2;
    let longest_name_length = players.keys().reduce((acc, b) => Math.max(acc, b.length, 0), 0);
    playerstr += "Name" + spaces(longest_name_length - 4 + margin) + "score  kills  deaths\n";
    players.forEach(
        (value, key, map) => {
            playerstr += key
            + spaces(longest_name_length - key.length + margin)
            + right_align("score", value[0].toString())
            + spaces(margin) 
            + right_align("kills", value[1].toString())
            + spaces(margin) 
            + right_align("deaths", value[2].toString()) 
            + "\n";

    });
    playerstr += '\n'
    return playerstr
};

function format_slack_string(num_games, winners, gamestr, playerstr) {
    let slackstr = "```\n"
    slackstr += "Total games: " + num_games + "\nWinners:\n";
    for (player_name in winners) {
        slackstr += "\t" + player_name + "\t" + winners[player_name] + "\n";
    }
    slackstr += "\n" + gamestr + "\n";
    slackstr += "Player Totals Across All Games:\n";
    slackstr += playerstr + "\n```";
    return slackstr;
}

/* 
 * Change the channel, username and target URLs in the following block
 * to match your desired slack channel/user/etc
 */

function send_slack_message(message) {
    let payload = {
        channel: "example_channel",
        username: "example_user",
        text: message,
        icon_emoji: ":feelsgood:"
    }
    fetch(
        // TARGET URL GOES HERE FORMATTED AS STRING
        // "https://example.foo/bar"
        {
            method: "POST",
            body: JSON.stringify(payload)
        }
    );
}

testGameStats = [
    {
        "game_type": "Deathmatch",
        "level_name": "Random Dirt",
        "scores": [
            {
                "name": "[FeDonkey]Morgoth",
                "score": "7",
                "kills": "7",
                "deaths": "6"
            },
            {
                "name": "[FeDonkey] deadbeef",
                "score": "3",
                "kills": "6",
                "deaths": "10"
            },
        ],
        "winner": "[FeDonkey]Morgoth"
    }
]
//console.log(format_games_string(testGameStats));

function createButton(label, handler) {
    var button = document.createElement("button");
    button.innerHTML = label;
    button.onclick = handler;
    button.style = "display: inline-block; font-size: 24px; padding: 20px; background-color: yellow;"
    return button;
}

function createButtonArray(buttons) {
    let div = document.createElement("div");
    div.style = "position: fixed; bottom: 0; right: 0; z-index: 999;"
    for (var label in buttons) {
        div.appendChild(createButton(label, buttons[label]))
    }
    return div;
}

let buttonDiv = createButtonArray({
    debug: function() {
        console.log("gameStats", gameStats);
        console.log("gameHashesRecorded", gameHashesRecorded);
        let gamestr = format_games_string(gameStats);
        let winners = calculate_winners(gameStats);
        let playerstr = format_playerstr(calculate_player_stats(gameStats));
        let slackstr = format_slack_string(gameStats.length, winners, gamestr, playerstr);
        console.log("gamestr", gamestr);
        console.log("winners", winners);
        console.log("slackstr", slackstr);
        console.log('playerstr', playerstr);
    },
    "send it": compile_game_stats
});

document.body.appendChild(buttonDiv);
window.onbeforeunload = compile_game_stats;
setInterval(parse_game_stats, 5000);
