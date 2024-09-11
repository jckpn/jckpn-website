$(function() { // wait for dom ready to get elements
    // set the click events for menu buttons
    $('.settings-button').on('click', (e) => { openMenuBanner(e, 'settings'); });
    $('.file-button').on('click', (e) => { openMenuBanner(e, 'file'); });
    $('.gpt-button').on('click', (e) => { openMenuBanner(e, 'gpt'); });
    $('.editor-button').on('click', (e) => { openToolbar(e); });
    $('.ql-editor').on('click', (e) => { closeMenuBanner(); });
    $('.option-logout').on('click', async (e) => {
        await fetch('/logout');
        window.location.reload();
    });

    var settings = [
        // {
        //     name: 'setting-devmode',
        //     buttonObj: $('.option-devmode'),
        //     statusObj: $('.option-devmode-status'),
        //     optionNames: ['On', 'Off'],
        //     apply: function(optionName) {
        //         if (optionName == 'On') {
        //             $('.dev-info-container').show();
        //             $('.annoying-banner').hide();
        //             $('.option-apikey').show();
        //         } else if (optionName == 'Off') {
        //             $('.dev-info-container').hide();
        //             $('.annoying-banner').show();
        //             $('.option-apikey').hide();
        //         }
        //     },
        //     chosenOption: null,
        // },

        {
            name: 'setting-suggestions',
            buttonObj: $('.option-suggestions'),
            statusObj: $('.option-suggestions-status'),
            optionNames: ['On', 'Off'],
            apply: function(optionName) {
                if (optionName == 'On') {
                    window.suggestionsEnabled = true;
                    $('.gpt-button img').attr('src', '../assets/icons/gpt-explain.png');
                    $('.option-aicfg').removeClass('menu-option-disabled');
                } else if (optionName == 'Off') {
                    window.suggestionsEnabled = false;
                    $('.gpt-button img').attr('src', '../assets/icons/gpt-explain-disabled.png');
                    $('.option-aicfg').addClass('menu-option-disabled');
                }
                updateTokensCountFE(); // index.js
            },
            chosenOption: null,
        },

        {
            name: 'setting-suggestionlength',
            buttonObj: $('.option-suggestionlength'),
            statusObj: $('.option-suggestionlength-status'),
            optionNames: ['Concise', 'Detailed'],
            apply: function(optionName) {
                window.suggestionLength = optionName == 'Concise' ? 4 : 16;
            },
            chosenOption: null,
        },

        {
            name: 'setting-theme',
            buttonObj: $('.option-theme'),
            statusObj: $('.option-theme-status'),
            optionNames: ['Light', 'Sepia', 'Dark'],
            apply: function(optionName) {
                if (optionName == 'Light') {
                    $("html").attr("theme", "light");
                } else if (optionName == 'Dark') {
                    $("html").attr("theme", "dark");
                } else if (optionName == 'Sepia') {
                    $("html").attr("theme", "sepia");
                }
            },
            chosenOption: null,
        },

        {
            name: 'setting-focusmode',
            buttonObj: $('.option-focusmode'),
            statusObj: $('.option-focusmode-status'),
            optionNames: ['Auto', 'Always', 'Never'],
            apply: function(optionName) {
                if (optionName == 'Auto') {
                    $('.ql-editor').removeClass('editor-remove-top-padding');
                    window.toolbarHidden = false;
                } else if (optionName == 'Always') {
                    $('.ql-editor').addClass('editor-remove-top-padding');
                    window.toolbarHidden = true;
                } else if (optionName == 'Never') {
                    $('.ql-editor').removeClass('editor-remove-top-padding');
                    window.toolbarHidden = false;
                }
            },
            chosenOption: null,
        },

        { 
            name: 'setting-numberedhs',
            buttonObj: $('.option-numberedhs'),
            statusObj: $('.option-numberedhs-status'),
            optionNames: ['Off', 'All', 'Sub'],
            apply: function(optionName) {
                if (optionName == 'Off') {
                    $('body').removeClass('numberedhs-enabled numberedhs-noh1');
                } else if (optionName == 'All') {
                    $('body').addClass('numberedhs-enabled');
                    $('body').removeClass('numberedhs-noh1');
                } else if (optionName == 'Sub') {
                    $('body').addClass('numberedhs-enabled numberedhs-noh1');
                }
            },
            chosenOption: null,
        },

        {
            name: 'setting-factchecker',
            buttonObj: $('.option-factchecker'),
            statusObj: $('.option-factchecker-status'),
            optionNames: ['Off', 'On'],
            apply: function(optionName) {
                window.factCheckerEnabled = optionName == 'On';
                // IDEA: a constantly showing factchecker container?
                // if (window.factCheckerEnabled) {
                    // $('.factchecker-container').show();
                // }

                showCustomAlert('The fact checker tool is still being developed. It may be inaccurate or unstable.', window.factCheckerEnabled ? 10 : 0);
            },
            chosenOption: null,
        },
    ]

    var menus = [
        { buttonObj: $('.menubar-button.file-button'), bannerObj: $('.file-menu-banner') },
        { buttonObj: $('.menubar-button.gpt-button'), bannerObj: $('.gpt-menu-banner') },
        { buttonObj: $('.menubar-button.editor-button'), bannerObj: $('.ql-toolbar') },
        { buttonObj: $('.menubar-button.settings-button'), bannerObj: $('.settings-menu-banner') }
    ]

    function initSettings() { // every window load
        $.each(settings, function (i, s) { // iterate through settings object
            // get stored settings (or default to first choice)
            s.chosenOption = parseInt(window.localStorage.getItem(s.name)) || 0;

            if (s.chosenOption >= s.optionNames.length) s.chosenOption = 0;
            let chosenOptionName = s.optionNames[s.chosenOption];
            s.statusObj.html(chosenOptionName);
            s.apply(chosenOptionName);
            
            // set button click
            s.buttonObj.on('click', () => {
                $('.loading-overlay').addClass('loading-overlay-active');

                setTimeout(() => {
                    s.chosenOption++;
                    if (s.chosenOption >= s.optionNames.length) {
                        s.chosenOption = 0;
                    }
                    window.localStorage.setItem(s.name, s.chosenOption.toString());
        
                    // repeated from above
                    let chosenOptionName = s.optionNames[s.chosenOption];
                    s.statusObj.html(chosenOptionName);
                    s.apply(chosenOptionName);
                }, 160);

                setTimeout(() => {
                    $('.loading-overlay').removeClass('loading-overlay-active');
                }, 320);
            });
        });
    }

    function openMenuBanner(e, menuName) { // can be `file`, `gpt` or `settings`
        let thisButtonClass = menuName + '-button';
        let thisMenuClass = menuName + '-menu-open';
        // let thisMenuBannerClass = menuName + '-menu-banner';
        
        let isAlreadyOpen = $('.menus-container').hasClass(thisMenuClass);
        closeMenuBanner(); // close any other menu first
        if (isAlreadyOpen) return;

        $('.' + thisButtonClass).addClass('settings-button-active');
        $('.menus-container').addClass('overlay-active ' + thisMenuClass);

        $('.editor-blur').addClass('editor-blur-on');
    }

    function openToolbar(e) {
        let isAlreadyOpen = $('.ql-toolbar').hasClass('ql-toolbar-active');
        closeMenuBanner();
        if (isAlreadyOpen) return;

        $('.ql-toolbar').addClass('ql-toolbar-active');
        $('.editor-button').addClass('settings-button-active');
        $('.menus-container').addClass('overlay-active');

        // $('.editor-blur').addClass('editor-blur-on');
    }

    function setMenuPositions() { // called every window resize
        $.each(menus, function (i, m) {
            const minMenuX = 15; // 15px padding from right
            
            // menu buttons are on right side so calculate from right
            let buttonX = $(window).width() - m.buttonObj.offset().left;
            let buttonWidth = m.buttonObj.width();
            let menuWidth = m.bannerObj.width();

            let buttonCentre = buttonX - (buttonWidth / 2); // subtract since it's from right
            let menuX = buttonCentre - (menuWidth / 2);

            if (menuX < minMenuX) menuX = minMenuX;

            m.bannerObj.css('right', menuX + 'px');
        });
    }

    initSettings();

    setTimeout(() => { setMenuPositions(); }, 1000);

    $(window).on('resize', () => {
        closeMenuBanner(); // hide repositioning jank

        setTimeout(() => { setMenuPositions(); }, 1000); // wait for window to 'finish' resizing
        setTimeout(() => { setMenuPositions(); }, 3000); // once again just to be sure...
    });
});

// need in file-manage.js too
function closeMenuBanner() {
    $('.ql-toolbar').removeClass('ql-toolbar-active');
    $('.menubar-button').removeClass('settings-button-active');
    $('.menus-container').removeClass('overlay-active feedback-menu-open file-menu-open gpt-menu-open settings-menu-open');

    $('.editor-blur').removeClass('editor-blur-on');
}