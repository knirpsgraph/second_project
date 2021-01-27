$(function () {
    var btnStartseite = $('.card-body-startseite');
    var navbar = $('#navigationsleiste_small');
    btnStartseite.on('mouseover', opacityFunc);
    btnStartseite.on('mouseleave', opacityFuncBack);
    navbar.on('mouseover', opacityFunc);
    navbar.on('mouseleave', opacityFuncBack);
});
function opacityFunc(event) {
    $(event.currentTarget).animate({
        opacity: 1.0
    }, 50);
}
function opacityFuncBack(event) {
    $(event.currentTarget).animate({
        opacity: 0.7,
    }, 500);
}
