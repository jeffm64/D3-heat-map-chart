$(document).ready(function() {

  var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  
  var margin = {top: 80, right: 80, bottom: 110, left: 80};
  
  var canvas = document.getElementById('chart').getBoundingClientRect();
  
  var w = canvas.width - margin.left - margin.right;
  var h = canvas.height - margin.top - margin.bottom;
  
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  var colors = ["#582406", "#7f3409", "#A2430C", "#C2500E", "#DE5B10", "#EF691B", "#F17731", "#F38C51", "#F59E6B", "#F7B189", "#F9C9AD"];

  //Create SVG element
  var svg = d3.select(".chart")
              .append("svg")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.top + margin.bottom)
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  

  //Gets the JSON data
  d3.json(url, function(data) {
    
    //variable for the base temperature, which is 8.66 and the monthly variance, which is the data for the array of each month's data
    var mainData = data.monthlyVariance;
    var baseTemp = data.baseTemperature;

    //makes a variable for cycling through every month in the array, making a yearData array that just contains all of the years
    var years = mainData.map(function(d) {
      return d.year;
    });

    //filters out all repeat years so the array is now every year from 1753 to 2015
    years = years.filter(function(d, i) {
      return years.indexOf(d) === i;
    });
    
    //creates an array for all the heat variances in all the months
    var tempVariances = mainData.map(function(d) {
      return d.variance;
    });
    
    //size of the heat boxes
    var boxW = w / years.length;
    var boxH = h / months.length;
    
    //finds the earliest and latest years and returns them
    var minYear = d3.min(years);
    var maxYear = d3.max(years);
    
    //finds the lowest and highest variances and returns them
    var minVariance = d3.min(tempVariances);
    var maxVariance = d3.max(tempVariances);
    
    //creates a data with the years as the min and max, and the month as 0
    var minDate = new Date(minYear, 0);
    var maxDate = new Date(maxYear, 0);
    
    //creates a scale for changing the colors of the heatmap boxes depending on their variance number
    var colorScale = d3.scaleQuantile()
                       .domain([minVariance + baseTemp, maxVariance + baseTemp])
                       .range(colors);
    
    //scale for x axis
    var xScale = d3.scaleTime()
                   .domain([minDate, maxDate])
                   .range([0, w]);
    
    //scale for y axis
    var yScale2 = d3.scalePoint()
            .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
            .range([0, h]);
    
    //sets up the x and y axis
    var xAxis = d3.axisBottom(xScale)
                  .ticks(26);
    
    var yAxis = d3.axisLeft(yScale2)
                .ticks(10);
    
    
    var heatBoxes = svg.selectAll(".years")
                   .data(mainData, function(d) {
                      return (d.year + ':' + d.month);
                   })
                   .enter()
                   .append("rect")
                   .attr("x", function(d) {
                     return ((d.year - minYear) * boxW);
                   })
                   .attr("y", function(d) {
                     return ((d.month - 1) * boxH);
                   })
                   .attr("rx", 0)
                   .attr("ry", 0)
                   .attr("width", boxW)
                   .attr("height", boxH)
                   .style("fill", function(d) {
                      return colorScale(d.variance + baseTemp);
                   })
                   .on("mouseover", function(d, i) {
                    //Get hovered bar's x/y values, then work it for the tooltip
                      var xPosition = parseFloat(d3.select(this).attr("x")) + xScale / 6;
                      var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

                      //changes tooltip position and year
                      d3.select("#tooltip")
                        .style("left", d3.event.pageX - 100 + "px")
                        .style("top", d3.event.pageY + "px")
                        .select(".month")
                        .text(months[d.month - 1]);

                       //changes variance of tooltip
                      d3.select("#tooltip")
                        .select(".year")
                        .text(mainData[i].year);

                      //changes temperature of tooltip
                      d3.select("#tooltip")
                        .select(".temperature")
                        .text(Math.floor((d.variance + baseTemp) * 1000) / 1000 );

                      //changes variance of tooltip
                      d3.select("#tooltip")
                        .select(".variance")
                        .text(mainData[i].variance);

                      //show tooltip
                      d3.select("#tooltip").classed("hidden", false);

                 })
                 .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);

                 });

    
    //creates x axis and label
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (h) + ")")
        .call(xAxis);
    
    svg.append("text")
        .attr("transform", "translate(" + (w / 2) + " ," + (h * 1.1) + ")")
        .attr("class", "x-axis-label")
        .style("text-anchor", "middle")
        .text("Year");
    
    //creates y axis and label
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("class", "y-axis-label")
        .attr("y", (0 - margin.left))
        .attr("x", 0 - (h / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Months");
    
    //creates the legend for the heatmap   
    var linear = d3.scaleLinear()
      .domain([0,11])
      .range(["#582406", "#F9C9AD"]);

    d3.select("svg")
    svg.append("g")
      .attr("class", "legendLinear")
      .attr("transform", "translate(0," + (h + 55) + ")");

    var legendLinear = d3.legendColor()
      .shapeWidth(35)
      .shapeHeight(30)
      .cells([0, 2.7, 3.9, 5, 6.1, 7.2, 8.3, 9.4, 10.5, 11.6, 12.7])
      .orient('horizontal')
      .scale(linear);

    svg.select(".legendLinear")
      .call(legendLinear);
    
    //hide x-axis on smaller screens
      if ($(window).width() < 600) {
         $(".x-axis text").hide();
      }
      else {
         $(".x-axis text").show();
      };
    
    
    //updates chart upon resize
    d3.select(window)
    .on("resize", function() {
      
      //hide x-axis on smaller screens
      if ($(window).width() < 600) {
         $(".x-axis text").hide();
      }
      else {
         $(".x-axis text").show();
      };
      
      canvas = document.getElementById('chart').getBoundingClientRect();
      w = canvas.width - margin.left - margin.right;
      h = canvas.height - margin.top - margin.bottom;
      
      //Create SVG element
      d3.select("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      //size of the heat boxes
      boxW = w / years.length;
      boxH = h / months.length;
      
      //resizes boxes
       svg.selectAll("rect")
       .data(mainData, function(d) {
          return (d.year + ':' + d.month);
       })
       .attr("x", function(d) {
         return ((d.year - minYear) * boxW);
       })
       .attr("y", function(d) {
         return ((d.month - 1) * boxH);
       })
       .attr("width", boxW)
       .attr("height", boxH);
      
      //scale for x axis
      xScale = d3.scaleTime()
                     .domain([minDate, maxDate])
                     .range([0, w]);

      //scale for y axis
      yScale2 = d3.scalePoint()
              .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
              .range([0, h]);
      
      //sets up the x and y axis
      xAxis = d3.axisBottom(xScale)
                    .ticks(26);

      yAxis = d3.axisLeft(yScale2)
                  .ticks(10);
      
      //creates x axis and label
      svg.select(".x-axis")
          .attr("transform", "translate(0," + (h) + ")")
          .call(xAxis);

      svg.select(".x-axis-label")
          .attr("transform", "translate(" + (w / 2) + " ," + (h * 1.1) + ")");

      //creates y axis and label
      svg.select(".y-axis")
          .attr("transform", "translate(0, 0)")
          .call(yAxis);

      svg.select(".y-axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", (0 - margin.left))
          .attr("x", 0 - (h / 2));
      
      svg.select(".legendLinear")
        .attr("transform", "translate(0," + (h + 55) + ")")
        .call(legendLinear);
      
      
    });
          
        
    
    
  });

  
  
  
  
  
  
  
});