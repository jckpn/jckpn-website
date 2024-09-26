$(function () {
    $(document).mousemove(function (event) {
        var mouseX = event.pageX / $(window).width() - 0.5;
        var mouseY = event.pageY / $(window).height() - 0.5;

        var sensitivity = 3;

        var rotateX = -mouseY * sensitivity;
        var rotateY = mouseX * sensitivity;

        // rotate cube
        $('.card').css('transform',
            'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)');
        $('.card-shadow').css('transform',
            'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(-50px)');
    });
});