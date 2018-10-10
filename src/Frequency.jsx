import React, { Component } from "react";
import * as d3 from "d3";
import "./Frequency.css";

var d3ScaleChromatic = require("d3-scale-chromatic");

class BarChartMonth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      dataByDate: this.props.dataByDate
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.dataByDate !== this.props.dataByDate){
      // console.log("data loaded", this.props.dataByDate);
      this.renderStackedBar(this.props.dataByDate);
    }
  }

  renderStackedBar(data){
    d3.select("#frequency-data").html("");
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


    var svg = d3.select("#frequency-data").append("svg")
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

  renderLineGraph(data, dataByStore){
    d3.select("#frequency-data").html("");
    // console.log("renderLineGraph", data, dataByStore);


    var margin = {top: 20, right: 40, bottom: 30, left: 50},
    width = (1000) - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var x_extent = d3.extent(data, (d) => new Date(d.date_seen) );
    var y_max = d3.max(dataByStore, (d) => +d.total_weight );
    // var y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (d) => +d.total ));

    var xScale = d3.scaleTime()
      .domain(x_extent)
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, y_max])
      .rangeRound([height - margin.bottom, margin.top]);

    var keys = this.props.storeNames;

    var colorScale = d3.scaleOrdinal()
      .domain(keys)
      .range(d3ScaleChromatic.schemeRdYlBu[9]);

    // set axises
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d-%Y"));
    var yAxis = d3.axisLeft(yScale);

    //lineHeightvar
    var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(new Date(d.key)); })
    .y(function(d) { return yScale(d.step_total); });


    var svg = d3.select("#frequency-data").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // console.log("svg", svg);

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

    var store = svg.selectAll(".store")
    .data(dataByStore)
    .enter().append("g")
      .attr("class", "store");

    store.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values_by_date); })
      .style("stroke", (d) => colorScale(d.store));

    //line graph
    store.append("text")
      .datum(function(d) { return {store: d.store, value: d.values_by_date[d.values_by_date.length - 1]}; })
      .attr("transform", function(d) {
        return "translate(" + xScale(new Date(d.value.key) ) + "," + yScale(d.value.step_total) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.store; });

  }

  handleChange = (pagination, filters, sorter) => {
    // console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  clearFilters = () => {
    this.setState({ filteredInfo: null });
  }

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  }

  setWeightSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'total_weight',
      },
    });
  }

  render() {

    if(this.props.dataByStore && this.props.dataByStore.length > 0){
      //this.renderLineGraph(this.props.data, this.props.dataByStore);
    }

    if(this.props.dataByDate && this.props.dataByDate.length > 0){
      // console.log("data loaded", this.props.dataByDate);
      this.renderStackedBar(this.props.dataByDate);
    }

    return (
      <div className="frequency-page">
        <div className="frequency-viz">
          <div>
            <div id="frequency-data" className="frequency-data" />
          </div>
        </div>
      </div>
    );
  }
}

export default BarChartMonth;
