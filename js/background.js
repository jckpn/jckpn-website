$(() => {
    // reload page properly to get animation
    var e = performance.getEntriesByType("navigation");
    if (e.length > 0 && e[0].type === "back_forward") {
        window.location.reload();
    }

    updateBG(0, 0);

    // on move mouse
    $(document).on('mousemove', function (e) {
        // if page width is less than 400px, don't do anything as mobile
        if ($(window).width() < 600) return;

        // see if hovering over .links-container element
        hoveringLink = $(e.target).closest('.links-container').length > 0;

        // get mouse x and y as % of window from center
        mouseX = e.pageX / $(window).width() * 100 - 50;
        mouseY = e.pageY / $(window).height() * 100 - 50;

        updateBG(mouseX, mouseY);
    });

    function updateBG(mouseX, mouseY) {
        x = mouseX * 0.05;
        y = mouseY * 0.08;

        const d1 = 'M -5,105 L -5,' + (70 + x + y)
            + ' C 40,100'
            + ' ' + (40 + x) + ',' + (50 - x + y)
            + ' 105,105 L';
        
        x = mouseX * 0.12;
        y = mouseY * 0.12;

        const d2 = 'M -5,105 L -5,' + (55 + x + y)
            + ' C 60,120'
            + ' ' + (40 + x) + ',' + (50 - x + y)
            + ' 105,95 L';

        $('#waves-path-1').attr('d', d1);
        $('#waves-path-2').attr('d', d2);
    }
});