$(function() {
    // basic email obfuscation
    $('.email-addr').text('jackpain' + 'e3' + '@g' + 'mail.com');
    $('.email-addr').on('click', function() {
        window.location.href = 'mailto:jackpa' + 'ine' + '3@gm' + 'ail.com';
    });
    
    $('.about-link').click(() => { 
        // look like new url
        window.location.href = '#about';
        $('body').addClass('show-about');
    });
    $('.about-back').click(() => {
        window.location.href = '#';
        $('body').removeClass('show-about');
    });
});