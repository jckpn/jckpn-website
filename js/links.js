$(() => {
    $('.link-about').click(() => {
        $('.container').addClass('container-hidden');
        $('.about-container').removeClass('container-hidden');
        $('.background').addClass('background-up');
    });

    $('.link-contact').click(() => {
        $('.container').addClass('container-hidden');
        $('.contact-container').removeClass('container-hidden');
        $('.background').addClass('background-up');
    });
    
    $('.back-button').click(() => {
        $('.container').addClass('container-hidden');
        $('.title-container').removeClass('container-hidden');
        $('.background').removeClass('background-up');
    });

    $('.title-container').removeClass('container-hidden');
    $('.background').removeClass('background-up');
});