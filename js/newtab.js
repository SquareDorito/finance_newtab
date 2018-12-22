document.addEventListener("DOMContentLoaded", function () {
    chrome.management.getAll(getAllCallback);
});

var weekDays = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
];

var weekDaysAbv = [
    "Sun","Mon","Tues","Wed","Thur","Fri","Sat"
];

$(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;
    $('#birthday').attr('max', maxDate);
});

function formatDate(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    var weekDays = [
        "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var day_of_week = date.getDay();

    var realmonth = monthIndex + 1

    $.get('http://numbersapi.com/' + realmonth.toString() + '/' + day.toString(), function (data) {
        $('#fact').html(data);
        var date = monthNames[monthIndex] + ' ' + day + ', ' + year;
        var date_tag = weekDays[day_of_week]+ ', ' + date;
        $('#time-month').html(monthNames[monthIndex]);
        $('#time-number').html(day);
        $('#time-day').html(weekDays[day_of_week]);
        $("#time").html(date_tag);
    });

    return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

var timer;

function age() {
    var now = new Date();
    var age = now.getTime() - start.getTime();
    var year = (age / 31556926000); // seconds in a year * 1000
    $('#age').html("You are " + "<strong style='font-size:32;color:rgba(0,0,0,0.6);'>" + year.toFixed(9) + "</strong> years old.");
}

function setClasses(classes) {
    classes = classes['classes'];
    console.log(classes.length)
    for (var i = 0; i < classes.length; i++) {
        console.log(classes[i][0]);
        $('#class-list').append('<li class="class-row"><span class="class-code">' + classes[i][0] + '</span> - ' + classes[i][1] + '</li>')
    }
}

function setup_name() {
    $("#enter-age").fadeOut("slow");
    $("#columns").fadeOut("slow");
    $(".age").fadeOut("slow");
    $("#clock-container").fadeOut("slow");
    $("#hello").fadeOut("slow");
    $(".main").fadeOut("slow", function () {
        $("#enter-name").fadeIn("slow");
    });
}

function setup_age() {
    $(".main").fadeOut("slow");
    $("#columns").fadeOut("slow");
    $(".age").fadeOut("slow");
    $("#clock-container").fadeOut("slow");
    $("#hello").fadeOut("slow");
    $("#enter-name").fadeOut("slow", function () {
        $("#enter-age").fadeIn("slow");
    });
}

function load_main() {
    $("#enter-name").fadeOut("slow", function () {
        $("#enter-age").fadeOut("slow", function () {
            $(".age").fadeIn("slow");
            $("#hello").fadeIn("slow");
            $("#columns").fadeIn("slow");
            $('#columns').css('display','grid');
            $("#clock-container").fadeIn("slow");
            $('#clock-container').css('display','flex');
            $(".main").fadeIn("slow");
        });
    });
}

var getAllCallback = function (list) {
    /*
    var classes;
    chrome.storage.sync.get("classes", function (items) {
        if (Object.keys(items).length==0) {
            $.ajax({
                url: "http://127.0.0.1:5000/classes",
                type: "POST",
                data: JSON.stringify({
                    'username': "user",
                    'password': "pw"
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
    });*/

    requestAnimationFrame(updateTime)

    function updateTime() {
        
        var d = new Date();
        document.documentElement.style.setProperty('--timer-day', "'" + weekDaysAbv[d.getDay()] + "'");
        document.documentElement.style.setProperty('--timer-hours', "'" + d.getHours().toString() + "'");
        document.documentElement.style.setProperty('--timer-minutes', "'" + d.getMinutes().toString() + "'");
        document.documentElement.style.setProperty('--timer-seconds', "'" + d.getSeconds().toString() + "'");
        requestAnimationFrame(updateTime);
    }

    $("#columns").hide();

    particlesJS.load('particles-js', 'particlesjs-config.json', function() {
        console.log('callback - particles.js config loaded');
    });

    chrome.history.search({text: '', maxResults: 10}, function(data) {
        data.forEach(function(page) {
            console.log(page.url);
        });
    });


    function handleDragStart(e) {
        this.style.opacity = '0.4';  // this / e.target is the source node.
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }

        e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

        return false;
    }

    function handleDragEnter(e) {
        // this / e.target is the current hover target.
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over');  // this / e.target is previous target element.
    }

    function handleDrop(e) {
        // this/e.target is current target element.

        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }

        // Don't do anything if dropping the same column we're dragging.
        if (dragSrcEl != this) {
            // Set the source column's HTML to the HTML of the column we dropped on.
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }

        return false;
    }

    function handleDragEnd(e) {
        // this/e.target is the source node.
        this.style.opacity = '1.0';
        [].forEach.call(cols, function (col) {
            col.classList.remove('over');
        });
    }

    var dragSrcEl = null;

    function handleDragStart(e) {
        // Target (this) element is the source node.
        this.style.opacity = '0.4';

        dragSrcEl = this;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    var cols = document.querySelectorAll('.column');
    [].forEach.call(cols, function (col) {
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragenter', handleDragEnter, false)
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
    });

    /*
    Button press for the name value
    */
    $('#first-name').bind("enterKey", function (e) {
        var first_name = $('#first-name').val();
        if (first_name == '') {
            console.log("Not a valid name.")
            $('#name-form').addClass('error_shake');
            return;
        }
        console.log(first_name);
        chrome.storage.sync.set({ "first-name": first_name });
        chrome.storage.sync.get("first-name", function (items) {
            console.log("Retrieved items: ");
            console.log(items['first-name']);
        });
        $('#hello').html('Hello ' + first_name + '.');
        setup_age();
    });
    $('#first-name').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
        }
    });

    $('#reset-button').click(function () {
        console.log("reset pressed")
        setup_name();
    });

    /*
    Button press for the birthday
    */
    $('#birthday').bind("enterKey", function (e) {
        var birthday = $('#birthday').val();
        if (birthday == '') {
            console.log("Not a valid date.")
            $('#age-form').addClass('error_shake');
            return;
        }
        console.log(birthday);
        chrome.storage.sync.set({ "birthday": birthday });
        window.clearInterval(timer);
        start = new Date(birthday);
        timer = setInterval(age, 1);
        load_main();
    });
    $('#birthday').keyup(function (e) {
        if (e.keyCode == 13) {
            $(this).trigger("enterKey");
        }
    });

    $('#name-form').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
        $('#name-form').delay(200).removeClass('error_shake');
    });

    $('#age-form').on('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
        $('#age-form').delay(200).removeClass('error_shake');
    });

    let temp = 0;
    let flag = 0;

    chrome.storage.sync.get("first-name", function (items) {
        if (Object.keys(items).length > 0) {
            console.log("preloaded name")
            $('#hello').html('Hello ' + items['first-name'] + '.');
            temp += 1;
        } else {
            console.log("setting up name")
            flag = 1
            setup_name();
        }
    });

    chrome.storage.sync.get("birthday", function (items) {
        if (Object.keys(items).length > 0) {
            console.log("preloaded date")
            start = new Date(items['birthday']);
            timer = setInterval(age, 1);
            load_main();
        } else {
            if (flag == 0) {
                console.log("setting up age")
                setup_age();
            }
        }
        formatDate(new Date());
    });
    $("#ratty-status").html("Status: <span style='color:red'>Closed</span>");
};