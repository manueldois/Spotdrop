console.log("Start")


$(document).ready(function() {
    var img_holders = $(".img-holder")
    var bck_img_num = img_holders.length-1;
    setInterval(function() {
        img_holders.eq(bck_img_num).toggleClass("transparent");
        bck_img_num--;
        if(bck_img_num < 0){
            bck_img_num = img_holders.length-1;
            img_holders.removeClass("transparent")
        }
    },2000);
  
    $('#btn-goto-tutorial').click(function (){
        $('html, body').animate({
            scrollTop: $("#div_tutorial").offset().top
        }, 500);
    })
});