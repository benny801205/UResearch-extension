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
 *    this is js function for download paper list
 *
 *
 */
{


//initialize 
var id_;
var title;
var regex = new RegExp('https:\/\/academic.microsoft.com\/paper\/[0-9]+');
var paper_list;
var received_req;
var total;
var request_counter;
var error_counter;
var state =""
//check if the div exist
if(document.querySelector('#Uresearch_popup'))
{
	//remove everything first, then add again
	$('#Uresearch_popup').remove();

}
console.log("add tool panel");
var d1 = document.createElement('div');
d1.id="Uresearch_popup";

//add my panel html to current page.
d1.insertAdjacentHTML('beforeend', '<div>URsearch Tool<button class="reload_icon" id="refresh_button">&#x21bb;</button>\
<button id="close_button">X</button></div><div id=U_title></div><div id=U_ID></div>\
<div id="citations_div"><button type="button" id="citation_button">Download Citations</button></div>\
<div id="ref_div"><button type="button" id="ref_button">Download References</button></div>\
<div id="myProgress" style="display: none;">\
 <div id="myBar">Downloading</div></div>');
document.querySelector('body').appendChild(d1);
refresh();


////////////////      function area              //////////////////////////////////////////////////////

//a class to restore the paper's information
class Research_paper {
  constructor(title, paper_abstract, paper_id,year,source,authors,label,institutions,citations) {
    this.title=title;
	this.paper_abstract=paper_abstract;
	this.paper_id=paper_id;
	this.year=year;
	this.source=source;
	this.authors=authors;
	this.label=label;
	this.institutions=institutions
	this.citations = citations
  }
toString() {
     return "\""+this.title+"\"" + "," + "\"" + this.paper_abstract + "\"" + "," + this.year + "," + 
	 this.source + "," +"\""+ this.authors +"\""+ "," + "\"" + this.label + "\""+",\"" + this.institutions + "\""+",\"" + this.citations + "\"";
}
}


//close button
$("#close_button").on("click", function () {
	$('#Uresearch_popup').hide();

});



/////////////////////////////Unity Functions//////////////////////////////////////////////////

//fetch title and id from current paper,and reinitialize the download button and progress bar.
function refresh(){
	console.log("runnig Refresh")
	let url=window.location.href;
	let array=url.split("\/");
	id_ = array[4]
	document.querySelector("#U_ID").textContent="Paper ID: "+ array[4];
	title=(document.querySelector("h1.name").textContent).trim();
	
	document.querySelector("#U_title").textContent= "Paper: "+ fn(title,45);
	
	//re-add download button if needs
	var lin=document.querySelector(".download_link")
 	if(lin){
		
		reset_progressbar();
		$("#citation_button").show();
		$("#ref_button").show();
		$(".download_link").remove();
		$("#myProgress").hide();
	} 

}
// re set the progress bar to 1%
function reset_progressbar(){
	
	$("#myBar").css("width","1%")
					.text("Downloading")
}


//a method to restrict the output length
function fn(text, count){
    return text.slice(0, count) + (text.length > count ? "..." : "");
}


// export a csv file link  
//reference:https://stackoverflow.com/questions/8714007/how-can-i-have-export-as-csv-button-in-chrome-extension/8715163
function getCSVLinkElement(link_name,file_name){

    let link_ = document.createElement("a");
    link_.textContent = link_name;
    link_.download = file_name+".csv";
	link_.className="download_link";
    let csvString = "Title,Abstract,Year,Source,Author,Label,Institutions,Citations\n";
	paper_list.forEach(x=> csvString = csvString + x.toString()+"\n");
	
	let csvData = new Blob(["\uFEFF"+csvString], {
    type: 'data:text/csv;charset=utf-16'
});
	
    link_.href = URL.createObjectURL(csvData);

    return link_;

}

//It call getCSVLinkElement to get a <a> with download link, and append it to the panel
function Download_set(){
	console.log("make a file with " + paper_list.size)
	if (state =="ref"){
		link_=getCSVLinkElement("Ready to Download References","References");
		$("#ref_button").hide();
		$("#ref_div").append(link_);
		//enable the download citattion button
		$("#citation_button").prop("disabled",false);
		}
		
	if(state == "citation"){
		link_=getCSVLinkElement("Ready to Download Citations","Citations");
		$("#citation_button").hide();
		$("#citations_div").append(link_);
		//enable the download ref button
		$("#ref_button").prop("disabled",false);
		}
	reset_progressbar();
	
}

//since the Microsoft server has request limit, it need to wait a few seconds to send requests.
function setTimeout_request(JSON_data,re_try,delay_time){
	
	setTimeout(() => {  send_request(JSON_data,re_try++); }, delay_time);
}



//sending Microsoft API request
function send_request(JSON_data,re_try=0){
	if(re_try>3){
		received_req++;
		return;
	}
	$.ajax({
		type: 'POST',
        contentType: "application/json; charset=utf-8",
        url: "https://academic.microsoft.com/api/search",
		data:JSON_data,
		success: function (response) {
			received_req++;
			collect_single_page(response);
			//update prograss bar
			
			percentage = Math.ceil(received_req*100/request_counter) +"%"
	
			$("#myBar").css("width",percentage)
					.text(percentage)
			
			if(received_req==request_counter){
				//upload 
				Download_set();
				$("#myProgress").hide();
			}
			
		},
			
		error: function(response){
			//if the request failed, it will send again after this delay time, and it will retry 5 times,then it will give up on this request.
			error_counter++;
			let waiting_Q=request_counter-received_req+error_counter+10;  //+10 as buffer
			let delay_time=(waiting_Q/7 * 10000);
			
			setTimeout(() => {  send_request(JSON_data,re_try++); }, delay_time);
			console.log("page request failed,resend in "+delay_time/1000 +" seconds retry "+re_try+" times");
		}
	}) 
	
}


// CSV can not display some specfic character,so it will replace them bfroe export to csv file
function replace_Unicode_Character(string){
	
	string=string.replaceAll("\"" , "\"\"");
	string=string.replaceAll("“" , "\"\"");
	string=string.replaceAll("”" , "\"\"");
	string=string.replaceAll("‘" , "'");
	string=string.replaceAll("’" , "'");
	return string;
}


//fetch the data from paper's JSON and return a Research_paper object
function collect_single_paper(current_paper){
	current_abstract=current_paper["d"];
	current_abstract=replace_Unicode_Character(current_abstract);
	
    current_title=current_paper["dn"];
	current_title=replace_Unicode_Character(current_title);
	
    current_id=current_paper["id"]
    citations = current_paper["eccnt"]
    source=""
    if(current_paper["s"].length!=0){
         source=current_paper["s"][0]["link"]
	}
    current_year=current_paper["v"]["publishedYear"]
    
    current_label=current_paper["v"]["displayName"]
    
    var authors=""
    //get authors
	var institution_set= new Set()
	authors_array=current_paper["a"];
	authors_array.forEach(function(arrayItem){
		if(authors !=""){
            authors= authors +", ";}
		authors = authors+arrayItem["dn"];
		institution_set.add(arrayItem["i"][0]["dn"]);
			});
	
    current_insts= Array.from(institution_set).join(',')
    return new Research_paper(current_title, current_abstract, current_id,current_year,source,authors,current_label,current_insts,citations); 
}


//each page has 10 papers, call collect_single_paper to collect paper's info 
function collect_single_page(page_dic){
	t= page_dic["pr"].length
    total=total +t;
    for(i=0;i<t;i++){
		p=collect_single_paper(page_dic["pr"][i]["paper"]);
		paper_list.add(p);
	}
    
	console.log("collected:"+total+" set size:"+paper_list.size);
}

//check if the download progress is done. if it's done, it will call Download_set() to generate the link 
function check_progress(){
	//no request in queue
	if(request_counter==0){
		Download_set()
		$("#myProgress").hide();
	}
}



////////////////////////////////UI actions//////////////////////////////////////////////////////////////////

//action of refresh button, and remove download link and put download button back
$("#refresh_button").on("click", function () {
	let url=window.location.href;
	//if it is on correct page
	if(!regex.test(url)){ //if the url is not research paper page, doing nothing
		
		alert("This is not a paper page");
		return;

	}
	else{
		refresh();

	}
});

//action of click download citation button, A confirm dialog will pop up before download
$("#citation_button").on("click", function () {
	
	Swal.fire({
		title: 'Do not download multi-papers in the same time.',
		text: "Too many requests may cause request timeout",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, download it!'
}).then((result) => {
  if (result.isConfirmed) {
		start_download_citation();
  }
})
});

//action of click download reference button, A confirm dialog will pop up before download
$("#ref_button").on("click", function () {
	
	Swal.fire({
		title: 'Do not download multi-papers in the same time.',
		text: "Too many requests may cause request timeout",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, download it!'
}).then((result) => {
  if (result.isConfirmed) {
		start_download_ref();
  }
})

});

//////////////////////////////Download Citations//////////////////////////////////////////////////////
 
 //collecting data of each year separately
function collect_each_year(title,id_,year){
	
	let skip=0;
	let local_year=year;
	url="https://academic.microsoft.com/api/search";
	
	//need a extra request first for how many papers
	
		
	$.ajax({
		type: 'POST',
        contentType: "application/json; charset=utf-8",
        url: "https://academic.microsoft.com/api/search",

		
		data:JSON.stringify({
            "query":title,
            "queryExpression":"RId=" + id_,
            "filters":["Y>="+ local_year,"Y<="+local_year],
            "orderBy":0,
            "skip":0,
            "sortAscending":true,
            "take":10,
            "includeCitationContexts":true,
            "parentEntityId":id_,
            "profileId":""
            }),
		
		success: function (response) {
			collect_single_page(response);
			
			let amount_paper= response["t"];
			console.log("year "+local_year+" has "+amount_paper+" papers" );
			for(i=0; i<49;i++){
				skip=skip+10;
				if(skip >= amount_paper){
					break;
				}
				request_counter++;
				
				JSON_data=JSON.stringify({
				"query":title,
				"queryExpression":"RId=" + id_,
				"filters":["Y>="+ local_year,"Y<="+local_year],
				"orderBy":0,
				"skip":skip,
				"sortAscending":true,
				"take":10,
				"includeCitationContexts":true,
				"parentEntityId":id_,
				"profileId":""
            });
			//let delay_time=Math.random()*1500000;
			let delay_time = Math.ceil(request_counter/6)*10000
			
			setTimeout_request(JSON_data,0,delay_time);
		
			
		
	}},
			
		error: function(response){
			
			
			let delay_time=Math.random()*10000;
			//reconsider the delay time
			setTimeout_request(JSON_data,re_try,delay_time);
			console.log("" + local_year + "first request failed,resend in "+delay_time/1000 +" seconds");
		}
	}) 
}
 
 //sending the first request to API server to collect some basic information of the target paper like: years, number of papers
function start_pre_download_citation(){
	
	
	console.log("current downloading:"+id_)
	//remove download button,and add prograss bar
	
	//send the first request to get the year_list
	$.ajax({
		type: 'POST',
        contentType: "application/json; charset=utf-8",
        url: "https://academic.microsoft.com/api/search",

		
		data:JSON.stringify({
            "query":"Micro-Structured Two-Component 3D Metamaterials with Negative Thermal-Expansion Coefficient from Positive Constituents",
            "queryExpression":"RId=" + id_,
            "filters":[],
            "orderBy":0,
            "skip":0,
            "sortAscending":true,
            "take":10,
            "includeCitationContexts":true,
            "parentEntityId":id_,
            "profileId":""
            }),
		
		success: function (response) {
			years = response["f"][5]["fi"]
			console.log(years.length+" years on list")
			
			years.forEach(function(arrayItem){
				let year = arrayItem["dn"];
				collect_each_year(title,id_,year);
			});
		},
		error: function(response){
			
			console.log("years request failed");
		}

	}) 
}

 //initialize counters, set views, and start download citation
function start_download_citation(){
	paper_list=new Set();
	state= "citation"
	total=0;
	request_counter=0;
	received_req=0;
	error_counter=0;
	$("#citation_button").hide();
	//need to hide ref button
	$("#ref_button").prop("disabled",true);
	
	$("#myProgress").show();
	start_pre_download_citation();
	//set a timeer after 10seconds to check is the request_counter==0
	setTimeout(() => {  check_progress(); }, 10000);
	
}
 
 
//////////////////////////////Download References//////////////////////////////////////////////////////


//sending the first request to API server to collect reference id list
function start_pre_download_ref(){
	
	
	console.log("current downloading:"+id_)
	//remove download button,and add prograss bar
	//send the first request to get the year_list
	$.ajax({
		type: 'GET',
        contentType: "application/json; charset=utf-8",
        url: "https://academic.microsoft.com/api/entity/" + id_ + "?entityType=2",
		success: function (response) {
			paperReferencesExpression = response["paperReferencesExpression"]
			//collect paper
			collect_ref_papers(paperReferencesExpression)
			
		},
			
		error: function(response){
			
			console.log("ref request failed");
		}
		
	}) 
}




//initialize counters, set views, and start download reference
function start_download_ref(){
	paper_list=new Set();
	total=0;
	state="ref"
	request_counter=0;
	received_req=0;
	error_counter=0;
	$("#ref_button").hide();
	//need to disable citation button
	$("#citation_button").prop("disabled",true);
	$("#myProgress").show();
	start_pre_download_ref();
	//set a timeer after 10seconds to check is the request_counter==0
	setTimeout(() => {  check_progress(); }, 10000);
	
}
//collecting reference papers
function collect_ref_papers(paperReferencesExpression){
	
	let skip=0;
	amount_paper = (paperReferencesExpression.split(',')).length
	for(i=0; i<49;i++){
				
				if(skip >= amount_paper){
					break;
				}
				request_counter++;
				
				JSON_data=JSON.stringify({
            "query":title,
            "queryExpression":paperReferencesExpression,
            "filters":[],
            "orderBy":0,
            "skip":skip,
            "sortAscending":true,
            "take":10,
            "includeCitationContexts":true,
            "profileId":""
            });
			//let delay_time=Math.random()*1500000;
			let delay_time = Math.ceil(request_counter/6)*10000
			
			setTimeout_request(JSON_data,0,delay_time);
			skip=skip+10;
		
	}
}





}