import React, { Component } from "react";
import * as d3 from "d3";
import "./LineGraph.css";
// import {withFauxDOM} from 'react-faux-dom';

import ReactFauxDOM from 'react-faux-dom';

// import { XYFrame } from "semiotic";

import InteractiveLineChart from './InteractiveLineChart.jsx';

var d3ScaleChromatic = require("d3-scale-chromatic");

class LineGraph extends Component {
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

  componentDidMount () {

  }

  componentDidUpdate (prevProps, prevState){
    //console.log('Component did Update', this.props.selectedStores);
    // if(this.props.topData && this.props.topData.length > 0){
    //   this.renderLineGraph(this.props.topData, "#top-data-line");
    // }
    //
    // if(this.props.bottomData && this.props.bottomData.length > 0){
    //   this.renderLineGraph(this.props.bottomData, "#bottom-data-line");
    // }

    // if( (this.props.selectedStores && this.props.selectedStores !== prevProps.selectedStores && this.props.selectedStores.length > 0 ) ||
    //     (this.props.total && this.props.total !== prevProps.total) ||
    //     (this.props.selectedStores && this.props.selectedStores !== prevProps.selectedStores && this.props.selectedStores.length > 0 ) ){
    //   d3.select("#select_data_line").html("");
    //   this.renderInteractiveLineGraph(this.props.selectedStores, "select_data_line");
    // }
  }

  renderLineGraph(dataByStore, div_id){
    d3.select(`${div_id} > svg`).remove();

    var margin = {top: 5, right: 40, bottom: 30, left: 50},
    width = (500) - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var x_extent = [0, 0];
    x_extent[0] = d3.min(dataByStore, (d) => d3.min(d.values_by_date, (date) => new Date(date.key) ) );
    x_extent[1] = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => new Date(date.key) ) );
    var y_max = 0;
    if(this.props.total[1] === 'total'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.total ) );
    } else if(this.props.total[1] === 'score'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.score ) );
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
    //d3.select('select_data_line').remove('svg');

    const faux = new ReactFauxDOM.createElement('svg');

    var margin = {top: 5, right: 40, bottom: 30, left: 50},
    width = (1200) - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var x_extent = [0, 0];
    x_extent[0] = d3.min(dataByStore, (d) => d3.min(d.values_by_date, (date) => new Date(date.key) ) );
    x_extent[1] = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => new Date(date.key) ) );
    var y_max = 0;


    if(this.props.total[1] === 'total'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.total ) );
    } else if(this.props.total[1] === 'score'){
      y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => +date.score ) );
    } else {
      y_max = d3.max(dataByStore, (d) => +d[this.props.total[0]] );
    }
    // var y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (d) => +d.total ));

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


    var svg = d3.select(faux)
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

    var min = (d) => yScale(d.store_weight_min);
    var max = (d) => yScale(d.store_weight_max);
    var avg = (d) => yScale(d.store_weight_avg);

    var area = d3.area()
    	.x((d)=>xScale(new Date(d.key)))
    	.y0((d) => max(d))
    	.y1((d) => min(d))
  		.curve(d3.curveNatural);

    svg.append('path')
    	.attr('d', area(this.props.dayMetrics))
    	.attr('fill', '#ddd');

    var avgLine = d3.line()
      .curve(d3.curveNatural)
      .x((d)=>xScale(new Date(d.key)))
      .y((d) => yScale(d.store_weight_avg));

    svg.append("path")
      .attr('d', avgLine(this.props.dayMetrics))
      .attr("fill", "none")
      .style("stroke", "darkGray");

    svg.append("text")
        .attr("transform", "translate(" + xScale(new Date(this.props.dayMetrics[this.props.dayMetrics.length - 1].key) ) + "," + yScale(this.props.dayMetrics[this.props.dayMetrics.length - 1].store_weight_avg) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text("avg");

    var store = svg.selectAll(".store")
    .data(dataByStore)
    .enter().append("g")
      .attr("class", "store");

    store.append("path")
      .attr("class", "line")
      .attr("d", (d) => { return line(d.values_by_date); })
      .style("stroke", (d) => d.color)
			.attr("stroke-width", 2);

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

    return faux;
  }

  renderXY(data){
    // return (<XYFrame
    //   size={[ 500, 300 ]}
    //   lines={data}
    //   lineDataAccessor={"values_by_date"}
    //   lineStyle={d => ({ fill: d.color, fillOpacity: 0.5, stroke: d.color, strokeWidth: '3px' })}
    //   xAccessor={(d) => new Date(d.key)}
    //   yAccessor="step_total"
    //   lineIDAccessor="key"
    //   margin={{"top":60,"bottom":65,"left":60,"right":20}}
    //   axes={[
    //     { orient: 'left', tickFormat: d => d },
    //     { orient: 'bottom', tickFormat: d => d }
    //   ]}
    //   />);
  }

  render() {
    return (
      <div className="line-data-page">
        <div className="line-data">
          {
            (this.props.dayMetrics && this.props.selectedStores && this.props.selectedStores.length > 0 ) ?
              <InteractiveLineChart
              data={this.props.selectedStores}
              selector={this.props.total}
              average_data={this.props.dayMetrics}
              title={"hello"} />
            :null
          }


        </div>
      </div>
    );
  }
}

LineGraph.defaultProps = {
  select_data_line: 'loading'
}

export default LineGraph;
