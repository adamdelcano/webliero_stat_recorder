var gameStats = [];
var gameHashesRecorded = [];

function parse_game_stats(){
    let game = {};
    let scoreboard = document.getElementsByClassName("scoreboard-view")[0];
    let level_row = scoreboard.children[0];
    game['game_type'] = level_row.children[1].children[0].textContent;
    game['level_name'] = level_row.children[0].children[0].textContent;
    game['scores'] = [];
    let winning_score = 0;
    let has_nonzero_score = false;
    let is_team_game = (game.game_type == "Team Deathmatch");
    let teams = [[], []];
    let team_scores = [];
    scoreboard.children[1].childNodes.forEach(function(stat_row, i){
        stat_row.childNodes.forEach(function(stats, j){
            /* this is the team name row, ignore if not a team game */
            if (j == 0 && is_team_game){
                let team_name;
                let team_score;
                /* Name/score locations vary between the team rows */
                if( i == 0 ){
                    team_name = stats.children[0].children[0].children[0].textContent;
                    team_score = stats.children[0].children[0].children[1].textContent;
                } else {
                    team_name = stats.children[0].children[0].childNodes[0].textContent.trimEnd();
                    team_score = stats.children[0].children[0].children[0].textContent;
                };
                teams[i].push(team_name);
                team_scores.push(team_score);
            };
            /* player rows */
            if(j >= 1){
                let name = stats.children[0].children[1].textContent;
                let score = stats.children[1].textContent;
                let kills = stats.children[2].textContent;
                let deaths = stats.children[3].textContent;
                if(score != 0){
                    has_nonzero_score = true;
                }
                if(score != ""){
                    if (is_team_game) {
                        teams[i].push(name);
                        name = '[' + teams[i][0] + ']' + name;
                    } else {
                        /* if not team game check for winner */
                        if(j == 1){
                            game['winner'] = name;
                            winning_score = score;
                        } else if(j > 1 && score == winning_score){
                            game['winner'] = game['winner'] + " - TIE - " + name;
                        }
                    };
                    game['scores'].push({name, score, kills, deaths});
                }
            }
        });
    });
    /* In team games, determine winner by highest team score */
    if (is_team_game) {
        let winning_team;
        if (team_scores[0] > team_scores[1]){
            winning_team = teams[0];
        } else if (team_scores[0] < team_scores[1]) {
            winning_team = teams[1];
        } else if (team_scores[0] == team_scores[1]) {
            winning_team = teams[0].concat(["- TIE -"], teams[1]);
        };
        /* Team name formatting */
        game["winner"] = winning_team.reduce(
                function(prev, curr){return prev + ' ' + curr},
                /* no initial state but here's where it would go */
        );
    };
    let gameHash = JSON.stringify(game);
    if(gameHashesRecorded.indexOf(gameHash) == -1 && game.scores.length > 1 && has_nonzero_score) {
        console.log("Pushing new game to our array.");
        gameHashesRecorded.push(gameHash);
        gameStats.push(game);
    }
};

function compile_game_stats() {
    let gamestr = format_games_string(gameStats);
    let winners = calculate_winners(gameStats);
    let slackstr = format_slack_string(gameStats.length, winners, gamestr);
    send_slack_message(slackstr);
    return "Check slack if your games have saved! If not run 'compile_game_stats()' in your console.";
};

function format_games_string(stats) {
    /* assume no score/kills/deaths > 9999 */
    let gamestr = "";
    let margin = 2;
    let longest_name_length = stats.flatMap(
        (game) => game.scores.map((score) => score.name)
    ).reduce((acc, b) => Math.max(acc, b.length, 0), 0);
    stats.forEach(function(game) {
        gamestr += game.level_name + " - " + game.game_type + "\n";
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
};

function spaces(number) {
    if (number < -1) {
        number = -1;
    }
    return new Array(number + 1).join(" ");
};

function right_align(header_name, data) {
    return spaces(header_name.length - data.length) + data;
};

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
};

function format_slack_string(num_games, winners, gamestr) {
    let slackstr = "```\n";
    slackstr += "Total games: " + num_games + "\nWinners:\n";
    for (player_name in winners) {
        slackstr += "\t" + player_name + "\t" + winners[player_name] + "\n";
    };
    slackstr += "\n" + gamestr + "\n```";
    return slackstr;
};

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
    };
    fetch(
        /* TARGET URL GOES HERE FORMATTED AS STRING
         "https://example.foo/bar" */
        {
            method: "POST",
            body: JSON.stringify(payload)
        }
    );
};

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
];

/* console.log(format_games_string(testGameStats)); */

function createButton(label, handler) {
    var button = document.createElement("button");
    button.innerHTML = label;
    button.onclick = handler;
    button.style = "display: inline-block; font-size: 24px; padding: 20px; background-color: yellow;";
    return button;
};

function createButtonArray(buttons) {
    let div = document.createElement("div");
    div.style = "position: fixed; bottom: 0; right: 0; z-index: 999;";
    for (var label in buttons) {
        div.appendChild(createButton(label, buttons[label]))
    };
    return div;
};

let buttonDiv = createButtonArray({
    debug: function() {
        console.log("gameStats", gameStats);
        console.log("gameHashesRecorded", gameHashesRecorded);
        let gamestr = format_games_string(gameStats);
        let winners = calculate_winners(gameStats);
        let slackstr = format_slack_string(gameStats.length, winners, gamestr);
        console.log("gamestr", gamestr);
        console.log("winners", winners);
        console.log("slackstr", slackstr);
    },
    "send it": compile_game_stats
});

document.body.appendChild(buttonDiv);
window.onbeforeunload = compile_game_stats;
setInterval(parse_game_stats, 5000);
