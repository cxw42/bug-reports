// === Toggle the popup on browser action ====================================

// State of the popup
let popup = {
    cwin_id: undefined,
    left: 0, top: 0, width: 300, height: 400,
};

// Parameters to the last chrome.windows.create() call
let last_created = {};

let getCWinGeometry, isLastError;    // forwards

// Callback when the popup is opened
function onPopupOpened(win) {
    popup.cwin_id = win.id;
    chrome.windows.update(win.id, {focused:true});

    // *** Save the popup's size to use next time it's opened ***
    chrome.windows.get(popup.cwin_id, (cwin)=>{
        if(isLastError()) { return; }
        getCWinGeometry(cwin, popup);
    });
}

// When the icon is clicked in Chrome, toggle the popup
let onClickedListener = function(tab) {
    if (typeof popup.cwin_id === "undefined") {        // Open the popup
        // *** Open the popup using the saved size ***
        last_created = {   'url': chrome.runtime.getURL('popup.html'),
            'type': 'popup', 'left': popup.left,
            'top': popup.top, 'width': popup.width,
            'height': popup.height,
        };
        console.log('Creating popup: ' + JSON.stringify(last_created));
        chrome.windows.create(last_created, onPopupOpened);
    } else {    // There's currently a popup open - close it
        chrome.windows.remove(popup.cwin_id);
        popup.cwin_id = undefined;
    }
} //onClickedListener()

chrome.browserAction.onClicked.addListener(onClickedListener);

// === Tell the popup its Chrome size ========================================

chrome.runtime.onConnect.addListener(port => {
  port.postMessage({popup, last_created});
});

// === Helpers ===============================================================

/// Get the geometry of a window, as an object, from a Chrome window record.
getCWinGeometry = function(cwin, popup)
{
    popup.left = cwin.left || 0;
    popup.top = cwin.top || 0;
    popup.width = cwin.width || 300;
    popup.height = cwin.height || 600;
    popup.winState = cwin.state || 'normal';
} //getWindowGeometry

isLastError = function() { return (typeof(chrome.runtime.lastError) !== 'undefined'); }
