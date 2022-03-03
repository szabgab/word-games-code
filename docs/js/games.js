$(document).ready(function(){
    const url = "http://word-games-data.szabgab.com/hu.json";
    let game_data = {};
    $('#stop').hide();

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


    const startGame = function() {
        console.log("startGame");
        $('#start').hide();
        $('#stop').show();
        $('#game').show();
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
            html += `<button class="button" id="button_${ix}"> </button>`;
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
        // when all the word was matched, the user wins
        // if 8 bad letters, the game is over (allow this to be language specific)
    };

    const stopGame = function() {
        console.log("endGame");
        $('#start').show();
        $('#stop').hide();
        $('#game').hide();
        $( "html" ).off("keypress");
    };

    $.getJSON(url, function(data){
        game_data = data;
        console.log(game_data);
        //$("#output").html("Loaded");
    }).fail(function(){
        //$("#output").html('Error');
        console.log("An error has occurred.");
    });


    $('#start').click(startGame);
    $('#stop').click(stopGame);
});