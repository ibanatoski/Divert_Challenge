import React, { Component } from "react";
import * as d3 from "d3";

import "./DataHub.css";
import LineGraph from "./Components/LineGraph";

import { Table, DatePicker, Select } from 'antd';

import moment from 'moment';

const { Option } = Select;
const dateFormat = 'YYYY/MM/DD';

var d3ScaleChromatic = require("d3-scale-chromatic");

class DataHub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      top10Stores: null,
      bottom10Stores: null,
      selectedStores: null,
      filteredInfo: null,
      colorMap: null,
      sortedInfo: null,
      startValue: moment('08/01/2018'),
      endValue: moment('08/29/2018'),
      endOpen: false,
      date_range: null,
      accepted_date_range: null,
      graphDisplayTotal: ["total_weight", "step_total"]
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.dataByStore !== this.props.dataByStore){
      console.log("data loaded", this.props.dataByStore);

      var keys = this.props.dataByStore.map(s => +s.store);
      // var colorScale = d3.scaleOrdinal()
      //   .domain(keys)
      //   .range(d3ScaleChromatic.schemeRdYlBu[9]);

      // this.props.dataByStore.forEach((d) => d.color = colorScale(d.store));

      var dataByStore = this.props.dataByStore.sort((a, b) => b.total_weight - a.total_weight);
      var max_date = d3.max(dataByStore, (d) => d3.max(d.values_by_date, (date) => new Date(date.key)) ),
          min_date = d3.min(dataByStore, (d) => d3.min(d.values_by_date, (date) => new Date(date.key)) );
      var data_date_extent = [min_date, max_date];
      var top10 = dataByStore.slice(0, 10);
      var bottom10 = dataByStore.slice(dataByStore.length - 10);

      this.setState({
        keys: keys,
        date_range: data_date_extent,
        accepted_date_range: data_date_extent,
        selectedStores: [dataByStore[1]],
        top10Stores: top10,
        bottom10Stores: bottom10
      });
    }
  }

  handleChange = (value, data) => {
    var stores = [];
    if(value && value.length > 0){
      value.forEach( (d) => {
        stores.push( this.props.dataByStoreHashMap[d] );
      })
      this.setState({
        selectedStores: stores
      });
    }
  }

  disabledStartDate = (startValue) => {
    const { accepted_date_range, endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf() && startValue >= accepted_date_range[0] && startValue <= accepted_date_range[1];
  }

  disabledEndDate = (endValue) => {
    const { accepted_date_range, startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf() && endValue >= accepted_date_range[0] && endValue <= accepted_date_range[1];
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    const { endValue } = this.state;
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

  handleChangeGraphType = (value) => {
    if(value === "step_total"){
      this.setState({
        graphDisplayTotal: ["total_weight", "step_total"]
      });
    }else {
      this.setState({
        graphDisplayTotal: ["total_weight", "total"]
      });
    }
  }

  validateDateRange = (start, end) => {
    if( start > this.state.data_date_extent[0] && start < this.state.data_date_extent[1]){
      if( end > this.state.data_date_extent[0] && end < this.state.data_date_extent[1] ){
        return true;
      }
    }
    return false;
  }

  render() {
    let { sortedInfo, filteredInfo } = this.state;
    const { startValue, endValue, endOpen } = this.state;

    let keyOptions = [];
    if(this.state.keys && this.state.keys.length > 0)
      keyOptions = this.state.keys.map((key) => <Option key={key}>{key}</Option>);

    // var storeNames = this.props.stores;
    // var storeNamesLoaded = (this.props.stores && this.props.stores.length > 0);

    return (
      <div className="datahub-page">
        <div className="data-display">
          {
            (this.props.dataByStore && this.props.dataByStore.length > 0)?
              <LineGraph
                data={this.props.data}
                topData={this.state.top10Stores}
                bottomData={this.state.bottom10Stores}
                selectedStores={this.state.selectedStores}
                dataByStore={this.props.dataByStore}
                total={this.state.graphDisplayTotal}
                />:
              <div className="data-display-placeholder" />
          }
        </div>

        <div className="datahub-page-date-picker">
          <div className="datahub-page-range-picker">
              <DatePicker
                disabledDate={this.disabledStartDate}
                format={dateFormat}
                style={{ width: 200, marginRight: 10 }}
                value={startValue}
                placeholder="Start"
                onChange={this.onStartChange}
                onOpenChange={this.handleStartOpenChange}
              />
              <DatePicker
                disabledDate={this.disabledEndDate}
                format={dateFormat}
                style={{ width: 200, marginRight: 10 }}
                value={endValue}
                placeholder="End"
                onChange={this.onEndChange}
                open={endOpen}
                onOpenChange={this.handleEndOpenChange}
              />
            <Select
              showSearch
              style={{ width: 200, marginRight: 10 }}
              mode="multiple"
              placeholder="Please select store name"
              onChange={(value) => this.handleChange( value, this.props.dataByStore)}
            >
              {keyOptions}
            </Select>
            <Select
              style={{ width: 200, marginRight: 10 }}
              placeholder="Please select display type"
              defaultValue={"step_total"}
              onChange={this.handleChangeGraphType}
            >
              <Option key={"step_total"} >Monthly Progress</Option>
              <Option key={"total"} >Weight Per Day</Option>
            </Select>
          </div>
        </div>

        <div className="data-table">

        </div>
      </div>
    );
  }
}

export default DataHub;
