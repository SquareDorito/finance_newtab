document.addEventListener("DOMContentLoaded", function () {
    chrome.management.getAll(getAllCallback);
});

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    var realmonth = monthIndex + 1

    $.get('http://numbersapi.com/' + realmonth.toString() + '/' + day.toString(), function (data) {
        $('#fact').html("<strong>Today's Fun Fact</strong>: " + data);
    });

    return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

var start = new Date('04/15/1998 4:00 PM');
var timer;

function age() {
    var now = new Date();
    var age = now.getTime() - start.getTime();
    var year = (age / 31556926000); // seconds in a year * 1000
    $('#age').html("You are " + "<strong>" + year.toFixed(9) + "</strong> years old.");
}

function setClasses(classes){
    classes=classes['classes'];
    console.log(classes.length)
    for(var i=0;i<classes.length;i++){
        console.log(classes[i][0]);
        $('#class-list').append('<li class="class-row"><span class="class-code">'+classes[i][0]+'</span> - '+classes[i][1]+'</li>')
    }
}

var getAllCallback = function (list) {
    var classes;
    chrome.storage.sync.get("classes", function (items) {
        if (Object.keys(items).length==0) {
            $.ajax({
                url: "http://127.0.0.1:5000/classes",
                type: "POST",
                data: JSON.stringify({
                    'username': "knoh1",
                    'password': "Kyunghyun12!"
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    chrome.storage.sync.set({ "classes": data }, function () {
                        console.log("Class data stored in Google Chrome Storage.");
                        setClasses(data);
                    });
                }
            });
        }else{
            chrome.storage.sync.get("classes", function (items) {
                setClasses(items);
            });
        }
    });

    
    timer = setInterval(age, 1);
    $("#time").empty()
    var date = "Todays Date: <strong>" + formatDate(new Date()) + "</strong>.";
    $("#time").append(date);
    $("#hello").fadeIn("slow", function () {
        // Animation complete
    });
    $("#time").fadeIn("slow", function () {
        // Animation complete
    });
    $("#age").fadeIn("slow", function () {
        // Animation complete
    });
    $("#fact").fadeIn("slow", function () {
        // Animation complete
    });

    /*$.post("http://127.0.0.1:5000/classes", { name: "John", time: "2pm" })
        .done(function (data) {
            alert("Data Loaded: " + data);
        });*/

    /*var apps = document.getElementById("apps");
    for (var i in list) {
        // we don't want to do anything with extensions yet.
        var extInf = list[i];
        if (extInf.isApp && extInf.enabled) {
            var app = document.createElement("div");

            var img = new Image();
            img.className = "image";
            img.src = find128Image(extInf.icons);
            img.addEventListener("click", (function (ext) {
                return function () {
                    chrome.management.launchApp(ext.id);
                };
            })(extInf));

            var name = document.createElement("div");
            name.className = "name";
            name.textContent = extInf.name;

            app.className = "app";
            app.appendChild(img);
            app.appendChild(name);
            apps.appendChild(app);
        }
    }*/
};

/*
var find128Image = function (icons) {
    for (var icon in icons) {
        if (icons[icon].size == "128") {
            return icons[icon].url;
        }
    }

    return "/noicon.png";
};

img.addEventListener("click", (function (ext) {
    return function () {
        chrome.management.launchApp(ext.id);
    };
})(extInf));*/