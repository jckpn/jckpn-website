$(function() {
    // if old url contains jckpn.com, redirect to new url
    if (window.location.href.includes('jckpn.com')) {
        window.location.href = 'https://gptyper.net';
    }

    if (window.innerWidth <= 620) {
        $('.carousel-item video source').attr('src', '/assets/landing/demo-vid-mob.mp4');
    } else {
        $('.carousel-item video source').attr('src', '/assets/landing/demo-vid.mp4');
    }

    return; // renable once demo videos added

    const numCarouselItems = 4;
    for (let i = 1; i <= numCarouselItems; i++) {
        console.log('adding listener to .carousel-indicator-dot-' + i);
        $('.carousel-link-' + i).on('click', () => {
            updateCarousel(i);

            $('html, body').animate({
                scrollTop: $('.carousel').offset().top
            }, 500);
        });
    }

    updateCarousel(1);
    
    
    var carouselInterval;
    var carouselIndex = 1;
    function updateCarousel(newIndex) {
        carouselIndex = newIndex;
        if (carouselIndex > numCarouselItems) carouselIndex = 1;
        if (carouselIndex < 1) carouselIndex = numCarouselItems;

        $('.carousel-item').removeClass('carousel-item-visible');
        $('.carousel-item-' + carouselIndex).addClass('carousel-item-visible');

        $('.carousel-link-active').removeClass('carousel-link-active');
        $('.carousel-link-' + carouselIndex).addClass('carousel-link-active');

        clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            updateCarousel(carouselIndex + 1);
        }, 6000);
    }
});
