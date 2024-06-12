var min = 0;
var sec = 0;
var count = 0;
var tempDoc = "";
var isStart = false;
var interval;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.action == "start") {
        isStart = true;
        min = 0;
        sec = 0;
        count = 0;
        interval = setInterval(function() {
            applyTime();
            sendMessageToCurrentPage(min, sec, count);
        }, 1000)
    } 
    if(request.action == "stop") {
        isStart = false;
        min = 0;
        sec = 0;
        count = 0;
        clearInterval(interval);
    }
    if(request.action == "addCount") {
        if(request.data != tempDoc) {
            tempDoc = request.data;
            count++;
        }
    }
    if(request.action == "setTemp") {
        tempDoc = request.data;
    }
    if(request.action == "isStart") {
        sendMessageToCurrentPage(isStart, null, null);
    }
});

function applyTime() {
    sec++;
    if(sec > 59) {
        min++;
        sec = 0;
    }
}

const sendMessageToCurrentPage = (min, sec, count) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (pages) => {
      chrome.tabs.sendMessage(pages[0].id, { min, sec, count});
    });
  }