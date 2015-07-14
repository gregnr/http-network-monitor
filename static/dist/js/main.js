var createPieChart = function(chartElement, data) {

    var labelFormatter = function(label) {
        return "<span style='color: #000000; padding-left: 5px;'>" + label + "<span/>";
    };
    
    var plotObj = $.plot(chartElement, data, {
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

$(document).ready(function() {

    //Load domain chart
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
    
    
    //Load content type chart
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
        
        var chartElement = $("#content-type-pie-chart");
        
        createPieChart(chartElement, flotData);
    });
    
    
    //Load server chart
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
    
    
    //Load image type chart
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
        
        var chartElement = $("#image-type-pie-chart");
        
        createPieChart(chartElement, flotData);
    });
});
