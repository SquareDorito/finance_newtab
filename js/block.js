particlesJS.load('particles-js', 'particlesjs-config.json', function() {
    console.log('callback - particles.js config loaded');
});

var r = Math.floor(Math.random() * 2); 
if(r==1){
    $('#msg').html('Site blocked in study mode.');
}else{
    var name="";
    chrome.storage.sync.get("first-name", function (items) {
        if (Object.keys(items).length > 0) {
            $('#msg').html('Are you serious, '+items['first-name']+'?!');
        }else{
            $('#msg').html('Get your ass back to work.');
        }
    });
}
// TODO: add time remaining
//$('#time-left').html("<p>hi</p>");