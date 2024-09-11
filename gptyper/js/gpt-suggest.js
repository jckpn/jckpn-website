$(function() {
    var currentSuggestion = {
        enabled: true,
        canShowSuggestion: false,
        rateLimited: false, // TODO:
        index: 0,
        text: ""};
    
    let typingTimer;

        // wait until quill is not null
    setTimeout(() => {
        // $('.option-tokensleft-status').html(tokensLeft);

        // move cursor to end of document (might be preloaded/cached)
        window.quillEditor.setSelection(window.quillEditor.getLength(), source = 'silent');
        window.quillEditor.focus();

        // show a little greeting if empty/new doc
        generateSuggestion();
    }, 250);

    disableHighlight();


    // cancel suggestion if user clicked on text outside of suggestion
    window.quillEditor.on('selection-change', () => {
        if ($('.ql-editor a').length == 0) {
            clearTimeout(typingTimer);
            currentSuggestion.canShowSuggestion = false;
        } else {
            // let newIndex = window.quillEditor.getSelection().index;
            // let suggestionRange = currentSuggestion.index + currentSuggestion.text.length;
            // console.log(newIndex, suggestionRange, currentSuggestion.index, currentSuggestion.text.length)
            // if (newIndex < currentSuggestion.index || newIndex > suggestionRange) {
            //     cancelSuggestion();
            // } else {
            //     insertSuggestion();
            // }
        }
    });

    $('.menubar, .toolbar-extra, .ql-editor').on('click', () => { cancelSuggestion(); });
    $('.ql-editor').on('click', () => { cancelSuggestion(); });

    let quillText = window.quillEditor.getText();

    function enableHighlight(start, length) {
        return; // disabled for now

        if (!window.highlightContext) return;

        // creates a span with the color:
        window.quillEditor.formatText(
            start,
            length,
            { color: 'var(--font-color)' }, // ->nothing, but makes a span we can style
            source = 'silent'
        );
    }

    function disableHighlight() {
        return;

        if (!window.highlightContext) return;

        window.quillEditor.formatText(
            0,
            window.quillEditor.getLength(),
            { color: false },
            source = 'silent'
        );
    }

    $(document).on('keydown', (e) => {
        // if (!currentSuggestion.enabled
        //     || currentSuggestion.text == ""
        //     || !currentSuggestion.canShowSuggestion) return;

        if (e.keyCode == 9) { // tab key
            e.preventDefault(); // default is to change focus since we disabled tab in editor-setup.js
            insertSuggestion();
            return;
        } else if (e.keyCode == 16) { // shift key
            return; // don't do anything
        } else if (e.keyCode == 27) { // esc key
            cancelSuggestion(); // always cancel if esc
        }

        // TODO: check if keypress is actually typing something or just a modifier key etc.
        // we don't want to cancel the suggestion on a keypress that doesn't change the text
        // but it currently does

        // see if user is manually typing the suggestion
        let hasTyped = window.quillEditor.getText() != quillText;
        if (hasTyped && $('.ql-editor a').length > 0 && currentSuggestion.text != "") {
            let charTyped = String.fromCharCode(e.keyCode);
            if (charTyped.toLowerCase() == currentSuggestion.text[0].toLowerCase()) {
                currentSuggestion.text = currentSuggestion.text.slice(1);
                currentSuggestion.index++;
                $('.ql-editor a').html(currentSuggestion.text);
                return;
            }
        }

        cancelSuggestion(); // cancel suggestion since typing something else

        if (window.suggestionsEnabled) {
            clearTimeout(typingTimer); // new keydown -> still typing -> reset timer
            currentSuggestion.canShowSuggestion = false;

            typingTimer = setTimeout(() => {
                if (currentSuggestion.rateLimited) {
                    console.log('GPT DEBUG: rate limited - cancelling');
                    return;
                }

                // don't want to suggest mid-sentence so check next character:
                //      a) doesn't exist or
                //      b) is a new line
                
                // if so, can proceed with a suggestion at end of line :)

                let text = window.quillEditor.getText();
                let index = window.quillEditor.getSelection().index;
                let nextChar = text[index];
                // let lastChar = text[index - 1];

                if  (nextChar == '\n' || nextChar == '' || nextChar == undefined) {
                //&& (lastChar != '\n')) && lastChar == ' ')) {
                    console.log('GPT DEBUG: calling for suggestion - cursor at end of line');
                    generateSuggestion();
                } else {
                    console.log('GPT DEBUG: not calling for suggestion - cursor not at end of line');
                }

            }, window.gptDelayTime);
        }
    });

    async function generateSuggestion(prewrittenText = null) {
        let response;

        // to check for cursor change later
        currentSuggestion.index = window.quillEditor.getSelection().index;

        let context = window.quillEditor.getText().slice(0, currentSuggestion.index);
        
        // if last char of context is space, remove it (wasted token)
        let wasTrailingSpace = false, wasNewline = false;
        if (context[context.length - 1] == ' ') {
            context = context.slice(0, -1);
            wasTrailingSpace = true;
        }
        if (context[context.length - 1] == '\n' || context.length < 2) {
            wasNewline = true;
        }

        if (window.quillEditor.getText().length < 2) {
            prewrittenText = 'Provide a little context about what you\'d like to write...';
        }


        if (!prewrittenText) {
            const minContext = 3; // words

            const contextLength = parseInt(window.localStorage.getItem('aicfg-contextlength'));
            let maxContext = contextLength <= 0
                ? window.shortContextLength // aicfs.js
                : contextLength <= 1
                    ? window.mediumContextLength
                    : contextLength <= 2
                        ? window.longContextLength
                        : window.longestContextLength;
            maxContext *= 0.75; // 1 token ~ .75 words
                                // --> so this is our context limit in words

            contextWordsArray = context.split(' '); // split context to check length in words

            if (contextWordsArray.length < minContext) {
                console.log('GPT DEBUG: not enough context (' + contextWordsArray.length + '<)' + minContext);
                // generateSuggestion('need more context...');
                return;
            }
            if (contextWordsArray.length > maxContext) {
                contextWordsArray = contextWordsArray.slice(-maxContext);
                context = contextWordsArray.join(' ');
            }

            // show loading dots where cursor is
            let cursorPos = window.quillEditor.getBounds(currentSuggestion.index);
            $('.gpt-loading-dots')
                .css({
                    top: cursorPos.top,
                    left: cursorPos.left
                })
                .addClass('gpt-loading-dots-visible');
            
            let contextStartIndex = currentSuggestion.index - context.length;
            enableHighlight(contextStartIndex-1, context.length + (wasTrailingSpace ? 0 : 1));

            currentSuggestion.canShowSuggestion = true;

            console.log('GPT DEBUG: sending API request');
            response = await runSuggestionGPT(userPrompt=context);
        } else {
            currentSuggestion.canShowSuggestion = true;
            response = prewrittenText;
        }

        console.log('GPT DEBUG: API response received: ' + response);
        if (currentSuggestion.canShowSuggestion) {
            $('.gpt-loading-dots').removeClass('gpt-loading-dots-visible');

            // if user has changed where they're typing, cancel suggestion
            // if (currentSuggestion.index != window.quillEditor.getSelection().index) {
            //     cancelSuggestion();
            //     return;
            // };

            // *** OVERRIDE RESPONSES FOR DEMOS ***

            // const prewrittenResponses = [
            //     {
            //         context: 'Writing notes and essays',
            //         response: 'can be daunting'
            //     },
            //     {
            //         context: 'and it\'s hard to know',
            //         response: 'what words to use'
            //     },
            //     {
            //         context: 'With GPTyper, you',
            //         response: 'have a super smart assistant'
            //     },
            //     {
            //         context: 'that helps you write',
            //         response: 'faster and better'
            //     },
            //     {
            //         context: 'It\'s amazing for',
            //         response: 'essays, creative writing and more'
            //     },
            //     {
            //         context: 'Give it a go and',
            //         response: 'watch your productivity skyrocket'
            //     },
            // ];

            // for (let i = 0; i < prewrittenResponses.length; i++) {
            //     if (endsWith(context, prewrittenResponses[i].context)) {
            //         response = prewrittenResponses[i].response;
            //         break;
            //     }
            // }
                
            currentSuggestion.text = response;

            const firstChar = currentSuggestion.text[0];
            if  (firstChar == '.'
            || firstChar == ','
            || firstChar == '!'
            || firstChar == '?') {
                if (!wasNewline) {
                    if (wasTrailingSpace) {
                        window.quillEditor.deleteText(currentSuggestion.index, 1, source = 'silent');
                        currentSuggestion.index--;
                    }
                }
            } else {
                if (!wasTrailingSpace && !wasNewline) {
                    currentSuggestion.text = ' ' + currentSuggestion.text;
                }
            }
                    
            if ($('.ql-editor a').length == 0) {
                // remove context highlight
                disableHighlight();

                if (window.suggestionsEnabled) {
                    currentSuggestion.text = currentSuggestion.text.replace('TRUE. ', '');
                }

                // insert suggestion as a link, which gets styled by css
                window.quillEditor.insertText(
                    currentSuggestion.index,
                    currentSuggestion.text,
                    'link',
                    source = 'silent',
                );

                window.quillEditor.setSelection(currentSuggestion.index);
                $('.ql-editor a').addClass('suggestion-visible');
                
                $('.ql-editor a').on('click', (e) => {
                    e.preventDefault();
                    insertSuggestion();
                });
            }
        } else {
            console.log('GPT DEBUG: cancelling - canShowSuggestion is false or result is empty');
            cancelSuggestion();
        }
    }

    function insertSuggestion() {
        if ($('.ql-editor a').length == 0 || currentSuggestion.text == "") {
            cancelSuggestion();
            return;
        }

        $('.ql-editor a').remove(); // needed or clicking it doesn't work

        window.quillEditor.insertText(
            currentSuggestion.index,
            currentSuggestion.text,
            source = 'silent');
        window.quillEditor.setSelection(
            currentSuggestion.index + currentSuggestion.text.length,
            source = 'silent');
        window.quillEditor.focus();

        cancelSuggestion();
    }

    function cancelSuggestion() {
        // remove loading dots in case they aren't already
        $('.gpt-loading-dots').removeClass('gpt-loading-dots-visible');

        // remove highlight (from whole editor to be safe)
        disableHighlight();

        if ($('.ql-editor a').length == 0) return;

        $('.ql-editor a').removeClass('suggestion-visible');
        setTimeout(function() { // let animation finish before removing
            $('.ql-editor a').remove();
        }, 200);

        clearTimeout(typingTimer);
        currentSuggestion.canShowSuggestion = false;
        currentSuggestion.text = "";
    }
});

