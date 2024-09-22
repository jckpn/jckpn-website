$(() => {
    var mouseX = 50;
    var mouseY = 50;

    updateBG();

    // on move mouse
    $(document).on('mousemove', function (e) {
        // if page width is less than 400px, don't do anything as mobile
        if ($(window).width() < 600) return;

        // see if hovering over .links-container element
        hoveringLink = $(e.target).closest('.links-container').length > 0;

        // get mouse x and y as % of window
        mouseX = e.pageX / $(window).width() * 100;
        mouseY = e.pageY / $(window).height() * 100;

        updateBG();
    });

    function updateBG() {
        const x = mouseX;
        const y = mouseY;

        const d1 = 'M -5,' + (60 + y / 12 + x * 0.1)
            + ' C 40,100'
            + ' ' + (40 + x * 0.1) + ',' + (40 + y * 0.2 - x * 0.1)
            + ' 105,105';

        const d2 = 'M -5,' + (45 + y * 0.1 + x * 0.1)
            + ' C 60,120'
            + ' ' + (40 + x * 0.1) + ',' + (50 + y * 0.1 - x * 0.1)
            + ' 105,95';

        $('#waves-path-1').attr('d', d1);
        $('#waves-path-2').attr('d', d2);
    }
});