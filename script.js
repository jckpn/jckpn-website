$(function () {
    $(document).mousemove(function (event) {
        var mouseX = event.pageX;
        var mouseY = event.pageY;

        var sensitivity = 0.1;

        var rotateX = -mouseY * sensitivity;
        var rotateY = mouseX * sensitivity;

        // rotate cube
        $('.cube').css('transform',
            'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)');
    });
});