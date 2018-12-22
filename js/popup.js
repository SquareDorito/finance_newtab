/*
Button press for the minutes
*/
$('#minutes').bind("enterKey", function (e) {
    var minutes = parseInt($('#minutes').val());

    if (minutes < 1) {
        console.log("Not a valid number of minutes.")
        $('#minutes-form').addClass('error_shake');
        return;
    }

    if (confirm('Are you sure you want to turn study mode on for the next '+minutes.toString()+' minutes? This cannot be disabled until time runs out.')) {
        // Save it!
    } else {
        return;
    }



    chrome.storage.sync.set({ "birthday": birthday });


    start = new Date(birthday);

});

$('#minutes').keyup(function (e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});

$('#minutes-form').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
    $('#minutes-form').delay(200).removeClass('error_shake');
});