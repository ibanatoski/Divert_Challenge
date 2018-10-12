import React, { Component } from 'react';
import * as d3 from "d3";
import { Route, Switch } from "react-router-dom";

import './App.css';
import dataSheet from './Data/cardboard_table1.csv';
import salesSheet from './Data/sales_Table1.csv';
import output from './Data/output.csv';

import Home from './Home.jsx';
import Frequency from './Frequency.jsx';
import DataHub from './DataHub.jsx';
import LineGraph from './Performance.jsx';

import SideBarMenu from './Components/SideBarMenu'

import { Layout } from 'antd';

const { Header, Sider, Content } = Layout;

var d3ScaleChromatic = require("d3-scale-chromatic");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      dataByStore: [],
      dataByDate: []
    };
  }

  componentDidMount(){

      Promise.all([
          d3.csv(dataSheet),
          d3.csv(salesSheet)
      ]).then((files) => {
        var data = files[0];
        var sales = files[1];

        // console.log("data", data);
        // console.log("dataByStore", files[2]);

        //sales hashmap
        var salesHashMap = {};
        sales.forEach( (sale) => {
          salesHashMap[sale.store] = sale.sales;
        })

        //Currate Data
        data.forEach((d) => {
          d.bale_weight_lbs = +d.bale_weight_lbs;
          d.label = +d.label;
          d.store = +d.store;
          d.date_seen = new Date(d.date_seen);
        });

        sales.forEach((d) => {
          d.store = +d.store;
          d.sales = +d.sales;
        });

        //Data by Store
        var dataByStore = d3.nest()
          .key(function(d) { return +d.store; })
          .entries(data);

        var keys = dataByStore.map(s => s.store);
        var colorScale = d3.scaleOrdinal()
          .domain(keys)
          .range(d3ScaleChromatic.schemeSpectral[9]);

        var colorHashMap = {};


        dataByStore.forEach( (store) => {
          var total = 0;
          store.values.forEach( (entry) => {
            total += entry.bale_weight_lbs;
          });
          store.total_weight = total;
          store.color = colorScale(parseInt(store.key));
          colorHashMap[store.key] = colorScale(parseInt(store.key));
        });

        dataByStore.forEach((d) => {
          d.values_by_date = d3.nest().key(function(d) { return d.date_seen; })
          .entries(d.values);
        });

        dataByStore.forEach( (store) => {
          var stepTotal = 0;
          var stepScore = 0;
          store.values_by_date.forEach( (date) => {
            var total = 0;
            date.values.forEach( (entry) => {
              total += entry.bale_weight_lbs;
            })
            stepTotal += total;
            date.total = total;
            date.step_total = stepTotal;
            date.sales_total_month = +salesHashMap[store.key];
            date.score = (stepTotal / (+salesHashMap[store.key] / 29));
          });
        });


        //Data by date
        var dataByDate = d3.nest()
          .key(function(d) { return d.date_seen; })
          .entries(data);

        dataByDate.forEach((d) => {
          d.store_day_totals = d3.nest().key(function(d) { return d.store; })
          .entries(d.values);
        });

        dataByDate.forEach((d) => {
          var storeTotal = 0;
          d.store_day_totals.forEach( (store) => {
            var total = 0;
            store.values.forEach((val) => {
              total += val.bale_weight_lbs;
            });
            store.color = colorScale(parseInt(store.store))
            store.store = parseInt(store.key);
            store.total = total;
            storeTotal += total;
          });
          d.store_sum = storeTotal;
          d.store_weight_avg = storeTotal / d.store_day_totals.length;
          d.store_weight_max = d3.max(d.store_day_totals, (val) => val.total);
          d.store_weight_min = d3.min(d.store_day_totals, (val) => val.total);
          d.store_weight_median = (( d3.max(d.store_day_totals, (val) => val.total) + d3.min(d.store_day_totals, (val) => val.total)) / 2);
        });

        var dailyStoreWeightSummary = [];
        dataByDate.forEach((date) => {
          var dateSum = {};
          dateSum.avg = date.store_weight_avg;
          dateSum.sum = date.store_sum;
          dateSum.median = date.store_weight_median;
          dateSum.max = date.store_weight_max;
          dateSum.min = date.store_weight_min;
          dateSum.date = new Date(date.key);
          dateSum.key = date.key;
          dailyStoreWeightSummary.push(dateSum);
        });

        var dataByStoreHashMap = {};
        dataByStore.forEach((d) => {
          var total = 0;
          d.values.forEach((val) => {
            total += val.bale_weight_lbs;
          });

          dataByStoreHashMap[d.key]={ ...d, total: +total, store: +d.key };
        });

        var dataByDateHashMap = {};
        dataByDate.forEach((d) => {
          dataByDateHashMap[d.key]={ ...d, storeHashMap: {} };
          d.storeHashMap = {};
          var total = 0;
          d.values.forEach((val) => {
            dataByDateHashMap[d.key].storeHashMap[`${val.store}`] = val;
            d.storeHashMap[`${val.store}`] = val;
            total += val.bale_weight_lbs;
          });

          d.total = total;
          dataByDateHashMap[d.key].dayTotal= total;
        });

        var monthlyStoreWeightSummary = [];

        var store_month_total_weight = 0;
        dataByDate.forEach((date) => {
          var dateSum = {};
          store_month_total_weight += date.store_sum;

          dateSum.sum = store_month_total_weight;
          dateSum.avg = (store_month_total_weight / date.store_day_totals.length);
          dateSum.key = date.key;
          monthlyStoreWeightSummary.push(dateSum);
        });

        sales.forEach( (d) => {
          dataByStoreHashMap[d.store].sales = d.sales;
          dataByStoreHashMap[d.store].score = (dataByStoreHashMap[d.store].total / d.sales)? (dataByStoreHashMap[d.store].total / (d.sales / 29)) : 0;
        });

        var output = [];
        for (var store in dataByStoreHashMap) {
            output.push({ store: +dataByStoreHashMap[store].key, ...dataByStoreHashMap[store]});
        }

        var dataCounts = d3.nest()
          .key(function(d) { return +d.store; })
          .rollup(function(v) { return v.length; })
          .entries(data);

        var storeNames = [];
        dataByStore.forEach((d) => {
          storeNames.push(+d.key);
        });

        storeNames = storeNames.sort((a, b) => {
          return (a - b);
        });

        var monthlyStoreScoreSummary = [];
        var store_month_total_score = 0;
        var salesSum = 0;
        sales.forEach((record) =>
          salesSum += record.sales
        );
        dataByDate.forEach((date) => {
          var dateSum = {};
          var performanceSum = 0;
          var i = 0;
          dataByStore.forEach((store) => {
            var store_monthly_progress_weight = 0;
            store.values_by_date.forEach( (val_date) => {
              if(date.key == val_date.key){
                store_monthly_progress_weight += val_date.step_total;
                i++;
              }
            });
            if(store_monthly_progress_weight > 0){
              performanceSum += store_monthly_progress_weight / (salesHashMap[store.key] / (29*store.values_by_date.length));
            }
          });
          store_month_total_score += performanceSum / dataByStore.length;
          dateSum.sum = store_month_total_score;
          dateSum.avg = (store_month_total_score / i);
          dateSum.key = date.key;
          monthlyStoreScoreSummary.push(dateSum);
        });

        this.setState({
          data: data,
          dataByStore: output,
          dataByStoreHashMap: dataByStoreHashMap,
          dataByDateHashMap: dataByDateHashMap,
          dataByDate: dataByDate,
          dataCounts: dataCounts,
          storeNames: storeNames,
          sales: sales,
          dailyStoreWeightSummary: dailyStoreWeightSummary,
          monthlyStoreWeightSummary: monthlyStoreWeightSummary,
          monthlyStoreScoreSummary: monthlyStoreScoreSummary,
          colorHashMap: colorHashMap
        });


      }).catch(function(err) {
        throw err;
      })
  }

  MenuSelect = (e) => {
    console.log(e.key);
  }

  render() {
    const {
      colorHashMap,
      storeNames,
      dataByStore,
      data,
      dataByDate,
      dataByStoreHashMap,
      dataByDateHashMap,
      dailyStoreWeightSummary,
      monthlyStoreWeightSummary,
      monthlyStoreScoreSummary
    } = this.state;

    return (
      <div className="App">
          <Layout>
            <Header style={{ color: "#FFF", fontSize: "24pt"}}>
              <div className="logo" />
              Data Viz
            </Header>
            <Layout>
              <Sider width="150px">
                  <SideBarMenu {...this.props}/>
              </Sider>
              <Content style={{ padding: "20px" }}>
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={props => <DataHub colorHashMap={colorHashMap} monthlyStoreScoreSummary={monthlyStoreScoreSummary} monthlyStoreWeightSummary={monthlyStoreWeightSummary} dailyStoreWeightSummary={dailyStoreWeightSummary} storeNames={storeNames} data={data} dataByStoreHashMap={dataByStoreHashMap} dataByStore={dataByStore} dataByDate={dataByDate} {...props} />}
                  />
                  <Route
                    path="/stores"
                    exact
                    render={props => <Home stores={storeNames} data={data} dataByStore={dataByStoreHashMap} {...props} />}
                  />
                  <Route
                    path="/frequency"
                    exact
                    render={props => <Frequency storeNames={storeNames} data={data} dataByStore={dataByStore} dataByDate={dataByDate} {...props} />}
                  />
                  <Route
                    path="/datahub"
                    exact
                    render={props => <DataHub colorHashMap={colorHashMap} monthlyStoreScoreSummary={monthlyStoreScoreSummary} monthlyStoreWeightSummary={monthlyStoreWeightSummary} dailyStoreWeightSummary={dailyStoreWeightSummary} storeNames={storeNames} data={data} dataByStoreHashMap={dataByStoreHashMap} dataByStore={dataByStore} dataByDate={dataByDate} {...props} />}
                  />
                  <Route
                    path="/performance"
                    exact
                    render={props => <LineGraph storeNames={storeNames} data={data}  dataByStore={dataByStore} dataByDate={dataByDate} {...props} />}
                  />
                </Switch>
              </Content>
            </Layout>
          </Layout>
      </div>
    );
  }
}

export default App;
