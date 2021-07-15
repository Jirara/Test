

function tickerSearch() {
	var r = new RegExp('[a-zA-Z]{1,5}')
	symbol = document.getElementById("Fd_SearchTickers").value;
	
	var pass = r.exec(symbol)
	
	if (!pass) { 
		document.getElementById("Fd_Msg").textContent = "Enter a valid stock ticker"
	} 
	else {
		
		document.getElementById("Fd_Msg").textContent = "Searched Ticker: "+ symbol
	}
	
	type = "TIME_SERIES_DAILY"
	apiKey = "EHUGZECW9JJRYCQZ"
	url ="https://www.alphavantage.co/query?function=" + type + "&symbol=" + symbol + "&apikey=" + apiKey
	
	makeXHTTPRequest(url, callbackTimeSeries)
}

function makeXHTTPRequest(url, callbackFunction) {
	var xhttp = new XMLHttpRequest();
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		  callbackFunction(this);
		}
	};
	
	xhttp.open("GET", url, true);
	xhttp.send();
}

function callbackTimeSeries(xhttp) {
	var returnObj = JSON.parse(xhttp.responseText);
	solArr = createDataSets(returnObj)
	data = configureData(solArr)
	createGraph(data)
	
	
}

function createGraph(data) {
	//destroy the chart if it already exists
	if (window.stockChart != undefined) { 
		stockChart.destroy();
		//for some reason, size is lost, so resize quick
		var el = document.getElementById("chart");
		el.style.height = "800px";
		el.style.width = "700px";	
	}
	var canvas = document.getElementById("chart");

	var ctx = canvas.getContext('2d');



	// Global Options:
	//Chart.defaults.global.defaultFontColor = 'black';
	//Chart.defaults.global.defaultFontSize = 16;
	
	var options = {
	  scales: {
			  xAxes: [{
					//type: 'time'
					distribution: 'series',
					time: {
						unit: 'week' //displayFormats: {day: 'MMM D' }
                    }
				}],
				yAxes: [{
					ticks: {
						beginAtZero:false
					},
					scaleLabel: {
						 display: true,
						 labelString: 'Price',
						 fontSize: 12
					  }
				}]            
			}  
	};
	

	//Create chart as a global variable
	stockChart = new Chart(ctx, {
	type: 'line',
	data: data,
	options: options
});



}

function createDataSets(returnObj) {
	//Parse the returned object - there is a 2 level nest for the MetaData key (level 1) and 3 level for the Time Series key. 
	//We will parse these into a table with columns open, high, low, close, and volume. Each row corresponds to a date.
	//Data should take the general format: data: [{ x: new Date(),y: 1}] - keep in mind there are particular considerations in using a time-based axis in chart.js.
	l = "objects: "
	
	//Series of arrays used to store information while we collect it and prepare to create our data sets
	var dates = new Array()
	var highs = new Array()
	var lows = new Array()
	var volumes = new Array()
	var opens = new Array()
	var closes = new Array()
	
	for(var key in returnObj) {
		l = l + key + ": " //used for troubleshooting (stores as string)
		datesObj = returnObj[key] 
		for(var key2 in datesObj) {

			
			//Collect the metrics from this date
			metricObj = datesObj[key2]
			ct = 1
			
			l = l + key2+ ": " 
			if (key == "Time Series (Daily)") {
				//Add the date as a label
				dates.push(key2)
				for(var key3 in metricObj) {
					if (ct ==1) { opens.push(metricObj[key3]); ct++; }
					else if (ct == 2) { highs.push(metricObj[key3]); ct++;}
					else if (ct == 3) { lows.push(metricObj[key3]); ct++; }
					else if (ct == 4) { closes.push(metricObj[key3]); ct++; }
					else if (ct == 5) { volumes.push(metricObj[key3]); ct++; }
					
						
					
					l = l + key3 + ": " + metricObj[key3] + "| "
					
					
				}
			}
		}
	}
	

	var solArr = customDateSort(dates, highs, lows, closes, volumes, opens)
				
	
	//document.getElementById("Fd_StockInfo").textContent = solArr //xhttp.responseText
	return solArr
}

