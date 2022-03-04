$(document).ready(function(){
    const base_url = "https://word-games-data.szabgab.com/";
    let config = {
        "language": "en"
    }
    let games = {}
    let game_data = {};
    $('.page').hide();
    $('#mainPage').show();
 
    let keyboards = {
        "en": [
            "qwertyuiop",
            "  asdfghjkl",
            "    zxcvbnm"
        ],
        "he": [
            "קראטוןםפ",
            "  שדגכעיחלךף",
            "    זסבהנמצתץ"
        ],
        "hu": [
            "í         öüó",
            "  qwertyuiopőú",
            "    asdfghjkléáű",
            "      zxcvbnm"

        ]
    }

    const loadSiteConfig = function() {
        $.getJSON(base_url + "games.json", function(data){
            games = data;
            // console.log(games);
            loadGame("hangman", games[config["language"]]["file"])
        }).fail(function(){
            console.log("An error has occurred.");
        });    
    };

    const loadGame = function(game, filename) {
        const url = base_url + game + "/" + filename;
        $.getJSON(url, function(data){
            game_data = data;
            console.log(game_data);
            //$("#output").html("Loaded");
        }).fail(function(){
            //$("#output").html('Error');
            console.log("An error has occurred.");
        });
    };

    const start_game = function() {
        console.log("start_game");
        $('.page').hide();
        $('#gamePage').show();
        //console.log(game_data);
        let categories = Object.keys(game_data);
        let category_index = Math.floor(Math.random() * categories.length);
        let category = categories[category_index];
        // console.log(category);
        let words = game_data[category];
        let word_index = Math.floor(Math.random() * words.length);
        let word = words[word_index];
        console.log(word);
        $("#category").html(category);

        let html = "";
        for (let ix = 0; ix < word.length; ix++) {
            html += `<button class="button letter" id="button_${ix}"></button>`;
        }
        // console.log(html);
        $("#word").html(html);
        let keyboard_id = "hu";
        let keyboard = keyboards[keyboard_id];
        let letters = keyboard.join("");
        letters = letters.replace(/\s/g, "");
        // console.log(letters);
        let used_letters = [];

        $( "html" ).keypress(function(event) {
            // console.log( event.which );
            // console.log( "á".charCodeAt());
            // console.log( "á".codePointAt());
            let char = String.fromCharCode(event.which);
            if (letters.includes(char)) {
                // console.log(char);
                if (used_letters.includes(char)) {
                    return;
                }
                // console.log(`checking ${char}`);
                if (word.includes(char)) {
                    let ix = -1
                    while (true) {
                        ix = word.indexOf(char, ix+1)
                        // console.log(ix);
                        if (ix == -1) {
                            break
                        }
                        $(`#button_${ix}`).html(char);
                    }
                }
                // if not in the word add bad letters list
                used_letters.push(char);
            }
        });
        // TODO: When the user first loads the page we set the default language and default game
        // TODO: allow the user to switch language
        // TODO: allow the user to switch game (available for the given language)
        // TODO: when all the word was matched, the user wins
        // TODO: if the user runs out of money, the game is over
    };
 
    const stop_game = function() {
        $('.page').hide();
        $('#mainPage').show();
        $( "html" ).off("keypress");
    };


    const show_config = function() {
        $('.page').hide();

        let language_options = "";
        let languages = Object.keys(games);
        for (let ix=0; ix < languages.length; ix++) {
            let language_id = languages[ix];
            language_options += `<option value="${language_id}" `;
            language_options += (language_id == config["language"] ? "selected" : "");
            language_options += `>${games[language_id]["name"]}</option>`;
        }
        // console.log(language_options);
        $("#language_selector").html(language_options);

        $('#configPage').show();
    };

    const save_config = function() {
        const language_id = $("#language_selector option:selected").val();
        // console.log(language_id);
        config["language"] = language_id;
        save_local_config();
        $('.page').hide();
        $('#mainPage').show(); 
    };

    const load_local_config = function() {
        let config_str = localStorage.getItem('word_games');
        if (config_str !== null) {
            config = JSON.parse(config_str);
        }
    };

    const save_local_config = function() {
        localStorage.setItem('word_games', JSON.stringify(config));
    };


    load_local_config();
    loadSiteConfig();
    $('#start_game').click(start_game);
    $('#stop_game').click(stop_game);
    $('#show_config').click(show_config);
    $('#save_config').click(save_config);
});