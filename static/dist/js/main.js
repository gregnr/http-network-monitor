var createPieChart = function(chartElement, dataSet) {

	// To avoid an over-filled chart, after a certain # of items,
	//		group them into an "other" category
	// This assumes a descending list order list
	var maxElements = 20;
	if(dataSet.length > maxElements + 1){
		for(var i = 0; i < dataSet.length; i++){
			if(i == maxElements){
				dataSet[i].label = "Other";
			}else if(i > maxElements){
				// Sum any remaining elements under 'other'
				dataSet[maxElements].data = parseInt(dataSet[maxElements].data) +  parseInt(dataSet[i].data);
				dataSet[i].data = 0; // This will hide the actual value from the chart
				dataSet[i].label = ""; // This will hide the actual value from the chart
			}
		}
	}

    var labelFormatter = function(label) {
        return "<span style='color: #000000; padding-left: 5px;'>" + label + "<span/>";
    };
    
    var plotObj = $.plot(chartElement, dataSet, {
        series: {
            pie: {
                show: true,
                radius: 1
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0% %s", // show percentages rounded to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            }
        },
        legend: {
            show: true,
            labelFormatter: labelFormatter,
            labelBoxBorderColor: "#FFFFFF",
            position: "ne"
        }
    });
};

var addDataColors = function(data) {

    var makeColor = function(colorNum, colors, offset) {
        if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
        return colorNum * (360 / colors) + offset % 360;
    }

    for (var i = 0; i < data.length; i++) {
        
        var row = data[i];
        var offset = 70;
        
        row.color = "hsl(" + makeColor((i + offset + 360/2 * (i % 2)) % 360, data.length, 40) + ", 90%,70% )";
    }
}

$(document).ready(function() {

	//Following the numbering convention from the Google Doc :)

    //1. Load domain chart
    $.ajax({
        url: "../api/v1/domains/",
        dataType: "json"
    }).then(function(data) {
        
        Morris.Bar({
            element: 'domain-bar-chart',
            data: data,
            xkey: 'domain',
            ykeys: ['total_requests'],
            labels: ['Requests'],
            hideHover: 'auto',
            gridTextSize: 8,
            resize: true
        });
    });
    
    
    //2. Load hourly traffic chart
    $.ajax({
        url: "../api/v1/hourlytraffic/",
        dataType: "json"
    }).then(function(dataSet) {
        
        // The input dataset may not have a value for every hour..
        // 	Nicely format a new data set which has a value for each hour
        //	Rightmost bar of chart is the current time (t0), count backwards from there
        var fullDataSet = new Array(24);
        var currentHour = new Date().getHours();
        for(var i = 0 ; i <24 ; i ++){
        	var difference = i-23;
        	var actual_hr = (currentHour + difference)%24;
        	if(actual_hr < 0 ){
        		actual_hr += 24;
        	}
        	// Check for this hour in the actual data
        	var ctl = 0;
        	for(var j = 0 ; j <dataSet.length ; j ++){
        		if(dataSet[j].hour == actual_hr){
        			ctl = dataSet[j].content_length_total;
        		}
        	}
       		fullDataSet[i] =  {hour: difference, content_length_total: ctl};
        }
        
        Morris.Bar({
            element: 'hourly-traffic-bar-chart',
            data: fullDataSet,
            xkey: 'hour',
            ykeys: ['content_length_total'],
            labels: ['Number of bytes'],
            hideHover: 'auto',
            gridTextSize: 8,
            resize: true
        });
    });
    
    
    //3. Load content type chart
    $.ajax({
        url: "../api/v1/contenttypes/",
        dataType: "json"
    }).then(function(data) {
        
        var flotData = [];
        
        //Convert data to flot format
        for (var i = 0; i < data.length; i++) {
            
            var row = data[i];
            
            flotData.push({
                label: row["content_type"],
                data: row["total_responses"]
            });
        }
        
        addDataColors(flotData);
        
        var chartElement = $("#content-type-pie-chart");
        
        createPieChart(chartElement, flotData);
    });
    
    
    //5. Load server chart
    $.ajax({
        url: "../api/v1/webservers/",
        dataType: "json"
    }).then(function(data) {
        
        Morris.Bar({
            element: 'server-bar-chart',
            data: data,
            xkey: 'server',
            ykeys: ['total_responses'],
            labels: ['Number of servers'],
            hideHover: 'auto',
            gridTextSize: 8,
            resize: true
        });
    });
    
    
    //6. Load image type chart
    $.ajax({
        url: "../api/v1/imagetypes/",
        dataType: "json"
    }).then(function(data) {
        
        var flotData = [];
        
        //Convert data to flot format
        for (var i = 0; i < data.length; i++) {
            
            var row = data[i];
            
            flotData.push({
                label: row["image_type"],
                data: row["total"]
            });
        }
        
        addDataColors(flotData);
        
        var chartElement = $("#image-type-pie-chart");
        
        createPieChart(chartElement, flotData);
    });


    //10. Load data by domain chart
    $.ajax({
        url: "../api/v1/domaindata/",
        dataType: "json"
    }).then(function(data) {
        
        Morris.Bar({
            element: 'domain-data-bar-chart',
            data: data,
            xkey: 'domain',
            ykeys: ['content_length_total'],
            labels: ['Number of bytes'],
            hideHover: 'auto',
            gridTextSize: 8,
            resize: true
        });
    });
    

    //12. Load user agent chart
    $.ajax({
        url: "../api/v1/useragents/",
        dataType: "json"
    }).then(function(data) {
        
        var flotData = [];
        
        //Convert data to flot format
        for (var i = 0; i < data.length; i++) {
            
            var row = data[i];
            
            flotData.push({
                label: row["user_agent"],
                data: row["total"]
            });
        }
        
        addDataColors(flotData);
        
        var chartElement = $("#user-agent-pie-chart");
        
        createPieChart(chartElement, flotData);
    });
    

});
