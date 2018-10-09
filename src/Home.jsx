import React, { Component } from "react";
import * as d3 from "d3";
import "./Home.css";

import { Menu, Select, Icon } from 'antd';

class BarChartMonth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storeSelected: null,
      dataByStore: this.props.dataByStore
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.dataByStore !== this.props.dataByStore){
      //console.log("data loaded", this.props.dataByStore);
      this.setState({
        storeSelected: this.props.dataByStore["1"]
      });
    }
  }

  renderBar(data, storeName){

    //console.log('store data', storeName, data);

    var margin = {top: 20, right: 40, bottom: 60, left: 100},
    width = Math.max((data.length * 10) - margin.left - margin.right, 500),
    height = 500 - margin.top - margin.bottom,
    barWidth = 20;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var y_extent = [0, d3.max(data, (d) => +d.bale_weight_lbs )];
    var x_extent = d3.extent(data, (d) => d.date_seen );

    var xScale = d3.scaleBand()
      .domain(data.map((d) => d.date_seen))
      .range([0, width])
      .padding(0.1);
    var yScale = d3.scaleLinear()
      .domain(y_extent)
      .range([height, 0]);

    //set axises
    var xAxis = d3.axisBottom(xScale)
      .tickFormat((d) => {
        return (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
    });
    var yAxis = d3.axisLeft(yScale);

    var svg = d3.select("#home-data").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 3))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Store:" + storeName);

    //X Axis Text
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
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

    //Draw Bars
    svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.date_seen))
      .attr("width", xScale.bandwidth())
      .attr("fill", "steelblue")
      .attr("y", function(d) {
        return yScale(d.bale_weight_lbs);
      })
      .attr("height", function(d) {
        return height - yScale(d.bale_weight_lbs);
      });
  }

  handleChange(value, data) {

    var store = this.props.dataByStore[value];

    if(store){
      d3.select("#home-data").html("");

      this.setState({
        storeSelected: store
      });
    }
  }

  // renderOptions(data){
  //   // data = data.sort((a, b) => {
  //   //   return (parseInt(a.key) - parseInt(b.key));
  //   // });
  //
  //   var renderedMenu = [];
  //   if(data && data.length > 0){
  //     this.props.stores.map((d, i)=> {
  //       renderedMenu.push(<Select.Option key={i} value={d.key}>{d.key}</Select.Option>);
  //     })
  //   }
  //
  //   return renderedMenu;
  // }

  render() {

    //console.log("dataByStore", this.props.dataByStore);
    //console.log("render", this.props.stores);
    if(this.state.storeSelected && this.props.data !== undefined ){
      this.renderBar(this.state.storeSelected.values, this.state.storeSelected.key);
    }

    // var storeNames = this.props.stores;
    // var storeNamesLoaded = (this.props.stores && this.props.stores.length > 0);

    return (
      <div className="home-page">
        <Select
          showSearch
          placeholder="Select a Store"
          style={{ width: 200 }}
          onChange={(value) => this.handleChange( value, this.props.dataByStore)}
          >
          {
            (this.props.stores && this.props.stores.length > 0)?
              this.props.stores.map((d, i) => {return (<Select.Option key={d} value={d}>{d}</Select.Option>)}):
              null
          }
        </Select>
        <div id="home-data" className="home-data">
        </div>
      </div>
    );
  }
}

export default BarChartMonth;
