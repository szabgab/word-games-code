$(document).ready(function(){
    const base_url = "https://word-games-data.szabgab.com/";
    let config = {
        "language": "en"
    }
    let games = {}
    let game_data = {};
    let keyboard_status = [];
    let keyboard_id = "hu";

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

    const load_site_config = function() {
        $.getJSON(base_url + "games.json", function(data){
            games = data;
            // console.log(games);
            load_game("hangman", games[config["language"]]["file"])
        }).fail(function(){
            console.log("An error has occurred.");
        });    
    };

    const load_game = function(game, filename) {
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

    const generate_word = function() {
        let categories = Object.keys(game_data);
        let category_index = Math.floor(Math.random() * categories.length);
        let category = categories[category_index];
        // console.log(category);
        let words = game_data[category];
        let word_index = Math.floor(Math.random() * words.length);
        let word = words[word_index];
        console.log(word);
        return [category, word.split("")];
    }

    const start_game = function() {
        console.log("start_game");
        keyboard_status = [];
        $('.page').hide();
        $('#gamePage').show();
        $('#message').html("")


        const button_pressed = function(event){
            let char = this.innerHTML;
            handle_char(char);
        }
    
       const keyboard_pressed = function(event) {
           // console.log( event.which );
           // console.log( "á".charCodeAt());
           // console.log( "á".codePointAt());
           let char = String.fromCharCode(event.which);
           handle_char(char);
       };
    
       const handle_char = function(char) {
            console.log(`pressed: '${char}'`);
            if (! letters.includes(char)) {
                console.log(`An invalid key ${char} was pressed`)
            }

            // console.log(char);
            if (used_letters.includes(char)) {
                // TODO: shall we give some feedback when someone presses a key that is disabled on the virtual keyboard?
                console.log(`Character ${char} was already used.`)
                return;
            }
            // console.log(`checking ${char}`);
            if (expected_letters.includes(char)) {
                let ix = -1
                while (true) {
                    ix = expected_letters.indexOf(char, ix+1)
                    // console.log(ix);
                    if (ix == -1) {
                        break
                    }
                    $(`#button_${ix}`).html(char);
                    matched_letters[ix] = char;
                    keyboard_status[char] = 'matched';
                }
                if (JSON.stringify(expected_letters)==JSON.stringify(matched_letters)) {
                    $('#message').html("Matched!");
                    // TODO show the "Next" button
                    // TODO show the "Home" button
                    // TODO hide the "Quit" button
                    // TODO disabled the whole keyboard?
                }
            } else {
                // TODO: if not in the word add bad letters list
                keyboard_status[char] = 'wrong';
            }
            used_letters.push(char);
            setup_keyboard();
        };
    
        const setup_keyboard = function() {
            console.log('setup_keyboard');
            let keyboard = keyboards[keyboard_id];
    
            let html = "";
            for (let ix = 0; ix < keyboard.length; ix++) {
                html += `<div class="keyboard row">`;
                let row = keyboard[ix];
                for (let jx = 0; jx < row.length; jx++) {
                    const char = keyboard[ix][jx]
                    // console.log(row[j]);
                    if (keyboard[ix][jx] == " ") {
                        html += '<span>&nbsp</span>';
                    } else {
                        let disabled = "false";
                        let status = "";
                        if (keyboard_status[char] == "matched") {
                            status = "is-success";
                            disabled = "disabled";
                        }
                        if (keyboard_status[char] == "wrong") {
                            status = "is-danger";
                            disabled = "disabled";
                        }
                        // console.log(disabled);
                        html += `<button class="button key ${status}" ${disabled}>${char}</button>`;
                    }
                }
                html += "</div>\n";
            }
            // console.log(html);
            $("#keyboard").html(html);
            $(".key").click(button_pressed);
        };
    
        //console.log(game_data);
        let [category, expected_letters] = generate_word();
        let matched_letters = [];
        // console.log(category);
        // console.log(expected_letters);

        $("#category").html(category);

        let html = "";
        for (let ix = 0; ix < expected_letters.length; ix++) {
            matched_letters.push("")
            html += `<button class="button letter" id="button_${ix}"></button>`;
        }
        // console.log(html);
        $("#word").html(html);
        let keyboard = keyboards[keyboard_id];
        setup_keyboard();
        let letters = keyboard.join("");
        letters = letters.replace(/\s/g, "");
        // console.log(letters);
        let used_letters = [];
    
        $( "html" ).keypress(keyboard_pressed);
        // TODO: Currently when the user first loads the page we set the default language and default game. In the future we'll probably want to first show a banner, then show the list of languages (e.g. the word "welcome" in each language) and let the user select. Then we can let them also pick the game.
        // TODO: allow the user to switch game (available for the given language)

        // TODO: Add about modal page showing the version numer or released date and other information about the project.
        // TODO: If there are non-letters in the text, show them as they are
        // TODO: Show which letters were already used
        // TODO: when all the word was matched, the user wins
        // TODO: if the user runs out of money, the game is over
        // TODO: the gear icon does not show properly on mobile
        // TODO: recognize when the data is not available (yet) or if there was a network error and let the user know.
        // TODO: Allow the user to mark specific games and languages to be available off line. Then download them and keep them in separate variables or even in the local storage so we can switch to that language game while offline as well
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

    const cancel_config = function() {
        $('.page').hide();
        $('#mainPage').show(); 
    }

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
    load_site_config();
    $('#start_game').click(start_game);
    $('#stop_game').click(stop_game);
    $('#show_config').click(show_config);
    $('#save_config').click(save_config);
    $('#cancel_config').click(cancel_config);
});