$(() => {
    updateBG(0, 0);

    // on move mouse
    $(document).on('mousemove', function (e) {
        // if page width is less than 400px, don't do anything as mobile
        if ($(window).width() < 600) return;

        // see if hovering over .links-container element
        hoveringLink = $(e.target).closest('.links-container').length > 0;

        // get mouse x and y as % of window from center
        mouseX = e.pageX / $(window).width() * 200 - 100;
        mouseY = e.pageY / $(window).height() * 200 - 100;

        updateBG(mouseX, mouseY);
    });

    function updateBG(mouseX, mouseY) {
        // update SVG lines with mouse movement
        var x = mouseX * 0.02;
        var y = mouseY * 0.05;
        const d1 = 'M -5,105 L -5,' + (70 + x + y)
            + ' C 40,100'
            + ' ' + (40 + x) + ',' + (50 - x + y)
            + ' 105,105 L';
        $('#waves-path-1').attr('d', d1);

        var x = mouseX * 0.06;
        var y = mouseY * 0.06;
        const d2 = 'M -5,105 L -5,' + (55 + x + y)
            + ' C 60,120'
            + ' ' + (40 + x) + ',' + (50 - x + y)
            + ' 105,95 L';
        $('#waves-path-2').attr('d', d2);
    }
});