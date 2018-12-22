chrome.storage.sync.get("study", function (items) {
    if (Object.keys(items).length > 0) {
        window.location.href = chrome.extension.getURL('../block.html');
    } else {
        return;
    }
});