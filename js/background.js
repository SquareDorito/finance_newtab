/*chrome.webRequest.onBeforeRequest.addListener(
    function(details) {

        if(details.url.startsWith("https://facebook.com/")){            
            return {redirectUrl: chrome.extension.getURL('../block.html')};
        }
        return {redirectUrl: details.url};
    },
    {
        urls: [
            "<all_urls>"
        ],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking"]
);*/
