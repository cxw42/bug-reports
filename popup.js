chrome.runtime.connect().onMessage.addListener(msg => {
    document.getElementById('message').innerText =
`screenX: ${window.screenX}
screenY: ${window.screenY}
popup: ${JSON.stringify(msg, null, 2)}`
});
