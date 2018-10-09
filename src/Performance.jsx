import React, { Component } from "react";
import * as d3 from "d3";
import "./Performance.css";

import moment from 'moment';

import { Table, DatePicker } from 'antd';

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
      endOpen: false,
      dataByDate: this.props.dataByDate
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.dataByDate !== this.props.dataByDate){
      //console.log("data loaded", this.props.dataByDate);
      var date_extent = d3.extent(this.props.data, (d) => new Date(d.date_seen) );
      this.setState({
        date_extent: date_extent
      });
    }
  }

  renderLineGraph(data, dataByStore, extent){

    data = data.filter((d) => moment(d.date_seen) >= extent[0] && moment(d.date_seen) <= extent[1]);
    dataByStore.forEach( (d) => {
      d.values_by_date.filter( (d) => moment(d.key) >= extent[0] && moment(d.key) <= extent[1]);
    });

    d3.select("#frequency-data > svg").remove();
    //console.log("renderLineGraph", data, dataByStore, extent);


    var margin = {top: 20, right: 40, bottom: 30, left: 50},
    width = (1000) - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    barWidth = Math.floor(width / data.length) - 1;

    //Set the x & y bounds via scale (how much space there is to draw the viz)
    var x_extent = d3.extent(data, (d) => new Date(d.date_seen) );
    var y_max = d3.max(dataByStore, (d) => +d.total_weight );
    // var y_max = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (d) => +d.total ));
    var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);

    var xScale = d3.scaleTime()
      .domain(extent)
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
    //console.log('Various parameters', pagination, filters, sorter);
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

  disabledStartDate = (startValue) => {
    const { date_extent, endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf() && startValue >= date_extent[0] && startValue <= date_extent[1];
  }

  disabledEndDate = (endValue) => {
    const { date_extent, startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf() && endValue >= date_extent[0] && endValue <= date_extent[1];
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  render() {

    let { sortedInfo, filteredInfo } = this.state;
    const { startValue, endValue, endOpen } = this.state;

    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};

    // console.log("dataByStore", this.props.dataByStore);
    //console.log("render", this.props.stores);
    // if(this.props.dataByDate && this.props.dataByDate.length > 0){
    //   this.renderLineGraph(this.props.dataByDate);
    // }

    if(this.props.dataByStore && this.props.dataByStore.length > 0 && this.state.date_extent){
      this.renderLineGraph(this.props.data, this.props.dataByStore, this.state.date_extent);
    }

    if(this.props.dataByStore && this.props.dataByStore.length > 0 && (this.state.startValue && this.state.endValue)){
      this.renderLineGraph(this.props.data, this.props.dataByStore, [this.state.startValue, this.state.endValue]);
    }

    const columns = [{
      title: 'Store',
      dataIndex: 'store',
      key: 'store',
      sorter: (a, b) => {
        return a.store - b.store;
      },
      sortOrder: sortedInfo.columnKey === 'store' && sortedInfo.order,
      render: store => <a>{store}</a>,
    }, {
      title: 'Total Weight (lbs)',
      dataIndex: 'total_weight',
      key: 'total_weight',
      sorter: (a, b) => {
        return a.total_weight - b.total_weight;
      },
      sortOrder: sortedInfo.columnKey === 'total_weight' && sortedInfo.order,
      render: weight => {
        return (<a>{weight}</a>);
      }
    }, {
      title: 'Score (lbs/sales)',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => {
        return a.score - b.score;
      },
      sortOrder: sortedInfo.columnKey === 'score' && sortedInfo.order,
      render: score => {
        return (<a>{(parseFloat(score) * 100).toFixed(2)}%</a>);
      }
    }, {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a, b) => {
        return a.sales - b.sales;
      },
      sortOrder: sortedInfo.columnKey === 'sales' && sortedInfo.order,
      render: sales => {
        return (<a>{sales}</a>);
      }
    }];

    // var storeNames = this.props.stores;
    // var storeNamesLoaded = (this.props.stores && this.props.stores.length > 0);

    return (
      <div className="frequency-page">
        <div className="frequency-viz">
          <div>
            <div id="frequency-data" className="frequency-data" />
          </div>
          <div className={"range-picker"}>
              <DatePicker
                disabledDate={this.disabledStartDate}
                format={dateFormat}
                value={startValue}
                placeholder="Start"
                onChange={this.onStartChange}
                onOpenChange={this.handleStartOpenChange}
              />
              <DatePicker
                disabledDate={this.disabledEndDate}
                format={dateFormat}
                value={endValue}
                placeholder="End"
                onChange={this.onEndChange}
                open={endOpen}
                onOpenChange={this.handleEndOpenChange}
              />
          </div>
          <div>
            <h1>Overview</h1>
            {
              (this.props.dataByStore && this.props.dataByStore.length > 0)?
                <Table style={{color: "#000"}} columns={columns} dataSource={this.props.dataByStore} onChange={this.handleChange} size="middle" />:
                null
            }
          </div>
        </div>
      </div>
    );
  }
}

export default LineGraph;
