$(function () {
    $('.option-gptcheck').on('click', async function () {
        // get just the text currently visible in the editor, not the whole document
        // as some will be scrolled out of view
        const text = quillEditor.getText(0, quillEditor.getLength());
        const numWords = text.split(' ').length;

        if (numWords < 5) {
            alert('You must write at least 5 words to use this tool.');
            return;
        }

        $('.loading-text').text('Checking Document');
        $('.loading-overlay').addClass('loading-overlay-active');

        const responseText = await proofread();

        $('.loading-text').text('Loading Editor');
        $('.loading-overlay').removeClass('loading-overlay-active');
    });

    async function proofread() {
        const context = quillEditor.getText();
        const responseText = await runProofreadGPT(context);
        console.log('API response: ' + responseText);

        if (window.factCheckerEnabled) { // check again in case disabled while waiting
            // see if response is TRUE or FALSE
            
            // response will be in form:
            // ...
            // - "original text": error explanation
            // ...
            // try to find original text in quill editor and highlight it

            // for each line:
            // if line starts with - ":
            //   find next line that starts with - "

            var errors = []; // array of objects with keys: originalText, errorExplanation
            const lines = responseText.split('\n');
            lines.forEach((line, i) => {
                if (line.startsWith('- "')) {
                    try {
                        const text = line.substring(3, line.indexOf('": '));
                        const explanation = line.substring(line.indexOf('": ') + 3);
                        errors.push({ text: text, explanation: explanation });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });

            console.log(errors);

            // remove any previous highlights
            window.quillEditor.formatText(0, window.quillEditor.getLength(), 'background', false);

            errors.forEach((error, i) => {
                try {
                    const textIndex = quillEditor.getText().indexOf(error.text);
                    if (textIndex > -1) {
                        window.quillEditor.formatText(textIndex, error.text.length, 'background', '#ff8888');

                        // inject warning element at that index in quill editor element
                        const warningElement = $('<div class="gpt-proofread-warning"></div>');
                        warningElement.text(error.explanation);
                        $('.gpt-proofread-container').append(warningElement);
                        const cursorPx = window.quillEditor.getBounds(textIndex);
                        warningElement.css({ top: cursorPx.top, left: cursorPx.left });
                    }
                } catch (error) {
                    console.log(error);
                }
            });



            // const warningElement = $('<div class="gpt-proofread-warning"></div>');
            // warningElement.text(responseText.substring(2));
            // $('.gpt-proofread-container').append(warningElement);
            // warningElement.css({ top: cursorPx.y, left: cursorPx.x });
        }
    }
});

async function runProofreadGPT(context) {    
    const gptMessages = [
        { role: 'system', content: (
            'Make a bullet point list of factual errors in user text.'
        + ' Do not check for spelling, punctual or grammar errors.'
        + ' Respond in format:\n- "original text": error explanation') },

        // provide example for gpt to work with:
        { role: 'user', content: 'The sun is blue. ice iss warm.' },
        { role: 'assistant', content: ('- "The sun is blue": It is yellow.'
                                        + '\n- "ice iss warm": It is cold.')},

        { role: 'user', content: context },
    ];

    const chatCompletionParams = {
        model: "gpt-3.5-turbo",
        messages: gptMessages,
        max_tokens: 1024,
        temperature: 0.2,
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
        responseText = 'GPT Error. Try refreshing the page.'; 
    }

    return responseText;
}