/*
OptMeowt is licensed under the MIT License
Copyright (c) 2020 Kuba Alicki, David Baraka, Rafael Goldstein, Sebastian Zimmeck
privacy-tech-lab, https://privacy-tech-lab.github.io/
*/


/*
popup.js
================================================================================
popup.js supplements and renders complex elements on popup.html
*/


import { toggleListener } from "../whitelist.js";

/**
 * Initializes the popup window after DOM content is loaded
 * @param {Object} event - contains information about the event
 */
document.addEventListener("DOMContentLoaded", (event) => {
  var parsed_domain = '';

  /**
   * Queries, parses, and sets active tab domain to popup
   */
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    try {
      var url = new URL(tab.url);
      var parsed = psl.parse(url.hostname)
      parsed_domain = parsed.domain;
      console.log("POPUP: ", parsed_domain);
      if (parsed.domain === null) {
        document.getElementById("domain").innerHTML = location.href;
      } else {
        document.getElementById("domain").innerHTML = parsed.domain;
      }
    } catch (e) {
      document.getElementById("domain").innerHTML = location.href;
    }
  });

  /**
   * Sets enable/disable button to correct mode
   */
  chrome.storage.local.get(["ENABLED"], function (result) {
    if (result.ENABLED == undefined) {
      document.getElementById("img").src = "../assets/play-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Enable");
    } else if (result.ENABLED) {
      document.getElementById("img").src = "../assets/pause-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Disable");
      document.getElementById("content").style.opacity = "1";
      document.getElementById("message").style.opacity = "0";
      document.getElementById("message").style.display = "none";
    } else {
      document.getElementById("message").style.display = "";
      document.getElementById("img").src = "../assets/play-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Enable");
      document.getElementById("content").style.opacity = "0.1";
      document.getElementById("message").style.opacity = "1";
    }
  });

  /**
   * Listener for enable/disable extension switch
   */
  document.getElementById("enable-disable").addEventListener("click", () => {
    chrome.storage.local.get(["ENABLED"], function (result) {
      if (result.ENABLED) {
        document.getElementById("message").style.display = "";
        document.getElementById("img").src =
          "../assets/play-circle-outline.svg";
        document
          .getElementById("enable-disable")
          .setAttribute("uk-tooltip", "Enable");
        document.getElementById("content").style.opacity = "0.1";
        document.getElementById("message").style.opacity = "1";
        chrome.runtime.sendMessage({ ENABLED: false });
      } else {
        document.getElementById("img").src =
          "../assets/pause-circle-outline.svg";
        document
          .getElementById("enable-disable")
          .setAttribute("uk-tooltip", "Disable");
        document.getElementById("content").style.opacity = "1";
        document.getElementById("message").style.opacity = "0";
        document.getElementById("message").style.display = "none";
        chrome.runtime.sendMessage({ ENABLED: true });
      }
    });
  });

  /**
   * Sets whitelist switch to correct position and adds listener
   */
  chrome.storage.local.get(["DOMAINS"], function (result) {
    var s = ""
    if (result.DOMAINS[parsed_domain]) {
      s = `<input type="checkbox" id="input" checked/>
                      <span></span>`
    } else {
      s = `<input type="checkbox" id="input"/>
                      <span></span>`
    }
    document.getElementById("switch-label").innerHTML = s;
    toggleListener("input", parsed_domain);
  })
})

/**
 * Builds the requested domains HTML of the popup window
 * @param {Object} requests - Contains all request domains for the current tab 
 * (requests = tabs[activeTabID].REQUEST_DOMAINS; passed from background page)
 */
async function buildDomains(requests) {
  let items = "";
  for (var request_domain in requests) {
    items +=
      `
  <li class="uk-margin-small-left uk-margin-small-right">
    <div uk-grid class="uk-grid-row-collapse">
      <div
        class="uk-width-1-1"
        style="font-size: small; font-weight: bold;"
      >
        Request Domain:
      </div>
      <div class="uk-width-1-1 uk-text-break">
        ` +
      request_domain +
      `
      </div>
      <div
        class="uk-width-1-1 uk-margin-small-top"
        style="font-size: small; font-weight: bold;"
      >
        Responses: <span class="uk-badge" style="font-size: 10px; background-color: #cfd8dc; color:#37474f !important;">RECEIVED 0/`+Object.keys(requests[request_domain].URLS).length+`</span>
      </div>
      <div class="uk-width-1-1">
        None
      </div>
    </div>
  </li>
  `;
  }
  document.getElementById("urls").innerHTML = items;
}

/**
 * Sends "INIT" message to background page to start badge counter
 */
chrome.runtime.sendMessage({
  msg: "INIT",
  data: null,
});

/**
 * Listens for messages from background page that call functions to populate 
 * the popup badge counter and build the popup domain list HTML, respectively 
 */
chrome.runtime.onMessage.addListener(function (request, _, __) {
  if (request.msg === "BADGE") {
    document.getElementById("requests").innerText = request.data;
  }
  if (request.msg === "REQUESTS") {
    buildDomains(request.data);
  }
});

/**
 * Listener for Options page button click
 */
document.getElementById("more").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
