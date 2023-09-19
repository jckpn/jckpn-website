$(function() {
    // image scroll parallax
    navbarTriggerY = $('.navbar-container').offset().top + $('.navbar-container').height() - 40; // 40 is height of stuck navbar

    $(window).scroll(function() {
        var wScroll = $(this).scrollTop();

        $('.content-container').css({
            'background-position' : 'center '+ wScroll/5 +'px'
        });

        if (wScroll > navbarTriggerY) {
            $('.navbar').addClass('stuck');
        } else {
            $('.navbar').removeClass('stuck');

            $('img.big-header-bg').css({
                'transform' : 'translateY(' + -wScroll/5 + 'px)'
            });
        }
    });
});

$(window).on("load", () => {
    $('body').addClass('page-loaded');
}); // once images loaded too