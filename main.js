$(function() {
    // basic email obfuscation
    $('.email-addr').text('jackpain' + 'e3' + '@g' + 'mail.com');
    $('.email-addr').on('click', function() {
        window.location.href = 'mailto:jackpa' + 'ine' + '3@gm' + 'ail.com';
    });
    
    $('.about-link').click(() => { $('body').addClass('show-about'); });
    $('.about-back').click(() => { $('body').removeClass('show-about'); });
});