$(document).ready(function(){
    const base_url = "https://word-games-data.szabgab.com/";
    let config = {
        "language_id": "en",
        "game_id": "hangman"
    };
    let site_config = {};
    let game_data = {};
    let keyboard_status = {};
    let keyboard_letters = [];
    let used_letters = [];
    let expected_letters = [];
    let matched_letters = [];

    $('.page').hide();
    $('#mainPage').show();
 
    let keyboards = {
        "en": [
            "qwertyuiop",
            "  asdfghjkl",
            "    zxcvbnm"
        ],
        "ladino": [
            "  ertyuiop",
            "  asdfghjkl",
            "    z cvbnm"
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
            site_config = data;
            console.log("site_config:", site_config);
            load_game("hangman", site_config[config["language_id"]]["file"])
        }).fail(function(){
            console.log("An error has occurred.");
        });    
    };

    const load_game = function(game, filename) {
        const url = base_url + game + "/" + filename;
        $.getJSON(url, function(data){
            game_data = data;
            console.log("game_data:", game_data);
            //$("#output").html("Loaded");
            setup_game();
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

    const setup_game = function() {
        console.log("setup_game");

        const keyboard_id = site_config[config["language_id"]]["keyboard_id"]
        let keyboard = keyboards[keyboard_id];
        let keyboard_letters_str = keyboard.join("");
        keyboard_letters_str = keyboard_letters_str.replace(/\s/g, "");
        keyboard_letters = keyboard_letters_str.split("");

    };

    const updated_keyboard = function() {
        console.log("update_keyboard");
        const language_id = config["language_id"];
        // console.log("language_id:", language_id);
        const keyboard_id = site_config[language_id]["keyboard_id"];
        let keyboard = keyboards[keyboard_id];

        let html = "";
        for (let ix = 0; ix < keyboard.length; ix++) {
            html += `<div class="keyboard row">`;
            let row = keyboard[ix];
            for (let jx = 0; jx < row.length; jx++) {
                const char = keyboard[ix][jx]
                // console.log(char, keyboard_status[char]);
                if (keyboard[ix][jx] == " ") {
                    html += '<span>&nbsp</span>';
                } else {
                    let disabled = "";
                    let status = "";
                    if (keyboard_status[char] == "matched") {
                        status = "is-success";
                        disabled = "disabled";
                    }
                    if (keyboard_status[char] == "wrong") {
                        status = "is-danger";
                        disabled = "disabled";
                    }
                    if (keyboard_status[char] == "disabled") {
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
        if (! keyboard_letters.includes(char)) {
            console.log(`An invalid key ${char} was pressed`)
        }

        // console.log(char);
        if (used_letters.includes(char)) {
            // console.log(`Character ${char} was already used.`)
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
                disable_the_whole_keyboard();
                $("#next_game").show();
                $("#stop_game").hide();
                $("#hint").hide();
            }
        } else {
            keyboard_status[char] = 'wrong';
        }
        used_letters.push(char);
        updated_keyboard();
    };

    const disable_the_whole_keyboard = function() {
        console.log('disable_the_whole_keyboard');
        keyboard_letters.forEach(function (char){
            // console.log(char);
            if (!(char in keyboard_status)) {
                // console.log("in", char);
                keyboard_status[char] = "disabled"; 
            }
        });
    };

    const hint = function() {
        console.log('hint');
        // find the first letter which is not know yet and display it (pretend the user clicked it)
        for (let ix = 0; ix < expected_letters.length; ix++) {
            if (expected_letters[ix] != matched_letters[ix]) {
                handle_char(expected_letters[ix]);
                //console.log(ix, expected_letters[ix])
                return;
            }
        }
    };

    const start_game = function() {
        console.log("start_game");

        const chars = Object.keys(keyboard_status);
        for (let ix=0; ix < chars.length; ix++) {
            delete keyboard_status[chars[ix]];
        }
        matched_letters = [];
        used_letters = [];

        $('.page').hide();
        $("#next_game").hide();
        $("#stop_game").show();
        $("#hint").show();
        $('#message').html("")
        $('#gamePage').show();
        $('#hint').click(hint);

        let category;
        [category, expected_letters] = generate_word();
        // console.log(category);
        // console.log(expected_letters);
        $("#category").html(category);

        let html = "";
        for (let ix = 0; ix < expected_letters.length; ix++) {
            matched_letters.push("")
            html += `<button class="button letter" id="button_${ix}"></button>`;
        }
        $("#word").html(html);

        updated_keyboard();

        $( "html" ).keypress(keyboard_pressed);
    };
 
    const stop_game = function() {
        $('.page').hide();
        $('#mainPage').show();
        $( "html" ).off("keypress");
    };

    const next_game = function() {
        start_game();
    };

    const show_about = function() {
        $("#about_modal").addClass('is-active');
    };

    const close_about = function() {
        console.log("close");
        $("#about_modal").removeClass('is-active');
    };

    const show_config = function() {
        $('.page').hide();

        let language_options = "";
        let languages = Object.keys(site_config);
        for (let ix=0; ix < languages.length; ix++) {
            let language_id = languages[ix];
            language_options += `<option value="${language_id}" `;
            language_options += (language_id == config["language_id"] ? "selected" : "");
            language_options += `>${site_config[language_id]["name"]}</option>`;
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
        config["language_id"] = language_id;
        load_game("hangman", site_config[language_id]["file"])
        save_local_config();
        $('.page').hide();
        $('#mainPage').show(); 
    };

    const load_local_config = function() {
        let config_str = localStorage.getItem('word_games');
        if (config_str !== null) {
            config = JSON.parse(config_str);
        }
        console.log("local_config", config);
    };

    const save_local_config = function() {
        localStorage.setItem("word_games", JSON.stringify(config));
    };

    load_local_config();
    load_site_config();
    $("#start_game").click(start_game);
    $("#stop_game").click(stop_game);
    $("#next_game").click(next_game);
    $("#show_config").click(show_config);
    $("#show_about").click(show_about);
    $("#close_about_modal").click(close_about);
    $("#save_config").click(save_config);
    $("#cancel_config").click(cancel_config);
});

// TODO: make the letters on the buttons bigget, but the buttons smaller, make sure they fit in the width of the screen

// TODO: when all the word was matched, the user wins
    // replace the stop button by quit button that will reveal the word

// TODO: recognize when the data is not available (yet) or if there was a network error and let the user know.


// TODO: Currently when the user first loads the page we set the default language and default game. In the future we'll probably want to first show a banner, then show the list of languages (e.g. the word "welcome" in each language) and let the user select. Then we can let them also pick the game.
// TODO: Add version numer or released date to the about page.
// TODO: If there are non-letters in the text, show them as they are

// TODO Introduce In-game money;
//    start by giving 100 coins to the user
//    make each guess cost 1
//    make each bad guess cost 2
//    make each hint cost 3
//    when the user finds a word give her money revard (based on the length of the word, the number of different letters, full size of the abc)
//    if the user runs out of money allow her to ask for more (or buy more)

// TODO: Allow the user to mark specific games and languages to be available off-line. Then download them and keep them in separate variables or even in the local storage so we can switch to that language game while offline as well
// TODO: Introduce levels: First level is short and simple words, the higher the level the longer the words or multiword expressions using more complex words. (e.g. in hungarian it might be more simple to have words that only use aeiou vowels and not the umlauted ones.)
// TODO: Allow people to create word sets for levels and the allow others to select "game" of someone. This could be used by teachers to prepare words based on the level of the students.

// TODO: shall we give some feedback when someone presses a key that is disabled on the virtual keyboard? This is only relevant on a computer, right?

// TODO: at the end of the game, show the translation in English where available.
// TODO: at the end of the game, show a link to the wikipedia entry of the word (if there is one)

// TODO: Indicate language and game when we load the app