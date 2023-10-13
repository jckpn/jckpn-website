$(function() { // WAVES
    var mouseX = 50;
    var mouseY = 50;
    var animX = 0;
    var animY = 0;
    var frame = 0;
    var hoveringLink = false;

    setInterval(updateWaves, 100);
    updateWaves();
    
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


    function updateWaves() {
        // update anim variables to add extra movement to waves
        animX = Math.sin(frame / 15) * 20;
        animY = -Math.sin(frame / 15) * 15;
        frame++; if (frame / 15 > Math.PI*2) frame = 0;

        let x = mouseX + animX;
        let y = mouseY + animY;
        

        let d1, d2;

        if ($('.content-container').hasClass('page-home')) {
            // set svg path
            d1 = 'M -5,' + (60+y/12) + ' C 40,100 ' + (40+x/3) + ',' + (50+y/4-x/8) + ' 105,105';
            d2 = 'M -5,' + (50+y/9) + ' C 60,115 ' + (40+x/4) + ',' + (50+y/3-x/8) + ' 105,95';
        } else {
            d1 = 'M -5,' + (-20+y/10) + ' C -10,20 ' + (40+x/12) + ',' + (y/8-x/11) + ' 105,25';
            d2 = 'M -5,' + (-20+y/15) + ' C 60,15 ' + (40+x/10) + ',' + (30+y/10-x/12) + ' 105,20';
        }

        $('#waves-path-1').attr('d', d1);
        $('#waves-path-2').attr('d', d2);
    }
});

$(function() { // LINKS
    $('.back-button').on('click', () => {
        $('.content-container').addClass('page-home');
        $('.content-container').removeClass('page-about');

        $('path').css('transition-duration', '1s');
        setTimeout(() => {
            $('path').css('transition-duration', '2s');
        }, 1000);
    });

    $('#link-about').on('click', () => {
        $('.content-container').addClass('page-about');
        $('.content-container').removeClass('page-home');

        $('path').css('transition-duration', '1s');
        setTimeout(() => {
            $('path').css('transition-duration', '2s');
        }, 1000);
    });
});