/*
Button press for the minutes
*/
var timer;
timer = setInterval(update,1000);

$('#minutes').bind("enterKey", function (e) {
    var minutes = parseInt($('#minutes').val());

    if (minutes < 1 || isNaN(minutes)) {
        console.log("Not a valid number of minutes.")
        $('#minutes-form').addClass('error_shake');
        return;
    }

    if (confirm('Are you sure you want to turn study mode on for the next '+minutes.toString()+' minutes? This cannot be disabled until time runs out.')) {
        var d = new Date();
        var current = d.getTime();
        var end = current + 60000*minutes;
        chrome.storage.sync.set({ "study": end });
    } else {
        return;
    }
});

$('#minutes').keyup(function (e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});

$('#minutes-form').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
    $('#minutes-form').delay(200).removeClass('error_shake');
});

function update() {
    // Get todays date and time
    var now = new Date().getTime();
    chrome.storage.sync.get("study", function (items) {
        if (Object.keys(items).length > 0) {
            var distance = items["study"] - now;
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
            // Display the result in the element with id="demo"
            $('#countdown').html(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
        
            // If the count down is finished, write some text 
            if (distance < 0) {
                $('#countdown').empty();
                $("#countdown").hide();
                chrome.storage.sync.remove("study");
            }
        } else {
            $("#minutes").fadeIn("fast");
            $("#minutes-label").fadeIn("fast");
            $('#countdown').empty();
            $("#countdown").hide();
            return;
        }
    });
  }