// call openai api from preload.js

async function runSuggestionGPT(context) {
    const errMsg = 'GPT Error. Try refreshing the page.';

    // craft the system prompt using set prompt config
    // context length is dealt with in generateSuggestion()

    const responseLength = parseInt(window.localStorage.getItem('aicfg-responselength'));
    const creativity = parseInt(window.localStorage.getItem('aicfg-creativity'));

    const systemPrompt = 'Continue the text.'
                            + (creativity <= 0 ? ' Be factual and accurate.'
                            : creativity <= 1 ? ''
                            : creativity <= 2 ? ' Be creative.'
                            : creativity <= 3 ? ' Be very creative!' : '')
                        + ' Respond only added words'
                        + (responseLength <= 1 ? ' and no punctuation' : '')
                        + '. Start:\n' + context;

    const gptMessages = [{ role: 'system', content: systemPrompt }];
    
    const chatCompletionParams = {
        model: "gpt-3.5-turbo",
        messages: gptMessages,
        max_tokens: responseLength <= 0 ? window.shortResponseLength // aicfs.js
                    : responseLength <= 1 ? window.mediumResponseLength
                    : responseLength <= 2 ? window.longResponseLength
                    : responseLength <= 3 ? window.longestResponseLength : 1,
        temperature: creativity <= 0 ? 0.3
                    : creativity <= 1 ? 0.5
                    : creativity <= 2 ? 0.7
                    : creativity <= 3 ? 1.0 : 0.5,
        stop: ["\n"] // longer responses might be multiple sentences
    };

    var responseText;

    try {
        const apiResponse = await fetch('/call-openai', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatCompletionParams)
        })
        const responseJson = await apiResponse.json();
    
        responseText = responseJson.choices[0].message.content;
        updateTokensCountFE();
    } catch (error) {
        console.log(error);
        responseText = errMsg; 
    }

    return responseText;
}

function endsWith(str, suffix) {
    return str.slice(-suffix.length) === suffix;
}
  