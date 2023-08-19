$(function() {
    $('.about-link').click(function() {
        // basic email obfuscation
        $('.email-addr').text('jackpaine' + '3' + '@' + 'gmail.com');
        $('.email-addr').on('click', function() {
            window.location.href = 'mailto:jackpai' + 'ne3' + '@' + 'gmail.com';
        });

        $('body').addClass('show-about');
    });

    $('.about-back').click(function() {
        $('body').removeClass('show-about');
    });
});