import React from 'react'
import PropTypes from 'prop-types'
import { withFauxDOM } from 'react-faux-dom'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'
// import './AreaCharts.css';

import Tooltip from './ToolTip.jsx';

class BarCharts extends React.Component {
  constructor (props) {
    super(props)
    // this.renderD3 = this.renderD3.bind(this)
    // this.updateD3 = this.updateD3.bind(this)
  }

  componentDidMount () {
    // this.renderD3()
  }

  renderAreaChart(values_by_date, color, store) {
    var data = values_by_date;
    console.log(data);

    const faux = new ReactFauxDOM.createElement('svg');

    var margin = {top: 5, right: 40, bottom: 5, left: 50},
    width = (1200) - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var y_max = d3.max(data, (date) => (date.store_day_totals.length > 0) ? d3.max(date.store_day_totals, (store) => store.total) : 0);

    var xScale = d3.scaleTime()
      .domain([this.props.dateRange[0], this.props.dateRange[1]])
      .range([0, width]);

    var x1 = d3.scaleBand()
      .padding(0.05);

    var yScale = d3.scaleLinear()
      .domain([0, y_max])
      .rangeRound([height - margin.bottom, margin.top]);

    // set axises
    var xAxis = d3.axisBottom(xScale).ticks(0);
    var yAxis = d3.axisLeft(yScale).ticks(3);
    var xAxisTop = d3.axisTop(xScale).ticks(0);


    var svg = d3.select(faux)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var keys = this.props.storeNames.map((store) => store.store);
    x1.domain(keys).rangeRound([0, (width/data.length)]);

console.log(data);
    svg.append("g")
    .selectAll("g")
    .data(data )
    .enter().append("g")
      .attr("transform", (d) => { return "translate(" + xScale(new Date(d.key)) + ",0)"; })
    .selectAll("rect")
    .data((d) => { return keys.map((key) => { return {key: key, value: {key: d.key, totals: d.store_day_totals} }; }); })
    .enter().append("rect")
      .attr("x", (d) => {
        return x1(d.key);
      })
      .attr("y", (d) => {
        console.log(d);
        return (d.value.length > 0) ? height - yScale(d.value[0].total) : 0; })
      .attr("width", width/data.length/this.props.storeNames.length)
      .attr("height", (d) => { return ((d.value.length > 0) ? yScale(d.value[0].total) : 0); })
      .attr("fill", (d) => this.props.colorHashMap[d.key]);

    //X Axis Text
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height - margin.bottom) + ")")
      .call(xAxis)
    .selectAll("text").remove();

    //Y Axis Text
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(store);

    //Y Axis Text
    svg.append("g")
        .attr("class", "x axis")
        .call(xAxisTop)

    return faux.toReact();
  }

  render(){
    return (
      <div key={1} className="areacharts">
        {
          (this.props.data && this.props.data.length > 0 ) ?
            this.renderAreaChart(this.props.data)
          : null
        }
      </div>
    );
  }
}

BarCharts.defaultProps = {
  chart: 'loading...'
}

BarCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.object).isRequired
}

const FauxChart = withFauxDOM(BarCharts);

export default FauxChart;


/*
{
  (this.state.selectedStores && this.state.selectedStores.length > 0 && this.state.selectedDates && this.state.selectedDates.length > 0)?
    <BarCharts
      data={this.state.selectedDates}
      dateRange={[this.state.startValue, this.state.endValue]}
      storeNames={this.state.selectedStores}
      colorHashMap={this.props.colorHashMap}
      />:
      <div className="data-display-placeholder" />
}
*/
