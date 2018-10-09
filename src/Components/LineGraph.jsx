import React, { Component } from "react";
import * as d3 from "d3";
import "./LineGraph.css";

import moment from 'moment';

const dateFormat = 'YYYY/MM/DD';
var d3ScaleChromatic = require("d3-scale-chromatic");

class LineGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredInfo: null,
      sortedInfo: null,
      startValue: null,
      endValue: null,
      endOpen: false
    };
  }

  renderLineGraph(dataByStore, div_id){
    d3.select(`${div_id} > svg`).remove();

    var margin = {top: 5, right: 40, bottom: 30, left: 50},
    width = (500) - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    barWidth = Math.floor(width / dataByStore.length) - 1;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var x_extent = [0, 0];
    x_extent[0] = d3.min(dataByStore, (d) => d3.min(d.values_by_date, (date) => new Date(date.key) ) );
    x_extent[1] = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => new Date(date.key) ) );
    var y_max = 0;
    if(this.props.total[1] === 'total'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.total ) );
    } else {
      y_max = d3.max(dataByStore, (d) => +d[this.props.total[0]] );
    }
    var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);

    var xScale = d3.scaleTime()
      .domain(x_extent)
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, y_max])
      .rangeRound([height - margin.bottom, margin.top]);

    // set axises
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d-%Y"));
    var yAxis = d3.axisLeft(yScale);

    //lineHeightvar
    var line = d3.line()
    .curve(d3.curveMonotoneX)
    .x((d) => { return xScale(new Date(d.key)); })
    .y((d) => { return yScale(d[this.props.total[1]]); });


    var svg = d3.select(div_id).append("svg")
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

    var store = svg.selectAll(".store")
    .data(dataByStore)
    .enter().append("g")
      .attr("class", "store");

    store.append("path")
      .attr("class", "line")
      .attr("d", (d) => { return line(d.values_by_date); })
      .style("stroke", (d) => d.color);

    //line graph
    store.append("text")
      .datum( (d) => { return {store: d.store, value: d.values_by_date[d.values_by_date.length - 1]}; })
      .attr("transform", (d) => {
        return "translate(" + xScale(new Date(d.value.key) ) + "," + yScale(d.value[this.props.total[1]]) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text( (d) => { return d.store; });

  }

  renderInteractiveLineGraph(dataByStore, div_id){
    d3.select(`${div_id} > svg`).remove();

    var margin = {top: 5, right: 40, bottom: 30, left: 50},
    width = (1200) - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    barWidth = Math.floor(width / dataByStore.length) - 1;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var x_extent = [0, 0];
    x_extent[0] = d3.min(dataByStore, (d) => d3.min(d.values_by_date, (date) => new Date(date.key) ) );
    x_extent[1] = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => new Date(date.key) ) );
    var y_max = 0;
    if(this.props.total[1] === 'total'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.total ) );
    } else {
      y_max = d3.max(dataByStore, (d) => +d[this.props.total[0]] );
    }
    // var y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (d) => +d.total ));
    var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);

    var xScale = d3.scaleTime()
      .domain(x_extent)
      .range([0, width]);

    var yScale = d3.scaleLinear()
      .domain([0, y_max])
      .rangeRound([height - margin.bottom, margin.top]);

    var keys = dataByStore.map(s => s.store);

    var colorScale = d3.scaleOrdinal()
      .domain(keys)
      .range(d3ScaleChromatic.schemeRdYlBu[9]);

    // set axises
    var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d-%Y"));
    var yAxis = d3.axisLeft(yScale);

    //lineHeightvar
    var line = d3.line()
    .curve(d3.curveBasis)
    .x((d) => { return xScale(new Date(d.key)); })
    .y((d) => { return yScale(d[this.props.total[1]]); });


    var svg = d3.select(div_id).append("svg")
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

    var store = svg.selectAll(".store")
    .data(dataByStore)
    .enter().append("g")
      .attr("class", "store");

    store.append("path")
      .attr("class", "line")
      .attr("d", (d) => { return line(d.values_by_date); })
      .style("stroke", (d) => d.color);

    //line graph
    store.append("text")
      .datum((d) => { return {store: d.store, value: d.values_by_date[d.values_by_date.length - 1]}; })
      .attr("transform", (d) => {
        return "translate(" + xScale(new Date(d.value.key) ) + "," + yScale(d.value[this.props.total[1]]) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text((d) => { return d.store; });
  }

  render() {

    if(this.props.topData && this.props.topData.length > 0){
      this.renderLineGraph(this.props.topData, "#top-data-line");
    }

    if(this.props.bottomData && this.props.bottomData.length > 0){
      this.renderLineGraph(this.props.bottomData, "#bottom-data-line");
    }

    if(this.props.selectedStores && this.props.selectedStores.length > 0){
      this.renderInteractiveLineGraph(this.props.selectedStores, "#select-data-line");
    }

    return (
      <div className="line-data-page">
        <div className="line-data">
          <div className="bottom-top">
            <div>
              <h3>Top 5</h3>
              <div id="bottom-data-line" className="bottom-data-line" />
            </div>
            <div>
              <h3>Bottom 5</h3>
              <div id="top-data-line" className="top-data-line" />
            </div>
          </div>
          <h3>Selected Stores</h3>
          <div id="select-data-line" className="select-data-line" />
        </div>
      </div>
    );
  }
}

export default LineGraph;