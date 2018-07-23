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
  
    return monthNames[monthIndex]+' '+day + ', ' + year;
  }

var getAllCallback = function (list) {
    var apps = document.getElementById("apps");
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
    }
    $("#time").empty()
    var date = "Todays Date: "+formatDate(new Date());
    $("#time").append(date)
};

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
})(extInf));