$(document).ready(function(){
    const base_url = "";
    let config = {};
    let site_config = {};
    let game_data = {};
    let keyboard_status = {};
    let keyboard_letters = [];
    let used_letters = [];
    let hidden_word = "";
    let expected_letters = [];
    let matched_letters = [];
    let dictionary = null;

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
        $.getJSON(`${base_url}/games.json`, function(data){
            site_config = data;
            console.log("site_config:", site_config);
            if (Object.keys(config).length === 0) {
                config["language_id"] = "";
                show_config();
            } else {
                load_game()
            }
        }).fail(function(){
            console.log("An error has occurred.");
        });    
    };

    const load_game = function() {
        const game_id = config["game_id"];
        const language_id = config["language_id"];
        const filename = site_config["games"][language_id]["file"];
        const url = `${base_url}/data/${game_id}/${filename}`;
        dictionary = null;
        $.getJSON(url, function(data){
            game_data = data;
            console.log("game_data:", game_data);
            //$("#output").html("Loaded");
            setup_game();
        }).fail(function(){
            //$("#output").html('Error');
            console.log("An error has occurred.");
        });

        if ('dictionary' in site_config["games"][language_id]) {
            const dictionary_url = site_config["games"][language_id]["dictionary"] + "/target-to-source.json";
            $.getJSON(dictionary_url, function(data){
                dictionary = data;
                console.log("dictionary loaded");
            }).fail(function(){
                console.log("Failed to load the dictionary");
            });
    
        }
    };

    const generate_word = function() {
        let categories = Object.keys(game_data);
        let category_index = Math.floor(Math.random() * categories.length);
        let category = categories[category_index];
        // console.log(category);
        let words = game_data[category];
        let word_index = Math.floor(Math.random() * words.length);
        hidden_word = words[word_index];
        console.log(hidden_word);
        return [category, hidden_word.split("")];
    }

    const setup_game = function() {
        console.log("setup_game");

        const keyboard_id = site_config["games"][config["language_id"]]["keyboard_id"]
        let keyboard = keyboards[keyboard_id];
        let keyboard_letters_str = keyboard.join("");
        keyboard_letters_str = keyboard_letters_str.replace(/\s/g, "");
        keyboard_letters = keyboard_letters_str.split("");
        let direction = "lrt";
        if ("dir" in site_config["games"][config["language_id"]]) {
            direction = site_config["games"][config["language_id"]]["dir"]
        }
        $("#keyboard").attr("dir", direction);
        $("#word").attr("dir", direction);
    };

    const updated_keyboard = function() {
        console.log("update_keyboard");
        const language_id = config["language_id"];
        // console.log("language_id:", language_id);
        const keyboard_id = site_config["games"][language_id]["keyboard_id"];
        let keyboard = keyboards[keyboard_id];

        // ABC keyboard
        let abc_keyboard = [];
        for (let ix = 0; ix < keyboard.length; ix++) {
            let row = keyboard[ix];
            for (let jx = 0; jx < row.length; jx++) {
                if (keyboard[ix][jx] != " ") {
                    abc_keyboard.push(keyboard[ix][jx]);
                }
            }
        }
        abc_keyboard.sort();
        keyboard = [abc_keyboard.join("")];

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
        $(".key").click(virtual_keyboard_pressed);
    };

    const virtual_keyboard_pressed = function(event){
        let char = this.innerHTML;
        handle_char(char);
    }

    const real_keyboard_pressed = function(event) {
        // console.log( event.which );
        // console.log( "á".charCodeAt());
        // console.log( "á".codePointAt());
        let char = String.fromCharCode(event.which);
        if (char == "?") {
            show_about();
        } else if (char == "/") {
            show_config();
        } else {
            handle_char(char);
        }
    };

    const handle_char = function(char) {
        // console.log(`pressed: '${char}'`);
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
                $("#wikipedia").attr("href", site_config["games"][config["language_id"]]["wikipedia"] + hidden_word);
                $("#wikipedia").show();
                let message = "Matched!";
                if (dictionary !== null) {
                    console.log("dictionary");
                    const dictionary_url = site_config["games"][config["language_id"]]["dictionary"];
                    if (hidden_word in dictionary){
                        //console.log(dictionary[hidden_word]);
                        dictionary[hidden_word].forEach(function(word) {
                            message += " " + word;
                        });                       
                        message += ` <a href="${dictionary_url}/target/${hidden_word}.html" target="_blank">${hidden_word}</a>`;
                    }
                }

                $('#message').html(message);
                disable_the_whole_keyboard();
                $("#next_game").show();
                $("#stop_game").hide();
                $(".show_config").show();
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
        $(".show_config").hide();
        $("#stop_game").show();
        $("#hint").show();
        $('#message').html("")
        $("#wikipedia").hide();
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

        //$( "html" ).keypress(real_keyboard_pressed);
    };
 
    const stop_game = function() {
        $('.page').hide();
        $('#mainPage').show();
        $( "html" ).off("keypress");
    };

    const next_game = function() {
        start_game();
    };

    const enable_escape = function(func){
        $( "html" ).keydown(function (event) {
            // ESC
            if (event.which == 27) {
                func();
            }
        });
    }

    const show_about = function() {
        $("#about_modal").addClass('is-active');
        enable_escape(close_about);
    };

    const close_about = function() {
        console.log("close");
        $("#about_modal").removeClass('is-active');
    };

    const show_config = function() {
        $('.page').hide();

        let language_options = "";
        let languages = Object.keys(site_config["games"]);
        if (config["language_id"] == "") {
            language_options += `<option selected></a>`;
            $("#welcome-text").show();
            $("#save_config").prop("disabled", true);
            $("#cancel_config").prop("disabled", true);
        } else {
            $("#save_config").prop("disabled", false);
            $("#cancel_config").prop("disabled", false);
        }
        for (let ix=0; ix < languages.length; ix++) {
            let language_id = languages[ix];
            language_options += `<option value="${language_id}" `;
            language_options += (language_id == config["language_id"] ? "selected" : "");
            language_options += `>${site_config["games"][language_id]["name"]}</option>`;
        }
        // console.log(language_options);
        $("#language_selector").html(language_options);
        if (config["language_id"] == "") {
            $("#language_selector").change(function() {
                if ($("#language_selector").val() != "") {
                    $("#save_config").prop("disabled", false);
                } else {
                    $("#save_config").prop("disabled", true);
                }
            });
        }
        $('#configPage').show();
    };

    const cancel_config = function() {
        $('.page').hide();
        $('#mainPage').show(); 
    }

    const save_config = function() {
        const language_id = $("#language_selector option:selected").val();
        config["language_id"] = language_id;
        config["game_id"] = "categories";
        load_game()
        save_local_config();
        $('.page').hide();
        $('#mainPage').show(); 
    };

    const load_local_config = function() {
        let config_str = localStorage.getItem('word_games');
        if (config_str !== null) {
            config = JSON.parse(config_str);
            first_load = false;
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
    $(".show_config").click(show_config);
    $(".show_about").click(show_about);
    $("#close_about_modal").click(close_about);
    $("#save_config").click(save_config);
    $("#cancel_config").click(cancel_config);
    $( "html" ).keypress(real_keyboard_pressed);
});
