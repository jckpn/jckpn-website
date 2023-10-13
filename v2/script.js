$(function() {
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
        let d1, d2; // svg paths

        // animX/Y add extra movement to waves regardless of mouse position
        animX = Math.sin(frame / 15) * 20;
        animY = -Math.sin(frame / 15) * 15;

        frame++;
        if (frame / 15 > Math.PI*2) frame = 0;

        // if (hoveringLink) { // focus waves around link/mouse
        //     let x = mouseX + animX/10;
        //     let y = 50 + animY/10;

        //     d1 = 'M -5,105 C ' + (x) + ',' + (y-25) + ' ' + (x) + ',' + (y-25) + ' 105,105';
        //     d2 = 'M -5,-5 C ' + (x) + ',' + (y+25) + ' ' + (x) + ',' + (y+25) + ' 105,-5';
        // } else { // animate around, vaguely following mouse
            let x = mouseX + animX;
            let y = mouseY + animY;

            // set svg path
            d1 = 'M -5,' + (50+y/6) + ' C 40,100 ' + (40+x/3) + ',' + (50+y/4-x/8) + ' 105,105';
            d2 = 'M -5,' + (40+y/5) + ' C 60,115 ' + (40+x/4) + ',' + (50+y/3-x/8) + ' 105,95';
        // }

        $('#waves-path-1').attr('d', d1);
        $('#waves-path-2').attr('d', d2);
    }
});