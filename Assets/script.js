var citySearchBarSearch = $("#citySearchBarSearch");
var citySearchBarResults = $("#citySearchBarResults");
var searchBarButtonResults = $("#searchBarButtonResults");
var searchBarButtonSearch = $("#searchBarButtonSearch");
var resultsPage = $(".resultsPage");
var headerOne = $("h1");
var weatherCards = $(".card");
var temp = $("#temp");
var wind = $("#wind");
var humidity = $("#humidity");
var pastSearchesContainer = $("#searchHistory");
//this creates an array filled with the html elements with the block class
var theTemp;
var theWind;
var theHumidity;
var cityName;
var theDate;
var latitude;
var longitude;
var listOfCities = [];
var cityNameArray = [];
localStorage.setItem("searchHistory", JSON.stringify(cityNameArray));
//must stringify the array before saving it to localStorage
//localStorage only accepts strings, not objects
//it will accept an array of strings, and .stringify() allows us to meet this requirement.




function getListOfCities () {
    var requestURL = "https://countriesnow.space/api/v0.1/countries/population/cities";
    fetch (requestURL)
        .then (function (response) {
            return response.json();
        })
        .then (function (data) {
            var theData = data.data;
            for (var i = 0; i < theData.length; i ++) {
                if ((theData[i].city).indexOf("(CA)") !== -1) {
                    theData[i].city = (theData[i].city).replace("(CA)", "");
                }
                if ((theData[i].city).indexOf("(FL)") !== -1) {
                  theData[i].city = (theData[i].city).replace("(FL)", "");
                }
                if ((theData[i].city).indexOf("(NY)") !== -1) {
                  theData[i].city = (theData[i].city).replace("(NY)", "");
                }
                listOfCities.push(theData[i].city);
            }
        })
}
getListOfCities();



//jQuery autocomplete widget (its function)
$(function() {
    citySearchBarSearch.autocomplete({
        source: listOfCities,
        messages: {
            noResults: ' '
            }
        })
    citySearchBarResults.autocomplete({
        source: listOfCities,
        messages: {
            noResults: ' '
            }
        })
        //CSS GETS RID OF HELPER TEXT, THIS DID NOT GET RID OF THE HELPER TEXT
  });
  //NEED TO CHANGE THE MOSTPOPULAR cities array to include
  //the most popular cities

  function getGeoCodingAPI() {
    //if location is in US, request URL does includes state code
    //if the location is not in the US, request URL does not include state code
    var requestURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=d171e367df691d66fee21472f6942e95";
    fetch(requestURL)
        .then (function (response) {
            return response.json();
        })
        .then (function (data) {
            var arrayOrNot = Array.isArray(data);
            console.log(arrayOrNot);
            console.log(data);
            //it is an array, so declaring a variable that is equal to the "data" object is not necessary
            latitude = data[0].lat;
            longitude = data[0].lon;
        })
  };
//this function is designed to get the coordinates necesssary to invoke the getWeatherAPI without an error


  function getWeatherAPI() {
    var requestURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=d171e367df691d66fee21472f6942e95";
    //for Los Angeles";
    fetch(requestURL)
    //fetch funcion (a call to the server) is called with the request URL to retrieve
    //data from the server
        .then(function (response) {
            return response.json();
            //the then function is used to handle the response from the server
            //it returns a promise to resolve the parsed JSON data
            //promise is not too relevant, know we parse the data that the server provides
        })
        .then(function (data) {
            //this then function now handles the parsed JSON Data
            //in this case, we log the parsed data to the console
            console.log(data);
            //looking at the console log of the data object, it shows a property called list that contains an array of 40 objects
            //this array of 40 objects, which is the list of cities and their weather properties
            var arrayOrNot = Array.isArray(data);
            console.log(arrayOrNot);
            //the data object is not in array, it is an object, so it must be converted into an array
            var forecast = data.list;
            //makes the data object an array by setting equal to object

            theDate = dayjs.unix(forecast[0].dt).format("MM-DD-YYYY");

            theTemp = forecast[0].main.temp;
            theTemp = (theTemp-273.15) * (9/5) + 32;
            theTemp = theTemp.toFixed(2);

            theWind = forecast[0].wind.speed;
            theWind = theWind * 2.237;
            theWind = theWind.toFixed(2);

            theHumidity = forecast[0].main.humidity;

            headerOne.text(cityName + ", " + theDate);
            temp.text("Temp: " + theTemp + " °F");
            wind.text("Wind: " + theWind + " MPH");
            humidity.text("Humidity: " + theHumidity + " %");
            
            //want to display the date of each days that forecast readings are given on each of the cards
              //loopDay and toDay should be equal always, and as soon as its not its because loopDay has reached a new day
              //in that case, the date(loopDay's index) is recorded on the card, and then toDay is incremented to make sure it is equal again
              //the two are equal during an entire day's reading, and during the first hour of the next day, they are not equal, so then toDay is incremented
              //to retain equality between two variables

              // increments today when loopday 

            //want to display the temperature at 11AM every day (not day dependent)
              //when the forecast reading reaches 11AM, then we display the temperature
              //doesn't need to be a new day because there will be only 5 11AM readings
              //when 11AM is reached, then we display temperature on a new card
              //everytime that 11AM is reached, we increment the cardIndex



            var toDay = dayjs.unix(forecast[0].dt).format("DD");
            var thisMonth = dayjs.unix(forecast[0].dt).format("MM");
            //toDay is the current day
            //increments by one when loopDay exceeds 
            var cardIndexOne = 0;
            var cardIndexTwo = 0;
            //should increment by one every time toDay increments
            for (var i = 0; i < forecast.length; i++) {
              var loopDay = dayjs.unix(forecast[i].dt).format("DD");
              var loopMonth = dayjs.unix(forecast[i].dt).format("MM")
              //loopDay is the current Day that the forecast loop is on
              //loopDay keeps track of what day we are currently on in the hourly forecasts
              if (loopDay > toDay || loopMonth>thisMonth) {
                $((weatherCards[cardIndexOne])).children().eq(0).text(dayjs.unix(forecast[i].dt).format("(MM/DD/YYYY)"));
                toDay=loopDay;
                thisMonth = loopMonth
                cardIndexOne++;
              }
              if (dayjs.unix(forecast[i].dt).format("hA") == "11AM") {
                var newTemp = ((forecast[i].main.temp-273.15) * (9/5) + 32).toFixed(2);
                $(weatherCards[cardIndexTwo]).children().eq(1).text("Temp: " + newTemp + " °F");
                if (newTemp > 77) {
                    $(weatherCards[cardIndexTwo]).children().eq(2).attr("src", "./Assets/sunIcon.png");
                    $(weatherCards[cardIndexTwo]).addClass("hotCardBackground");
                }
                else {
                    $(weatherCards[cardIndexTwo]).children().eq(2).attr("src", "./Assets/snowflake.png");
                    $(weatherCards[cardIndexTwo]).addClass("coldCardBackground");
                }
                $(weatherCards[cardIndexTwo]).children().eq(3).text("Wind: " + forecast[i].wind.speed + " MPH");
                $(weatherCards[cardIndexTwo]).children().eq(4).text("Humidity: " + forecast[i].main.humidity + " %");
                cardIndexTwo++;
              };
        };
        })
    };
            //populates the weatherCards with respective weather details
