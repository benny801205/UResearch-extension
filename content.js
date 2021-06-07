



var requestData = {"action": "createContextMenuItem"};
//send request to background script to add menu bar to right click menu
chrome.runtime.sendMessage({action: "active-menu"}, function(response) {
  console.log(response.farewell);
});
