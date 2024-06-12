(function() {
    var isStart = false;

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    if(location.href.includes("namu.wiki/RandomPage")) {
        sleep(600).then(function() {
            var li = document.querySelectorAll("div ul li");
            var fromText = li[0].innerText;
            if(fromText.split("/").length != 0) {
                fromText = fromText.split("/")[0];
            }
            chrome.storage.local.set({ fromDoc: fromText }, function() {});
            var toText = li[2].innerText;
            if(toText.split("/").length != 0) {
                toText = toText.split("/")[0];
            }
            chrome.storage.local.set({ toDoc: toText }, function() {});
            location.href = "https://namu.wiki/w/" + fromText;
        })
    } else {
        chrome.storage.local.get(["fromDoc", "toDoc"], function(items) {
            document.querySelector("#nw-game-from-text").innerText = "시작: " + items["fromDoc"];
            document.querySelector("#nw-game-to-text").innerText = "도착: " + items["toDoc"];
        })
    }

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for(var key in changes) {
            if(key == "fromDoc") {
                document.querySelector("#nw-game-from-text").innerText = "시작: " + changes[key].newValue;
            } else if(key == "toDoc") {
                document.querySelector("#nw-game-to-text").innerText = "도착: " + changes[key].newValue;
            }
        }
    })

    var t = null;

    window.onload = function() {
        chrome.runtime.sendMessage({action: "isStart"});
        t = setInterval(function() {
            chrome.runtime.sendMessage({action: "isStart"});
            if(isStart && location.href.includes("namu.wiki/w")) {
                var current = decodeURI(location.href).split("w/")[1];
                if(current.includes("from=")) {
                    current = current.split("?from=")[1];
                }
                chrome.runtime.sendMessage({action: "addCount", data: current});
                chrome.storage.local.get(["toDoc"], function(items) {
                    if(current == items["toDoc"]) {
                        chrome.runtime.sendMessage({action: "stop"});
                        document.querySelector(".nw-game-status").innerText = "게임 클리어!";
                        document.querySelector("#nw-div-btn").style.display = "block";
                        document.querySelector(".nw-start-button").style.display = "block";
                        document.querySelector(".nw-stop-button").style.display = "none";
                        clearInterval(t);
                    }
                })
            }
        }, 500)
    }

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if(typeof message.min != "boolean") {
            document.querySelector(".nw-game-time").innerText = message.min + "분 " + message.sec + "초";
            document.querySelector(".nw-game-count").innerText = "문서 이동: " + message.count + "회";
        } else {
            isStart = message.min;
            if(isStart) {
                document.querySelector("#nw-div-btn").style.display = "none";
                document.querySelector(".nw-stop-button").style.display = "block";
                document.querySelector(".nw-start-button").style.display = "none";
            } else {
                document.querySelector("#nw-div-btn").style.display = "block";
                document.querySelector(".nw-start-button").style.display = "block";
                document.querySelector(".nw-stop-button").style.display = "none";
            }
        }
      });

    function getRandomDoc() {
        location.href = "https://namu.wiki/RandomPage";
    }

    function createOverlay() {
        var container = document.createElement("div");
        container.setAttribute("class", "nw-game-container");
        
        var span = document.createElement("div");
        span.setAttribute("class", "nw-game-text");
        span.setAttribute("id", "nw-game-from-text");
        container.appendChild(span);

        var span2 = document.createElement("div");
        span2.setAttribute("class", "nw-game-text");
        span2.setAttribute("id", "nw-game-to-text");
        container.appendChild(span2);

        var btnDiv = document.createElement("div");
        btnDiv.setAttribute("id", "nw-div-btn");
        container.appendChild(btnDiv);

        var button = document.createElement("div");
        button.setAttribute("class", "nw-from-button");
        button.setAttribute("id", "nw-button");
        button.innerHTML = "랜덤 문서 뽑기";
        button.onclick = function(e) {
            getRandomDoc();
        }
        btnDiv.appendChild(button);

        var buttonF = document.createElement("div");
        buttonF.setAttribute("class", "nw-from-button");
        buttonF.setAttribute("id", "nw-button");
        buttonF.innerHTML = "현재 문서를 시작으로";
        buttonF.onclick = function(e) {
            var current = decodeURI(location.href).split("w/")[1];
            if(current.includes("from=")) {
                current = current.split("?from=")[0];
            }
            if(current.split("/").length != 0) {
                current = current.split("/")[0];
            }
            chrome.storage.local.set({ fromDoc: current }, function() {});
            document.querySelector("#nw-game-from-text").innerText = "시작: " + current;
        }
        btnDiv.appendChild(buttonF);

        var buttonT = document.createElement("div");
        buttonT.setAttribute("class", "nw-from-button");
        buttonT.setAttribute("id", "nw-button");
        buttonT.innerHTML = "현재 문서를 도착으로";
        buttonT.onclick = function(e) {
            var current = decodeURI(location.href).split("w/")[1];
            if(current.includes("from=")) {
                current = current.split("?from=")[0];
            }
            if(current.split("/").length != 0) {
                current = current.split("/")[0];
            }
            chrome.storage.local.set({ toDoc: current }, function() {});
            document.querySelector("#nw-game-to-text").innerText = "도착: " + current;
        }
        btnDiv.appendChild(buttonT);

        var btnDiv2 = document.createElement("div");
        btnDiv2.setAttribute("id", "nw-div-btn2");
        container.appendChild(btnDiv2);

        var button2 = document.createElement("div");
        button2.setAttribute("class", "nw-start-button");
        button2.setAttribute("id", "nw-button");
        button2.innerHTML = "시작하기";
        button2.onclick = function(e) {
            chrome.runtime.sendMessage({action: "start"});
            chrome.storage.local.get(["fromDoc"], function(items) {
                chrome.runtime.sendMessage({action: "setTemp", data: items["fromDoc"]});
                location.href = "https://namu.wiki/w/" + items["fromDoc"];
            })
        }
        btnDiv2.appendChild(button2);

        var button3 = document.createElement("div");
        button3.setAttribute("class", "nw-stop-button");
        button3.setAttribute("id", "nw-button");
        button3.innerHTML = "그만하기";
        button3.onclick = function(e) {
            if(t != null) {
                clearInterval(t);
            }
            chrome.runtime.sendMessage({action: "stop"});
            document.querySelector("#nw-div-btn").style.display = "block";
            document.querySelector(".nw-start-button").style.display = "block";
            this.style.display = "none";
            document.querySelector(".nw-game-status").innerText = "";
            document.querySelector(".nw-game-count").innerText = "";
            document.querySelector(".nw-game-time").innerText = "";
        }
        btnDiv2.appendChild(button3);

        var statusText = document.createElement("div");
        statusText.setAttribute("class", "nw-game-status");
        container.appendChild(statusText);

        var countText = document.createElement("div");
        countText.setAttribute("class", "nw-game-count");
        container.appendChild(countText);

        var timeText = document.createElement("div");
        timeText.setAttribute("class", "nw-game-time");
        container.appendChild(timeText);

        document.body.appendChild(container);
    }

    createOverlay();
})();