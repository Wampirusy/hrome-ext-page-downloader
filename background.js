chrome.action.onClicked.addListener(async (tab) => {
    if (chrome.action.getBadgeText({tabId: tab.id})) {
        var delay = 1000; // Delay in milliseconds (adjust as needed)

        var pipeline = chrome.action.setBadgeText({text: 'On'})
            .then((string) => chrome.scripting.executeScript({
                target: {tabId: tab.id},
                func: ping,
                args: ['start'],
            }));

        fetch('link2.json')
            .then(response => response.json())
            .then(jsonArray => {
                jsonArray.forEach(function (item, key) {
                    pipeline = pipeline.then(
                        (string) =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    chrome.tabs.update(tab.id, {url: item});
                                    resolve(string);
                                }, delay / 10);
                            })
                    ).then(
                        (string) =>
                            new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    chrome.scripting.executeScript({
                                        target: {tabId: tab.id},
                                        func: click,
                                        args: [item, key],
                                    });
                                    resolve(string);
                                }, delay);
                            })
                    );
                });
            })
            .then(() => {
                    pipeline.then(
                        (string) => new Promise((resolve, reject) => {
                            setTimeout(() => {
                                chrome.scripting.executeScript({
                                    target: {tabId: tab.id},
                                    func: ping,
                                    args: ['done'],
                                });
                                chrome.action.setBadgeText({text: ''});
                                resolve(string);
                            }, 100);
                        })
                    );
                }
            )
            .catch(error => console.error('Fetch error:', error));
    }
});

function ping(text) {
    console.log('ping: ' + text);
}

function click(link, key) {
    const downloadLink = document.getElementsByClassName('export');
    downloadLink.item(0).click();

    console.log('click: ' + key + ' ' + link);
}

function parse(link, key) {
    /*
     for json page:
     const content = document.documentElement.innerText;
     const htmlData = new Blob([content], {type: 'application/json'});
     downloadLink.setAttribute('download', 'data' + (key + 1) + '.json');
     */

    const content = document.documentElement.innerHTML;

    //Create a temporary link element and send txt for downloading
    const htmlData = new Blob([content], {type: 'text/html'});
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(htmlData);
    downloadLink.setAttribute('download', 'data' + (key + 1) + '.html');
    downloadLink.click();

    window.location.href = link;
}