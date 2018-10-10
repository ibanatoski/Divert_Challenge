import React, { Component } from "react";
import * as d3 from "d3";
import "./LineGraph.css";

var d3ScaleChromatic = require("d3-scale-chromatic");

class StackedBarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      startValue: null,
      endValue: null,
      endOpen: false,
      topData: null,
      bottomData: null,
      dataByStore: null
    };
  }

  componentDidMount(){
    console.log('Component did mount');
    // if(this.props.topData && this.props.topData.length > 0){
    //   this.renderLineGraph(this.props.topData, "#top-data-line");
    // }
    //
    // if(this.props.bottomData && this.props.bottomData.length > 0){
    //   this.renderLineGraph(this.props.bottomData, "#bottom-data-line");
    // }
    //
    // if(this.props.selectedStores && this.props.selectedStores.length > 0){
    //   d3.select("#select-data-line").html("");
    //   this.renderInteractiveLineGraph(this.props.selectedStores, "#select-data-line");
    // }
  }

  componentDidUpdate (prevProps, prevState){
    console.log('Component did Update');
    // if(this.props.topData && this.props.topData.length > 0){
    //   this.renderLineGraph(this.props.topData, "#top-data-line");
    // }
    //
    // if(this.props.bottomData && this.props.bottomData.length > 0){
    //   this.renderLineGraph(this.props.bottomData, "#bottom-data-line");
    // }

    if(this.props.selectedStores && this.props.selectedStores.length > 0){
      d3.select("#select-data-bar").html("");
      this.renderStackedBar(this.props.dataByDate, "#select-data-bar");
    }
  }

  renderStackedBar(data, div_id){
      d3.select("#select-data-bar").html("");
      //console.log("renderStackedBar", data);
      var margin = {top: 20, right: 40, bottom: 100, left: 50},
      width = (1000) - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom,
      barWidth = Math.floor(width / data.length) - 1;

      //Set the x & y bounds via scale (how much space there is to draw the viz)
      var y_extent = d3.extent(data, (d) => +d.total );

      var xScale = d3.scaleBand()
        .domain(data.map((d) => new Date(d.key) ))
        .range([0, width])
        .padding(0.1);

      var yScale = d3.scaleLinear()
        .domain([0, y_extent[1]])
        .rangeRound([height - margin.bottom, margin.top]);

      var keys = this.props.storeNames;

      var colorScale = d3.scaleOrdinal()
        .domain(keys)
        .range(d3ScaleChromatic.schemeRdYlBu[9]);

      var stackedStores = d3.stack()
        .keys(keys)
        .value((d, key) => {
          //add the total for each store on that day
          return (d.store_day_totals[key] && d.store_day_totals[key].total) ? d.store_day_totals[key].total : 0;
        })(data);
      //console.log("stackedStores", stackedStores);

      // set axises
      var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d-%Y"));
      var yAxis = d3.axisLeft(yScale);


      var svg = d3.select("#select-data-bar").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //X Axis Text
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

      //Y Axis Text
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", height / 2)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Weight (lbs)");

      svg.append("g")
        .selectAll("g")
        .data(stackedStores)
        .enter()
        .append("g")
        .attr("fill", (d) => colorScale(d.key))
        .selectAll("rect")
        .data((d) => d)
        .enter().append("rect")
        .attr("x", (d) => { return xScale(new Date(d.data.key)); })
        .attr("y", (d) => { return yScale(d[1]); })
        .attr("height", (d) => { return (yScale(d[0]) - yScale(d[1])); })
        .attr("width", barWidth)
        .on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
          var xPosition = d3.mouse(this)[0] - 15;
          var yPosition = d3.mouse(this)[1] - 25;
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text(d[1] - d[0]);
        });


      // Prep the tooltip bits, initial display is hidden
      var tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

      tooltip.append("rect")
        .attr("width", 50)
        .attr("height", 40)
        .attr("fill", "white")
        .style("opacity", 0.5);

      tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
  }

  render() {
    return (
      <div className="line-data-page">
        <div className="line-data">
          <div id="select-data-bar" className="select-data-bar" />
        </div>
      </div>
    );
  }
}

export default StackedBarChart;