//this function is designed to use the coordinates provided by the getGeoCoding API to 
//get the weather forecast for that pair of coordinates

function populateResultsPage(cityName) {
    getGeoCodingAPI();
    setTimeout(getWeatherAPI, 2000);
    saveToSearchHistory(cityName);
    populatePastSearches();
}

searchBarButtonSearch.on("click", function (event) {
    cityName = citySearchBarSearch.val();
    $(".pageOne").removeClass("visible");
    $(".pageOne").addClass("hidden");
    $(".pageTwo").removeClass("hidden");
    $(".pageTwo").addClass("visible");
    //needs to switch from first page to second page
    populateResultsPage(cityName);
});

searchBarButtonResults.on("click", function (someEvent) {
    cityName = citySearchBarResults.val();
    populateResultsPage(cityName);
  });



function saveToSearchHistory (cityName) {
    //need to indicate what value cityName is set to depending on which searchButton is pressed
    //event.target?
    var theArray = localStorage.getItem("searchHistory");
    var searchHistory = JSON.parse(theArray);
    //searchHistory is now a parsed array of objects
    if (searchHistory) {
      cityNameArray = searchHistory;
    } 
    cityNameArray.push(cityName);
    localStorage.setItem("searchHistory", JSON.stringify(cityNameArray));
}

function populatePastSearches() {
  var theArray = JSON.parse(localStorage.getItem("searchHistory"));
  //create the block here, then its populated in the code that follows 
  var newBlock = $("<div>");
  newBlock.addClass("block");
  pastSearchesContainer.append(newBlock);
  var pastSearches = $(".block");
  for (var i = 0; i < pastSearches.length; i++) {
    $(pastSearches[i]).text(theArray[i]);
  }
}

pastSearchesContainer.on("click", function(event) {
  var clicked = event.target;
  if (clicked.matches(".block")) {
    cityName = clicked.textContent;
    getGeoCodingAPI();
    setTimeout(getWeatherAPI, 2000);
    //need to restructure the array to have the search history accurately reflect the most recent search
    var theArray = localStorage.getItem("searchHistory");
    var searchHistory = JSON.parse(theArray);
    console.log(searchHistory);
   for (var i = 0; i < searchHistory.length; i++) {
    if (searchHistory[i] == event.target.textContent) {
        var theRemovedName = searchHistory[i];
        searchHistory.splice(i, 1);
        console.log(searchHistory);
        //first parameter of .splice() is the index at which the elements will begin to be removed
        //the second parameter of .splice() is the number of elements in the array that will be removed following the provided index
        searchHistory.unshift(theRemovedName);
        console.log(searchHistory);
   }
  }
  var pastSearches = $(".block");
  for (var i = 0; i < pastSearches.length; i++) {
    $(pastSearches[i]).text(searchHistory[i]);
  }
  //reorder searches here
}
});

//when you click on an element with a class of block, it reruns the functions that populate the weather forecast page
