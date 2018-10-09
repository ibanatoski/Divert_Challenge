import React, { Component } from "react";
import * as d3 from "d3";
import { withRouter } from "react-router-dom";

import "./DataHub.css";
import LineGraph from "./Components/LineGraph";

import { Table, DatePicker, Select } from 'antd';

import moment from 'moment';

const { Option } = Select;
const dateFormat = 'YYYY/MM/DD';

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
      date_range: null,
      accepted_date_range: null,
      graphDisplayTotal: ["total_weight", "step_total"]
    };
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState.startValue !== this.state.startValue || prevState.endValue !== this.state.endValue){
      const { dataByStore } = this.state;

      var top10_temp = dataByStore.slice(0, 10);
      var bottom10_temp = dataByStore.slice(dataByStore.length - 10);

      var top10new = top10_temp.map((store) => {
        var newStore = {...store};
        newStore.values_by_date = store.values_by_date.filter((a) => {
          return (new Date(a.key) >= this.state.startValue.toDate() && new Date(a.key) <= this.state.endValue);
        });
        return newStore;
      });

      var bottom10new = bottom10_temp.map((store) => {
        var newStore = {...store};
        newStore.values_by_date = store.values_by_date.filter((a) => {
          return (new Date(a.key) >= this.state.startValue.toDate() && new Date(a.key) <= this.state.endValue);
        });
        return newStore;
      });

      var currentSelectedStores = [];
      this.state.selectedStores.forEach( (store) => {
        currentSelectedStores.push(this.props.dataByStoreHashMap[`${store.key}`]);
      });

      var selectedStores = [];
      currentSelectedStores.forEach((store) => {
        var newStore = {...store};
        newStore.values_by_date = store.values_by_date.filter((a) => {
          return (new Date(a.key) >= this.state.startValue.toDate() && new Date(a.key) <= this.state.endValue);
        });
        selectedStores.push(newStore);
      });

      //console.log("datahub data loaded", bottom10new, top10new);
      this.setState({
        selectedStores: selectedStores,
        top10: top10new,
        bottom10: bottom10new
      });
    }
    if(prevProps.dataByStore !== this.props.dataByStore){

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
        dataByStore: dataByStore,
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

  handleChangeGraphType = (value) => {
    if(value === "performance"){
      this.setState({
        graphDisplayTotal: ["score", "score"]
      });
    } else if(value === "step_total"){
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

  handleChangeTable = (pagination, filters, sorter) => {
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
    const { startValue, endValue } = this.state;


    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};


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
        return (<a>{(parseFloat(score)).toFixed(2)}%</a>);
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
              />
              <DatePicker
                disabledDate={this.disabledEndDate}
                format={dateFormat}
                style={{ width: 200, marginRight: 10 }}
                value={endValue}
                placeholder="End"
                onChange={this.onEndChange}
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
              <Option key={"performance"} >Performance</Option>
            </Select>
          </div>
        </div>

        <div className="data-table">
          <h1>Overview</h1>
          {
            (this.props.dataByStore && this.props.dataByStore.length > 0)?
              <Table style={{color: "#000"}} columns={columns} dataSource={this.props.dataByStore} onChange={this.handleChangeTable} size="middle" />:
              null
          }
        </div>
      </div>
    );
  }
}

export default withRouter(DataHub);
