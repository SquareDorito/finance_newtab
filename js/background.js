chrome.webRequest.onBeforeRequest.addListener(
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
);

chrome.browserAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript({
      code: 'document.body.style.backgroundColor="red"'
    });
  });
