chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        console.log(details.url);
        if(details.url.startsWith("https://facebook.com/")){
            //return {redirectUrl: chrome.runtime.getURL('../block.html')};
            //alert(chrome.runtime.getURL('../block.html'));
            alert(details);
            return {redirectUrl: "https://www.google.com"};
        }
    },
    {
        urls: [
            "<all_urls>"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking"]
);