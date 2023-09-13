$(function() {
    // basic email obfuscation
    $('.email-addr').text('jackpain' + 'e3' + '@g' + 'mail.com');
    $('.email-addr').on('click', function() {
        window.location.href = 'mailto:jackpa' + 'ine' + '3@gm' + 'ail.com';
    });

    // if url has #about, show about
    if (window.location.href.indexOf('#about') > -1) {
        $('body').addClass('show-about');
    }
        
    $('.about-link').click(() => { 
        // look like new url
        window.location.href = '#about';
        setTimeout(() => {
            $('body').addClass('show-about');
        }, 100); // brief 'loading' feel
    });
    $('.about-back').click(() => {
        window.location.href = '#';
        $('body').removeClass('show-about');
    });
});