function configureData(solArr) {
	//The arrays were built in an unusual order since the data points in the JSON are scrambled, so we need to run a custom sort algorithm
	//So that we  can properly sort not only the dates array, but also the associated data arrays (and use some custom sorting logic)

	var activeArray = new Array()
	
	//collect user feedback on which lines to display
	e = document.getElementById("checkboxes").querySelectorAll(".lineCheck")
	for (i = 0; i < e.length; i++) {
		if (e[i].checked == true) { activeArray.push(1) }
		else { activeArray.push(0) }
	}
	

	//0 = dates, 1=high, 2=low, 3=closes, 4=volumes, 5=opens
	console.log(solArr)
	
	timePeriod = 3
	
	var dates = new Array()
	var highs = new Array()
	var lows = new Array()
	var volumes = new Array()
	var opens = new Array()
	var closes = new Array()
	
	for (i=solArr[0].length - timePeriod; i < solArr[0].length; i++) {
		dates.push(solArr[0][i])
		highs.push(solArr[1][i])
		lows.push(solArr[2][i])
		closes.push(solArr[3][i])
		volumes.push(solArr[4][i])
		opens.push(solArr[5][i])
	}

	
	console.log(dates)
	
	//Format the data sets properly
	var fillOpt	= false
	var lineTensionOpt = 0.1
	var bgColorOpt = "rgba(225,0,0,0.4)"
	var borderCapStyleOpt = "square"
	var borderJoinStyleOpt = "miter"
	var ptBorderWidthOpt = 1
	var ptHoverRadiusOpt = 5
	var ptHoverBorderWidthOpt = 2
	var ptRadOpt = 2
	var ptHitRadius = 10
	
	var dataSetArr = [{
			label: "High",
			fill:fillOpt,
			lineTension: lineTensionOpt,
			backgroundColor: bgColorOpt,
			borderColor: "green", //main line color,
			borderCapStyle: borderCapStyleOpt,
			borderDash: [], //example [5,15]
			borderDashOffset: 0.0,
			borderJoinStyle: borderJoinStyleOpt,
			pointBorderColor: "green",
			pointBackgroundColor: "green",
			pointBorderWidth: ptBorderWidthOpt,
			pointHoverRadius: ptHoverRadiusOpt,
			pointHoverBackgroundColor: "yellow",
			pointHoverBorderColor: "green",
			pointHoverBorderWidth: ptHoverBorderWidthOpt,
			pointRadius: ptRadOpt,
			pointHitRadius: ptHitRadius,
			data: highs,
			spanGaps: true,
		}, {
			label: "Low",
			fill:false,
			lineTension: lineTensionOpt,
			backgroundColor: bgColorOpt,
			borderColor: "red", //main line color,
			borderCapStyle: borderCapStyleOpt,
			borderDash: [], //example [5,15]
			borderDashOffset: 0.0,
			borderJoinStyle: borderJoinStyleOpt,
			pointBorderColor: "red",
			pointBackgroundColor: "red",
			pointBorderWidth: ptBorderWidthOpt,
			pointHoverRadius: ptHoverRadiusOpt,
			pointHoverBackgroundColor: "yellow",
			pointHoverBorderColor: "green",
			pointHoverBorderWidth: ptHoverBorderWidthOpt,
			pointRadius: ptRadOpt,
			pointHitRadius: ptHitRadius,
			data: lows,
			spanGaps: true,
		}, {
			label: "Close",
			fill:false,
			lineTension: lineTensionOpt,
			backgroundColor: bgColorOpt,
			borderColor: "blue", //main line color,
			borderCapStyle: borderCapStyleOpt,
			borderDash: [], //example [5,15]
			borderDashOffset: 0.0,
			borderJoinStyle: borderJoinStyleOpt,
			pointBorderColor: "blue",
			pointBackgroundColor: "blue",
			pointBorderWidth: ptBorderWidthOpt,
			pointHoverRadius: ptHoverRadiusOpt,
			pointHoverBackgroundColor: "grey",
			pointHoverBorderColor: "black",
			pointHoverBorderWidth: ptHoverBorderWidthOpt,
			pointRadius: ptRadOpt,
			pointHitRadius: ptHitRadius,
			data: closes,
			spanGaps: true,
		}, {
			label: "Open",
			fill:false,
			lineTension: lineTensionOpt,
			backgroundColor: bgColorOpt,
			borderColor: "black", //main line color,
			borderCapStyle: borderCapStyleOpt,
			borderDash: [], //example [5,15]
			borderDashOffset: 0.0,
			borderJoinStyle: borderJoinStyleOpt,
			pointBorderColor: "black",
			pointBackgroundColor: "black",
			pointBorderWidth: ptBorderWidthOpt,
			pointHoverRadius: ptHoverRadiusOpt,
			pointHoverBackgroundColor: "grey",
			pointHoverBorderColor: "black",
			pointHoverBorderWidth: ptHoverBorderWidthOpt,
			pointRadius: ptRadOpt,
			pointHitRadius: ptHitRadius,
			data: opens,
			spanGaps: true,
		}
		]
		
	var dataSets = new Array()
	
	for (i = 0; i < activeArray.length; i++) {
		if (activeArray[i] == 1) {
			//only add this data set to the array for graph creation if the appropriate checkbox is checked
			dataSets.push(dataSetArr[i])
		}
	}
	
	var data = {
		labels: dates,
		datasets: dataSets
	}
	
	return data
}

