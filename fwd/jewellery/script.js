$(function() {
    // image scroll parallax
    navbarTriggerY = $('.navbar-container').offset().top + $('.navbar-container').height(); // 40 is height of stuck navbar

    $(window).scroll(function() {
        var wScroll = $(this).scrollTop();

        // $('.content-container').css({
        //     'background-position' : 'center '+ -wScroll/5 +'px'
        // });

        if (wScroll > navbarTriggerY) {
            $('.navbar').addClass('stuck');
        } else {
            $('.navbar').removeClass('stuck');

            $('img.big-header-bg').css({
                'transform' : 'translateY(' + -wScroll/5 + 'px)'
            });
        }
    });

    // add click to images - just open image url in new tab
    $('.content-container img').click(function() {
        window.open($(this).attr('src'), '_blank');
    });

    // add click to contact buttons
    $('.phone-click').click(function() {
        window.open('tel:+420608123456', '_blank');
    });
    $('.email-click').click(function() {
        window.open('mailto:pamperpartiesoxfordshire@gmail.com');
    });
});

$(window).on("load", () => {
    $('body').addClass('page-loaded');
}); // once images loaded too