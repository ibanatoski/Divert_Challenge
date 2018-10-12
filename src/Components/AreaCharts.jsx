import React from 'react'
import PropTypes from 'prop-types'
import { withFauxDOM } from 'react-faux-dom'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'
// import './AreaCharts.css';

import Tooltip from './ToolTip.jsx';

class AreaCharts extends React.Component {
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
    // console.log(data);

    const faux = new ReactFauxDOM.createElement('svg');

    var margin = {top: 5, right: 40, bottom: 5, left: 50},
    width = (1200) - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

    var y_max = d3.max(data, (date) => date.values.length) + 3;

    var xScale = d3.scaleTime()
      .domain([this.props.dateRange[0], this.props.dateRange[1]])
      .range([0, width]);

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

    var area = d3.area()
        .curve(d3.curveLinear)
        .x(d => xScale(new Date(d.key)))
        .y0(height - margin.bottom)
        .y1(d => yScale(d.values.length))

    svg.append("path")
      .datum(data)
      .attr("fill", color)
      .attr("d", area);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("opacity", "0.2")
        .attr("stroke", "#FFF")
        .attr("r", 3.5)
        .attr("cx", d => xScale(new Date(d.key)) )
        .attr("cy", d => yScale(d.values.length) );

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
            this.props.data.map((store) => this.renderAreaChart(store.values_by_date, store.color, store.store))
          : null
        }
      </div>
    );
  }
}

AreaCharts.defaultProps = {
  chart: 'loading...'
}

AreaCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.object).isRequired
}

const FauxChart = withFauxDOM(AreaCharts);

export default FauxChart;