function customDateSort(dates, highs, lows, closes, volumes, opens) {
	
	console.log(dates.length, dates)
	
	if (dates.length > 1) {
		//split array in half to pass in recursively
		splitLength = Math.floor(dates.length / 2)
		
		//console.log("split", splitLength, "from", dates.length)
		//Track both the dates array (for actual sorting) 
		var datesLeft = new Array()
		var datesRight = new Array()
		
		var opensLeft = new Array()
		var opensRight = new Array()
		var highsLeft = new Array()
		var highsRight = new Array()
		var lowsLeft = new Array()
		var lowsRight = new Array()
		var closesLeft = new Array()
		var closesRight = new Array()
		var volumesLeft = new Array()
		var volumesRight = new Array()
		
		//Declare additional arrays for use in a bit - declare using "var" in a function to force them to be local
		var left = new Array()
		var right = new Array()
		
		var leftOpens = new Array()
		var rightOpens = new Array()
		var leftHighs = new Array()
		var rightHighs = new Array()
		var leftLows = new Array()
		var rightLows = new Array()
		var leftCloses = new Array()
		var rightCloses = new Array()
		var leftVolumes = new Array()
		var rightVolumes = new Array()
		
		
		for (i = 0; i < splitLength; i++) {
			datesLeft.push(dates[i])
			
			opensLeft.push(opens[i])
			highsLeft.push(highs[i])
			lowsLeft.push(lows[i])
			closesLeft.push(closes[i])
			volumesLeft.push(volumes[i])
		}			
		
		for (i = splitLength; i < dates.length; i++) {
			datesRight.push(dates[i])
			
			opensRight.push(opens[i])
			highsRight.push(highs[i])
			lowsRight.push(lows[i])
			closesRight.push(closes[i])
			volumesRight.push(volumes[i])
		}
		
		console.log("datesLeft", datesLeft, "right", datesRight)
		

		
		//don't try to recurse if length == 1 or 0 (we will also return the same value if we do by accident)
		if (datesLeft.length > 1) {
			leftArrs = customDateSort(datesLeft, highsLeft, lowsLeft, closesLeft, volumesLeft, opensLeft)
			left = leftArrs[0]
			
			leftOpens = leftArrs[5]
			leftHighs = leftArrs[1]
			leftLows = leftArrs[2]
			leftCloses = leftArrs[3]
			leftVolumes = leftArrs[4]
			
			
		}
		else {
			console.log("no recurse")
			left = datesLeft
			
			leftOpens = opensLeft
			leftHighs = highsLeft
			leftLows = lowsLeft
			leftCloses = closesLeft
			leftVolumes = volumesLeft
			
		}
		if (datesRight.length > 1) {
			rightArrs = customDateSort(datesRight, highsRight, lowsRight, closesRight, volumesRight, opensRight)
			right = rightArrs[0]
			
			rightOpens = rightArrs[5]
			rightHighs = rightArrs[1]
			rightLows = rightArrs[2]
			rightCloses = rightArrs[3]
			rightVolumes = rightArrs[4]
		}
		else {
			right = datesRight
			
			rightOpens = opensRight
			rightHighs = highsRight
			rightLows = lowsRight
			rightCloses = closesRight
			rightVolumes = volumesRight
		}
		
		var arrValues = new Array()
		
		var arrOpens = new Array()
		var arrHighs = new Array()
		var arrLows = new Array()
		var arrCloses = new Array()
		var arrVolumes = new Array()
		
		console.log("new round")
		
		while (left.length > 0 && right.length > 0) {
			//Strip hyphens for numeric comparison
			d1 = parseInt(left[0].replace(/-/g, ""))
			d2 = parseInt(right[0].replace(/-/g, ""))
			console.log("left", left, "right", right, "vals", arrValues, "from dates", dates)
			
			if (d1 < d2) {
				arrValues.push(left[0]) //add to end of array
				left.shift() //remove top item in arrays (pop would remove from bottom of array)
				
				arrOpens.push(leftOpens[0])
				leftOpens.shift()
				arrHighs.push(leftHighs[0])
				leftHighs.shift()
				arrLows.push(leftLows[0])
				leftLows.shift()
				arrCloses.push(leftCloses[0])
				leftCloses.shift()
				arrVolumes.push(leftVolumes[0])
				leftVolumes.shift()
			}
			else if (d1 == d2) {
				//For now, we won't remove duplicates, we'll just keep them and order them appropriately
				arrValues.push(left[0])
				arrValues.push(right[0])
				left.shift()
				right.shift()
				
				arrOpens.push(leftOpens[0])
				leftOpens.shift()
				arrHighs.push(leftHighs[0])
				leftHighs.shift()
				arrLows.push(leftLows[0])
				leftLows.shift()
				arrCloses.push(leftCloses[0])
				leftCloses.shift()
				arrVolumes.push(leftVolumes[0])
				leftVolumes.shift()
				
				arrOpens.push(rightOpens[0])
				rightOpens.shift()
				arrHighs.push(rightHighs[0])
				rightHighs.shift()
				arrLows.push(rightLows[0])
				rightLows.shift()
				arrCloses.push(rightCloses[0])
				rightCloses.shift()
				arrVolumes.push(rightVolumes[0])
				rightVolumes.shift()
			}
			else {
				arrValues.push(right[0]) //add to end of array
				right.shift() //remove top item in arrays (pop would remove from bottom of array)
				
				arrOpens.push(rightOpens[0])
				rightOpens.shift()
				arrHighs.push(rightHighs[0])
				rightHighs.shift()
				arrLows.push(rightLows[0])
				rightLows.shift()
				arrCloses.push(rightCloses[0])
				rightCloses.shift()
				arrVolumes.push(rightVolumes[0])
				rightVolumes.shift()
			}
		}
		
		for (i = 0; i < left.length; i++) {
			arrValues.push(left[i])
			
			arrOpens.push(leftOpens[i])
			arrHighs.push(leftHighs[i])
			arrLows.push(leftLows[i])
			arrCloses.push(leftCloses[i])
			arrVolumes.push(leftVolumes[i])
		}
		for (i = 0; i < right.length; i++) {
			arrValues.push(right[i])
			
			arrOpens.push(rightOpens[i])
			arrHighs.push(rightHighs[i])
			arrLows.push(rightLows[i])
			arrCloses.push(rightCloses[i])
			arrVolumes.push(rightVolumes[i])
		}
		
		console.log("fin vals", arrValues)
		//Return both arrays (pack into array first)
		solArr = new Array()
		solArr.push(arrValues)
		solArr.push(arrHighs)
		solArr.push(arrLows)
		solArr.push(arrCloses)
		solArr.push(arrVolumes)
		solArr.push(arrOpens)
		
		return solArr
	}
	else {
		//Return both arrays (pack into array first)
		console.log("return dates unchanged", dates)
		solArr = new Array()
		solArr.push(dates)
		solArr.push(highs)
		solArr.push(lows)
		solArr.push(closes)
		solArr.push(volumes)
		solArr.push(opens)
		
		return solArr
	}

}

window.onload = function() {
	
document.getElementById('Btn_SearchTickers').onclick = tickerSearch;

//Add event listeners for changes to the checkbox
chkDiv = document.getElementById("checkboxes").querySelectorAll(".lineCheck")
for (i = 0; i < chkDiv.length; i++) {
	chkDiv[i].addEventListener( 'change', function() {
    if(this.checked) {
		data = configureData(solArr)
		createGraph(data)
    } else {
		data = configureData(solArr)
		createGraph(data)
    }
});
}

}





	