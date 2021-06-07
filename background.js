/**
 * Author:    Ping Cheng Chung
 * Date:      4/20/2021
 *
 * I, Ping Cheng Chung, certify that I wrote this code from scratch and did
 * not copy it in part or whole from another source.  Any references used
 * in the completion of the assignment are cited in my README file and in
 * the appropriate method header.
 *
 * File Contents
 *
 *    this is js function for loading the UReserch panel, and add manu bar to right click manu.
 *
 *
 */

//check the domain
const regex = new RegExp('https:\/\/academic.microsoft.com\/paper\/[0-9]+');


function active_UResearch(info,tab) {
	
	
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
	if(!regex.test(url)){ //if the url is not research paper page, doing nothing
		return;
	}
	
	//add jquery to current webpage
	chrome.tabs.executeScript(null, {file:"./jquery.min.js"},()=> console.log("inject jqyery"))
	chrome.tabs.executeScript(null, {file:"./sweetalert.js"},()=> console.log("inject sweetalert"))
	//add my.js to current webpage
	chrome.tabs.executeScript(null, {file:"./font.js"},()=> console.log("inject my js"))
	
	//add my.css to current webpage
	chrome.tabs.insertCSS(null, {file:"./Ustyle.css"},()=> console.log("inject my css"));
	
});

}


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.action == "active-menu"){
		console.log("background-active menu");
		
		
		chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({
    title: "UResearch",
    id: 'MyItem',
    contexts: ["page"],
	onclick: active_UResearch
  });
});

		
      sendResponse({farewell: "start-menu"});
	}
  }
);



