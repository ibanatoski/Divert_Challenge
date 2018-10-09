import React, { Component } from 'react';
import * as d3 from "d3";
import { Route, Switch } from "react-router-dom";

import './App.css';
import dataSheet from './Data/cardboard_table1.csv';
import salesSheet from './Data/sales_Table1.csv';

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
          d3.csv(salesSheet),
      ]).then((files) => {
        var data = files[0];
        var sales = files[1];

        // console.log("data", data);
        // console.log("sales", sales);

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

        dataByStore.forEach( (store) => {
          var total = 0;
          store.values.forEach( (entry) => {
            total += entry.bale_weight_lbs;
          });
          store.total_weight = total;
          store.color = colorScale(parseInt(store.key));
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
            date.score = (stepTotal / +salesHashMap[store.key]) * 100;
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
          d.store_day_totals.forEach( (store) => {
            var total = 0;
            store.values.forEach((val) => {
              total += val.bale_weight_lbs;
            });
            store.color = colorScale(parseInt(store.store))
            store.store = parseInt(store.key);
            store.total = total;
          });
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

        sales.forEach( (d) => {
          dataByStoreHashMap[d.store].sales = d.sales;
          dataByStoreHashMap[d.store].score = (dataByStoreHashMap[d.store].total / d.sales)? (dataByStoreHashMap[d.store].total / d.sales) * 100 : 0;
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

        this.setState({
          data: data,
          dataByStore: output,
          dataByStoreHashMap: dataByStoreHashMap,
          dataByDateHashMap: dataByDateHashMap,
          dataByDate: dataByDate,
          dataCounts: dataCounts,
          storeNames: storeNames
        });


      }).catch(function(err) {
        throw err;
      })
  }

  MenuSelect = (e) => {
    console.log(e.key);
  }

  render() {
    const { storeNames, dataByStore, data, dataByDate, dataByStoreHashMap, dataByDateHashMap } = this.state;

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
                    render={props => <Home stores={storeNames} data={data} dataByStore={dataByStoreHashMap} {...props} />}
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
                    render={props => <DataHub storeNames={storeNames} data={data} dataByStoreHashMap={dataByStoreHashMap} dataByStore={dataByStore} dataByDate={dataByDate} {...props} />}
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
