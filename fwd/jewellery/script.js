$(function() {
    navbarTriggerY = $('.navbar-container').offset().top
        + $('.navbar-container').height() - 40; // 40 is height of stuck navbar

    // clone navbar and add it to the bottom of the page
    $('.navbar').clone().appendTo('.navbar-container').addClass('stuck');

    $(window).scroll(function() {
        var wScroll = $(this).scrollTop();

        // $('.content-container').css({
        //     'background-position' : 'center '+ -wScroll/5 +'px'
        // });

        if (wScroll > navbarTriggerY) {
            $('.navbar.stuck').addClass('visible');
        } else {
            $('.navbar.stuck').removeClass('visible');

            // header image parallax effect
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

    // add click to navbar buttons - smoothly scroll to section
    $('.navbar a').click(function() {
        var section = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(section).offset().top - 25
        }, 500);
    });
});

$(window).on("load", () => {
    $('body').addClass('page-loaded');
}); // once images loaded too