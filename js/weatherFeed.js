
function getWeatherFeed(){

var inputData = $('#zipcodeID').val();

//get value from textfield and passed to isInteger method for validation
if(!isInteger($('#zipcodeID').val())){ // validate number 
	alert("Please enter valid zip code");
	return;
}

var responseData = checkKeyExists(inputData); // response data

if(!responseData['success'] || responseData === undefined || responseData === null || responseData===''){


if(responseData['message']!=="" && responseData['message']!==null && responseData['message']!==undefined )//condition to when response failed.
	alert(responseData['message']);
else
	alert("Please try again or enter valid Zip code");

}else{		                                                                                          // When response is successfully received
		//Set city
		if(responseData['name']!= null || responseData['name']!== undefined){
		
		if(responseData['sys']['country']=== undefined)
		responseData['sys']['country']='';
		$("#labelCity").html("City: "+responseData['name']+ ", "+responseData['sys']['country']);
		}
		
		//Set Current temperature
		if(responseData['main']['temp']!= null || responseData['main']['temp']!== undefined)
		$("#labelCurrentTemp").html("Current temperature: "+responseData['main']['temp']);
		
		//Set Highest temperature
		if(responseData['main']['temp_max']!= null || responseData['main']['temp_max']!== undefined)
		$("#labelHighest").html("Highest temperature: "+responseData['main']['temp_max']);
		
		//Set Lowest temperature
		if(responseData['main']['temp_min']!= null || responseData['main']['temp_min']!== undefined)
		$("#labelLowest").html("Lowest temperature: "+responseData['main']['temp_min']);

		//Set weather condition temperature
		if(responseData['weather'][0]['description']!= null || responseData['weather'][0]['description']!== undefined)
		$("#labelCondition").html("Weather condition: "+responseData['weather'][0]['description']);

		//To display old cache data image
		if(responseData['cache'])
				 $("#imageIndicator").show();
		else
				 $("#imageIndicator").hide();

	}
return ;

}

// Function: checkKeyExists, this method check from local storage data.
// if zip code matched and within 30min timestamp then return local stored data.
// if zip code not matched or time is expired checkLocalStorageData method. 
// return: Response Data
function checkKeyExists(inputData){

var getData=[];
getData = checkLocalStorageData(inputData);
getData['cache'] =true;


if(getData.length==0){
  getData = createLocalStorage(inputData);
  getData['cache'] =false;


}

return getData;
 
}

// Function: createLocalStorage, this method request new data from server.
// if response is received/success, it will call saveLocalStorageData method to save
// into local storage.
// if failed alert will display
// return: Response Data
function createLocalStorage(inputData){

var responseData = sendWeatherRequest(inputData); //Fetch data from API.

if(responseData['success']){
	saveLocalStorageData(responseData);//Save into local storage.
}else{
	responseData['message']='Please try again and enter correct Zip Code.'; //Failed
}

return responseData;
}


// Function: checkLocalStorageData, this method check zip code in local storage.
// return: Data from local storage if zip code is enter less than 30 minutes.
// return: empty array if local storage data is expire.
function checkLocalStorageData(inputData){

var res=[];
	if (localStorage.getItem("locallyStoredData")!= null) {
		var oldItems = JSON.parse(localStorage.getItem('locallyStoredData')); //Parse Json 
		var data = oldItems['data'];
			for(var i =0 ; i<data.length; i++){ 		//Check each object in array
				if(data[i].zipCode == inputData){ 		//Check for the same Zip Code
					var dateString = data[i].currentTime;//Get saved timestamp
					var now = new Date().getTime();      //get current timestamp
					var setMaxLimit  = 1800000; //Set time limit to 30 minutes 30*60*1000.
 
 					if((now - dateString) >(setMaxLimit)){ //compare difference:                    
					removeExpiredData(data[i].zipCode, i);//if greater remove for local -
					break;                               //	-storage 
  
 					} 
 					res =  data[i];//If timestamp difference is < 30 min, get data.                    
 					break;
				}
			}

	}

return res;
}


// Function: removeExpiredData, this method removed expire data from local storage.
// reset locallyStoredData.
// return: true after successfully deleting and updating data.

function removeExpiredData(zipCode, x){

var dataList = JSON.parse(localStorage.getItem('locallyStoredData'));

var dataArrayList = dataList.data; //Get data array.
dataArrayList.splice(x,1); //Delete the data at given index.

var locallyStoredData = {
  'data': dataArrayList
};

localStorage.removeItem("locallyStoredData");//remove locallyStoredData from local storage
localStorage.setItem('locallyStoredData', JSON.stringify(locallyStoredData));//Set data

return true;

}


// Function: saveLocalStorageData, this method save new data received from API -
// - into local storage.
//First get local storage data then append new data into it
// return: true after successfully deleting and updating data.
function saveLocalStorageData(setData){

var oldDataArray = JSON.parse(localStorage.getItem('locallyStoredData'));


var locallyStoredData = {   // Creating a JSON
  'data': []
};


var dataArray =[]; //To get data array 

if(oldDataArray != null){ // Add each local storage data into new array
	var r1 =oldDataArray.data;
	for (var arr in r1) {
 		dataArray.push(r1[arr]);
	}
}

dataArray.push(setData); //Add new data into array
 
for (var prop in dataArray) { 
    locallyStoredData.data.push(dataArray[prop]);
}

localStorage.removeItem("locallyStoredData"); //Delete existing locallyStoredData
//Create a new local storage  
localStorage.setItem('locallyStoredData', JSON.stringify(locallyStoredData));

return true;

}


// Function: sendWeatherRequest, this method fetch data from API
// return: response data with success and message.

function sendWeatherRequest(inputData){

var apiKey ="95e0f2e2f5612dd270dae577c3f6d977"; //api key from openweathermap

//URL to fetch data for zip code.
var requestURL = "http://api.openweathermap.org/data/2.5/weather?zip="+inputData+",us&APPID="+apiKey+"&units=imperial";//openweathermap

var responseData="";

//jQuery ajax called to get data from URL.
$.ajax({
    url: requestURL,
    success: function(json,status) {
      responseData = json;
      
	if(responseData['cod']===200){
		responseData['currentTime']=new Date().getTime();
		responseData['zipCode'] = inputData;
		responseData['success']=true;
	}else{
		responseData['success']=false;
		responseData['message']="Please try again";

		}
    },
    error: function(xhr,status,error)
    {
    	responseData['success']=false;
		responseData['message']="Error occurred: Please try valid Zip Code.";
    },
    
    complete: function(xhr,status){
    if(status =='success'){
    	responseData['success']=true;
    	}else{
    	responseData['success']=false;
		responseData['message']="Error occurred: Please try valid Zip Code.";
    	}
    },
    async:false
  });
  
  return responseData;

}


//Function: isInteger, this method validate the string entered from textfield,
//return: true or false after validation.
function isInteger(x,str) {
    return  (x % 1 === 0) && (x>0) && (x.toString().length ==5);
}




