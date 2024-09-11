window.systemPromptLength = 20; // checked with https://platform.openai.com/tokenizer

window.shortResponseLength = 2;
window.mediumResponseLength = 4;
window.longResponseLength = 8;
window.longestResponseLength = 16;

window.shortContextLength = 16; // TODO: maybe make these multipliers instead
window.mediumContextLength = 32;
window.longContextLength = 64;
window.longestContextLength = 128;

window.shortDelay = 1000;
window.mediumDelay = 2000;
window.longDelay = 4000;
window.longestDelay = 8000;


$(function() {
    $('.option-aicfg').on('click', (e) => {
        $('.aicfg-popup-container').addClass('large-popup-visible');
    });
    $('.aicfg-popup-close, .aicfg-popup-container, .aicfg-popup-done').on('click', (e) => {
        $('.aicfg-popup-container').removeClass('large-popup-visible');
    });

    if (window.localStorage.getItem('aicfg-responselength') == null) {
        window.localStorage.setItem('aicfg-responselength', 1);  // default to medium
    }
    if (window.localStorage.getItem('aicfg-contextlength') == null) {
        window.localStorage.setItem('aicfg-contextlength', 2);  // default to high
    }
    if (window.localStorage.getItem('aicfg-creativity') == null) {
        window.localStorage.setItem('aicfg-creativity', 1);  // default to medium
    }
    if (window.localStorage.getItem('aicfg-delay') == null) {
        window.localStorage.setItem('aicfg-delay', 0);  // default to shortest
    }
    if (window.localStorage.getItem('aicfg-showcontext') == null) {
        window.localStorage.setItem('aicfg-showcontext', 0);  // default to no
    }

    setResponseLength(window.localStorage.getItem('aicfg-responselength'));
    setContextLength(window.localStorage.getItem('aicfg-contextlength'));
    setCreativity(window.localStorage.getItem('aicfg-creativity'));
    setDelay(window.localStorage.getItem('aicfg-delay'));
    setShowContext(window.localStorage.getItem('aicfg-showcontext'));

    $('#slider-responselength').on('change', (e) => {
        if (!window.isMember) return;
        let v = parseInt($('#slider-responselength').val());
        setResponseLength(v);
    });
    $('#slider-contextlength').on('change', (e) => {
        if (!window.isMember) return;
        let v = parseInt($('#slider-contextlength').val());
        setContextLength(v);
    });
    $('#slider-creativity').on('change', (e) => {
        if (!window.isMember) return;
        let v = parseInt($('#slider-creativity').val());
        setCreativity(v);
    });
    $('#slider-delay').on('change', (e) => {
        if (!window.isMember) return;
        let v = parseInt($('#slider-delay').val());
        setDelay(v);
    });
    $('#slider-showcontext').on('change', (e) => { // actually checkbox
        if (!window.isMember) return;
        let v = $('#slider-showcontext').is(':checked') ? 1 : 0;
        setShowContext(v);
    });

    function setResponseLength(value) {
        $('#slider-responselength').val(parseInt(value)); // set if not already
        window.localStorage.setItem('aicfg-responselength', value.toString());

        $('.responselength-status').text(
            (value <= 0 ? '1-2 Words'
            : value <= 1 ? '2-4 Words'
            : value <= 2 ? '4-8 Words'
            : '8-16 Words'));

        updateCostEstimate();
        updateResponseText();
    }

    function setContextLength(value) {
        $('#slider-contextlength').val(parseInt(value)); // set if not already
        window.localStorage.setItem('aicfg-contextlength', value.toString());

        $('.contextlength-status').text(
            (value <= 0 ? 'None'
            : value <= 1 ? 'Medium'
            : value <= 2 ? 'High'
            : 'Extra'));

        if (value <= 0) {
            $('.demo-context-short').show();
            $('.demo-context-medium').hide();
            $('.demo-context-long').hide();
        } else if (value <= 1) {
            $('.demo-context-short').hide();
            $('.demo-context-medium').show();
            $('.demo-context-long').hide();
        } else {
            $('.demo-context-short').hide();
            $('.demo-context-medium').hide();
            $('.demo-context-long').show();
        }

        updateCostEstimate();
        // updateResponseText(); // doesn't demonstrate context yet
    }

    function setCreativity(value) {
        $('#slider-creativity').val(parseInt(value)); // set if not already
        window.localStorage.setItem('aicfg-creativity', value.toString());

        $('.creativity-status').text(value <= 0 ? 'Factual'
                                : value <= 1 ? 'Low'
                                : value <= 2 ? 'Medium'
                                : 'High');

        updateCostEstimate();
        updateResponseText();
    }

    function setDelay(value) {
        $('#slider-delay').val(parseInt(value)); // set if not already
        window.localStorage.setItem('aicfg-delay', value.toString());

        window.gptDelayTime = value <= 0 ? window.shortDelay
                            : value <= 1 ? window.mediumDelay
                            : value <= 2 ? window.longDelay
                            : window.longestDelay;
            
        $('.delay-status').text(window.gptDelayTime/1000 + ' Seconds');

        // updateCostEstimate();
        // updateResponseText();
    }

    function setShowContext(value) {
        // $('#slider-showcontext').prop('checked', parseInt(value) == 1);
        // window.localStorage.setItem('aicfg-showcontext', value.toString());
        // window.highlightContext = value == 1 ? true : false;
        // if (value == 1) {
        //     $('.aicfg-demo-context').addClass('keep-context-highlighted');
        // } else {
        //     $('.aicfg-demo-context').removeClass('keep-context-highlighted');
        // };

        // actually just always show it
        window.localStorage.setItem('aicfg-showcontext', 'true');
        window.highlightContext = true;
        $('.aicfg-demo-context').addClass('keep-context-highlighted');
    }

    function updateCostEstimate() {
        // get token cost of response
        const responseLength = parseInt(
            window.localStorage.getItem('aicfg-responselength'));
        let responseCost;
        if (responseLength <= 0) { responseCost = window.shortResponseLength;
        } else if (responseLength <= 1) { responseCost = window.mediumResponseLength;
        } else if (responseLength <= 2) { responseCost = window.longResponseLength; }
        else { responseCost = window.longestResponseLength; }

        // get token cost of context
        const contextLength = parseInt(window.localStorage.getItem('aicfg-contextlength'));
        let contextCost;
        if (contextLength <= 0) {
            contextCost = window.shortContextLength;
        } else if (contextLength <= 1) {
            contextCost = window.mediumContextLength;
        } else if (contextLength <= 2) {
            contextCost = window.longContextLength; 
        } else { contextCost = window.longestContextLength; }

        // get system prompt and estimate total cost
        let estUpperCost = (window.systemPromptLength
            + contextCost + responseCost);
        estUpperCost = Math.ceil(estUpperCost/10)*10;
        let estLowerCost = estUpperCost - 20;
        
        // update cfg window cost estimate
        $('.aicfg-costestimate-value').html(
            estLowerCost + '-' + estUpperCost + ' (est.)');
    }

    function updateResponseText() {
        $('.demo-suggestion-text').removeClass('suggestion-visible');

        const responseLength = parseInt(
            window.localStorage.getItem('aicfg-responselength'));
        const contextLength = parseInt(
            window.localStorage.getItem('aicfg-contextlength'));
        const creativity = parseInt(
            window.localStorage.getItem('aicfg-creativity'));
        console.log(responseLength, contextLength, creativity);
        let responseText;

        // note these are actually gpt generated responses
        if (responseLength <= 0) {
            if (creativity <= 0) {
                // SHORT & FACTUAL
                responseText = 'loyal nature';
            } else if (creativity <= 1) {
                // SHORT & GENERAL
                responseText = 'friendliness';
            } else {
                // SHORT & CREATIVE
                responseText = 'heart-stealing charm';
            }
        } else if (responseLength <= 1) {
            if (creativity <= 0) {
                // MEDIUM LENGTH & FACTUAL
                responseText = 'affectionate and obedient temperament';
            } else if (creativity <= 1) {
                // MEDIUM LENGTH & GENERAL
                responseText = 'loving personality and easygoing nature';
            } else {
                // MEDIUM LENGTH & CREATIVE
                responseText = 'irresistible aura of joy';
            }
        } else if (responseLength <= 2) {
            if (creativity <= 0) {
                // LONG & FACTUAL
                responseText = 'loyal, affectionate temperament, making them excellent family pets';
            } else if (creativity <= 1) {
                // LONG & GENERAL
                responseText = 'strong companionship, social nature, and love for family';
            } else {
                // LONG & CREATIVE
                responseText = 'magical blend of whimsy, loyalty, and cuddle expertise';
            }
        } else {
            if (creativity <= 0) {
                // LONGEST & FACTUAL
                responseText = 'loyal, affectionate temperament, making them excellent family pets. They are also known for their strong companionship and social nature.';
            } else if (creativity <= 1) {
                // LONGEST & GENERAL
                responseText = 'strong companionship, social nature, and love for family. They are also known for their loyal, affectionate temperament.';
            } else {
                // LONGEST & CREATIVE
                responseText = 'magical blend of whimsy, loyalty, and cuddle expertise. They are also known for their strong companionship and love for family.';
            }
        }
        
        
        $('.demo-suggestion-text').html(responseText);
        setTimeout(() => {
            $('.demo-suggestion-text').addClass('suggestion-visible');
        }, 200); // to trigger css transition and provide loading effect
    }
})