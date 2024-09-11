const currentVersion = '0.4.9';

$(function() {
    fetch('/is-authenticated')
    .then(response => response.json())
    .then(data => {
        setTimeout(() => {
            $('.loading-overlay').removeClass('first-loading-overlay-active');
        }, 400);

        if (data.authenticated) {
            $('.login-popup-container').hide();
            console.log('authenticated as ' + data.email);
            window.isAuthenticated = true;
            updateTokensCountFE();
            // $('.dev-info-userid').text(data.user);
            $('.email-placeholder').text(data.email);
            window.quillEditor.focus();

            window.isMember = data.isMember;
            if (!data.isMember) $('body').addClass('not-member');

            // version check must be done once logged in, since login page
            // will store the last viewed version otherwise
            // also banner not visible on login page
            const lastViewedVersion = window.localStorage.getItem('last-viewed-version') || 'new-user';
            
            window.localStorage.setItem('last-viewed-version', currentVersion);
        } else {
            console.log('not authenticated');
            // delete quill editor
            window.quillEditor = null;
            // $('.login-popup-container').addClass('large-popup-visible');

            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Fetch error: ', error);
    });

    $('.gettokens-button').on('click', function() {
        $('.tokens-popup-container').addClass('large-popup-visible');
    });
    $('.tokens-popup-close, .tokens-popup-container').on('click', function() {
        $('.tokens-popup-container').removeClass('large-popup-visible');
    });
    $('.large-popup').on('click', function(e) {
        e.stopPropagation(); // stop clicks propagating to parent and closing popup
    });

    $('.menubar-logo').on('click', function() {
        window.location.href = '/';
    });
});

const icons = Quill.import('ui/icons');
// const { htmlEditButton } = require("quill-html-edit-button");

var Image = Quill.import('formats/image');
Image.className = 'editor-img';
Quill.register(Image, true);
// Quill.register('modules/htmlEditButton', htmlEditButton);

// for custom icons with CSS since the H3 was missing
icons.bold = 'B';
icons.italic = 'I';
icons.underline = 'U';
icons.header[1] = 'H';
icons.header[2] = 'H';
icons.header[3] = 'H';

const quillEditor = new Quill('#editor', {
    modules: {
        toolbar: [
            [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
            ['bold', 'italic', 'underline'],
            // [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ align: '' }, { align: 'center' }], //, { align: 'justify' }]
            // ['image'],
        ],
        imageResize: {
            modules: ['Resize', 'DisplaySize'],
            displayStyles: {
                backgroundColor: 'transparent',
                border: 'none',
            },
        },
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: null,
                // handled in gpt-suggest.js
            },
          }
        }
    },
    theme: 'snow',
});

quillEditor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    delta.ops = delta.ops.map(op => {
      return {
        insert: op.insert
      }
    })
    return delta
  })

window.quillEditor = quillEditor; // make global for other scripts

function updateTokensCountFE() {
    let attemptsToFetch = 0;

    var tokensCountInterval = setInterval(function() {
        attemptsToFetch++;
        if (attemptsToFetch > 10) {
            clearInterval(tokensCountInterval);
            console.log('could not fetch tokens count');
            return;
        }

        if (!window.isAuthenticated) return;

        // keep trying since user auth might not be finished yet
        console.log('attempt ' + attemptsToFetch + ' to fetch tokens count');
        fetch('/get-tokens-count')
        .then(response => response.json())
        .then(data => {
            clearInterval(tokensCountInterval);

            if (data.tokensCount != null) {
                clearInterval(tokensCountInterval);
                console.log('received token count as ' + data.tokensCount);

                tokensCount = data.tokensCount;
                if (data.tokensCount <= 0) tokensCount = 0;

                $('.option-tokensleft-status').html(tokensCount);
            
                if (window.suggestionsEnabled) {
                    if (tokensCount <= 1000) {
                        // hide other alerts, this is more important
                        $('.small-popup-visible').removeClass('small-popup-visible');

                        $('.annoying-banner').addClass('small-popup-visible');
                
                        if (tokensCount <= 0) {
                            $('.gpt-button img').attr('src', '../assets/icons/gpt-explain-error.png');
                            $('.option-suggestions').addClass('menu-option-disabled');
                            $('.option-aicfg').addClass('menu-option-disabled');
                            $('.option-suggestions-status').html('Disabled');
                            window.suggestionsEnabled = false;
                            $('.annoying-banner').addClass('annoying-banner-red');
                        }
                    }
                // } else {
                //     $('.annoying-banner').removeClass('small-popup-visible');
                // this just removed the banner straight away with updateTokensCountFE()
                // gets called from a couple places on load
                // also user will refresh page when buying tokens so not needed
                }
            }
        })
    }, 1000);
}

var alertTimeout;
function showCustomAlert(text, seconds) {
    clearTimeout(alertTimeout);

    $('.custom-alert-text').html(text);
    $('.custom-alert').addClass('small-popup-visible');

    alertTimeout = setTimeout(function() {
        $('.custom-alert').removeClass('small-popup-visible');
    }, seconds * 1000);
}