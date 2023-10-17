$(function() { // BACKGROUND
    var mouseX = 50;
    var mouseY = 50;
    var scrollY = 0;
    var animX = 0;
    var animY = 0;
    var frame = 0;
    var hoveringLink = false;
    var dotPositions = [
        { x: 25, y: 17, r: 0.4 },
        { x: 61, y: 10, r: 0.4 },
        { x: 2, y: 30, r: 0.4 },
        { x: 74, y: 96, r: 0.7 },
        { x: 83, y: 1, r: 0.7 },
        { x: 13, y: 15, r: 0.5 },
        { x: 81, y: 13, r: 0.5 },
        { x: 62, y: 94, r: 0.7 },
        { x: 31, y: 70, r: 0.4 },
        { x: 52, y: 27, r: 0.4 },
        { x: 71, y: 56, r: 0.5 },
        { x: 25, y: 35, r: 0.3 },
    ];

    setInterval(updateBG, 100);
    updateBG();
    
    // on move mouse
    $(document).on('mousemove', function(e) {
        // if page width is less than 400px, don't do anything as mobile
        if ($(window).width() < 600) return;

        // see if hovering over .links-container element
        hoveringLink = $(e.target).closest('.links-container').length > 0;

        // get mouse x and y as % of window
        mouseX = e.pageX / $(window).width() * 100;
        mouseY = e.pageY / $(window).height() * 100;
    });

    function updateBG() {
        // update anim variables to add extra movement to waves
        animX = Math.sin(frame / 15) * 20;
        animY = -Math.sin(frame / 15) * 15;
        frame++; if (frame / 15 > Math.PI*2) frame = 0;

        const x = mouseX + animX;
        const y = mouseY + animY;

        const d1 = 'M -5,' + (60+y/12 - scrollY*1.2)
            + ' C 40,' + (100 - scrollY*0.7)
            + ' ' + (40+x/3) + ',' + (50 + y/4 - x/8 - scrollY)
            + ' 105,' + (105 - scrollY*1.2);

        const d2 = 'M -5,' + (50+y/9 - scrollY*0.9)
            + ' C 60,' + (110 - scrollY*1.3)
            + ' ' + (40+x/4) + ',' + (50 + y/3 - x/8 - scrollY)
            + ' 105,' + (95 - scrollY*.8);

        $('#waves-path-1').attr('d', d1);
        $('#waves-path-2').attr('d', d2);

        $('.dot').each(function(i) {
            $(this).css('width', dotPositions[i].r*10 + 'px');
            $(this).css('height', dotPositions[i].r*10 + 'px');
            $(this).css('left', 'calc(' + dotPositions[i].x + '% + ' + dotPositions[i].r*x + 'px)');
            $(this).css('top', 'calc(' + dotPositions[i].y + '% + ' + dotPositions[i].r*(y-scrollY*5) + 'px)');
        });
    }
    
    // LINKS AND SCROLLING

    $('.back-button').on('click', () => { loadFauxPage('home'); });
    $('.link-about').on('click', () => { loadFauxPage('about'); });
    $('.header-about').on('click', () => { loadFauxPage('about'); });
    $('.link-projects').on('click', () => { loadFauxPage('projects'); });
    $('.header-projects').on('click', () => { loadFauxPage('projects'); });
    $('.link-contact').on('click', () => { loadFauxPage('contact'); });
    $('.header-contact').on('click', () => { loadFauxPage('contact'); });

    // detect new scroll events and ignore inertia
    // https://stackoverflow.com/a/49437167
    
    let transitionDelay = 500;
    let transitioning = false;

    let minScrollWheelInterval = 100; // minimum milliseconds between scrolls
    let lastScrollWheelTimestamp = 0;
    let lastScrollWheelDelta = 0;

    $(window).on('wheel', function(e) {
        let currentPageName = window.location.href.split('#')[1];
        let pageNames = ['home', 'about', 'projects', 'contact'];
        let currentPageIndex = pageNames.indexOf(currentPageName);

        const now = Date.now();

        const rapidSuccession = now - lastScrollWheelTimestamp < minScrollWheelInterval;
        const otherDirection = (lastScrollWheelDelta > 0) !== (e.originalEvent.wheelDelta > 0);
        const speedDecrease = Math.abs(e.originalEvent.wheelDelta) <= Math.abs(lastScrollWheelDelta);

        const isHuman = otherDirection || !rapidSuccession || !speedDecrease;
        if (isHuman && !transitioning) {
            animating = true; // current animation starting: future animations blocked

            console.log('human event: ' + e.originalEvent.wheelDelta);
            
            if (e.originalEvent.wheelDelta < 0) { // down
                if (currentPageIndex < pageNames.length-1) {
                    loadFauxPage(pageNames[currentPageIndex+1]);
                }
            } else { // up
                if (currentPageIndex > 0) {
                    loadFauxPage(pageNames[currentPageIndex-1]);
                }
            }
        }

        lastScrollWheelTimestamp = now;
        lastScrollWheelDelta = e.originalEvent.wheelDelta;
    });

    function loadFauxPage(pageName, force = false) {
        let oldPageName = window.location.href.split('#')[1];
        if (pageName == oldPageName && !force) return;

        transitioning = true;
        window.location.href = '#' + pageName;

        $('.content-section').removeClass('chosen-section');
        $('.section-' + pageName).addClass('chosen-section');

        if (pageName == 'home') {
            $('.content-container').addClass('page-home');
        } else {
            $('.content-container').removeClass('page-home');
        }

        console.log('run once');

        if (oldPageName == 'home') {
            console.log('transition delay 0.2s');
            $('.stuff-container').css('transition-delay', '.2s');
            // looks better transitioning home -> pages
        } else {
            console.log('transition delay 0s');
            $('.stuff-container').css('transition-delay', '0s');
        }

        // make wave transition faster during page transition
        $('path').css('transition-duration', '1s');
        setTimeout(() => {
            $('path').css('transition-duration', '2s');
        }, 1000);
        
        if (pageName == 'home') {
            // reset transform or will have wrong anim next time
            $('.stuff-container').css('transform', 'translateY(0px)');
        } else {
            sectionHeight = $('.section-' + pageName).height();
            sectionPos = $('.section-' + pageName).position().top;
            $('.stuff-container').css('transform', 'translateY(' + (-sectionPos - sectionHeight/2) + 'px)');
            $('.back-button').css('top', (sectionPos) + 'px');
        }

        if (pageName == 'home') scrollY = 0;
        else if (pageName == 'about') scrollY = 60;
        else if (pageName == 'projects') scrollY = 80;
        else if (pageName == 'contact') scrollY = 100;

        setTimeout(() => {
            transitioning = false;
        }, transitionDelay);

        updateBG();
    }

    detectURLHash();
    // $(window).on('hashchange', () => {
    //     detectURLHash();
    // });

    function detectURLHash() {
        let pageName = window.location.href.split('#')[1];
        if (pageName) {
            loadFauxPage(pageName, true);
        } else {
            loadFauxPage('home', true);
        }
    }
});