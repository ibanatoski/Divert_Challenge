import React from 'react'
import PropTypes from 'prop-types'
import * as d3 from 'd3'
// import './AreaCharts.css';

//import Tooltip from './ToolTip.jsx';

class AreaChartReact extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {
    // this.renderD3()
  }

  renderAreaChart(values_by_date, color) {
    var data = values_by_date;
    console.log(data);


    // var margin = {top: 1, right: 40, bottom: 1, left: 50},
    // width = (1200) - margin.left - margin.right,
    // height = 50 - margin.top - margin.bottom;
    //
    // var y_max = d3.max(data, (date) => date.values.length) + 3;
    //
    // var xScale = d3.scaleTime()
    //   .domain([this.props.dateRange[0], this.props.dateRange[1]])
    //   .range([0, width]);
    //
    // var yScale = d3.scaleLinear()
    //   .domain([0, y_max])
    //   .rangeRound([height - margin.bottom, margin.top]);


//
    // // set axises
    // var xAxis = d3.axisBottom(xScale).ticks(0);
    // var yAxis = d3.axisLeft(yScale).ticks(0);
    // var yAxisTop = d3.axisTop(xScale).ticks(0);
    //
    //
    // var svg = d3.select(faux)
    //   .attr("width", width + margin.left + margin.right)
    //   .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //
    // //X Axis Text
    // svg.append("g")
    //   .attr("class", "x axis")
    //   .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    //   .call(xAxis)
    // .selectAll("text").remove();
    //
    // //Y Axis Text
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis);
    //     // text label for the y axis
    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left/2)
    //     .attr("x",0 - (height / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .text(data.store);
    //
    // //Y Axis Text
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxisTop)
    //
    // var area = d3.area()
    //     .curve(d3.curveMonotoneX)
    //     .x(d => xScale(new Date(d.key)))
    //     .y0(height)
    //     .y1(d => yScale(d.values.length))
    //
    // svg.append("path")
    //   .datum(data)
    //   .attr("fill", color)
    //   .attr("d", area)
    //   .attr("transform", "translate(" + margin.bottom + ", -" + margin.top + ")");

    //return faux;
  }

  // createChart = (_self) => {
  //     this.w = this.state.width - (this.state.margin.left + this.state.margin.right);
  //     this.h = this.state.height - (this.state.margin.top + this.state.margin.bottom);
  //
  //     this.yScale = d3.scaleLinear()
  //         .domain([0,d3.max(this.props.data,function(d){
  //             return d[_self.props.yData]+_self.props.yMaxBuffer;
  //         })])
  //         .range([this.h, 0]);
  //
  //     this.xScale = d3.scaleTime()
  //       .domain([this.props.dateRange[0], this.props.dateRange[1]])
  //       .range([0, this.w]);
  //
  //     this.yScale = d3.scaleLinear()
  //       .domain([0, y_max])
  //       .rangeRound([this.h - margin.bottom, margin.top]);
  //
  //     this.area = d3.svg.area()
  //         .x(function (d) {
  //             return this.xScale(d[_self.props.xData]);
  //         })
  //         .y0(this.h)
  //         .y1(function (d) {
  //             return this.yScale(d[_self.props.yData]);
  //         }).interpolate(this.props.interpolations);
  //
  //
  //     var interpolations = [
  //         "linear",
  //         "step-before",
  //         "step-after",
  //         "basis",
  //         "basis-closed",
  //         "cardinal",
  //         "cardinal-closed"];
  //
  //     this.line = d3.svg.line()
  //         .x(function (d) {
  //             return this.xScale(d[_self.props.xData]);
  //         })
  //         .y(function (d) {
  //             return this.yScale(d[_self.props.yData]);
  //         }).interpolate(this.props.interpolations);
  //
  //
  //     this.transform='translate(' + this.props.margin.left + ',' + this.props.margin.top + ')';
  // }

  getMinX() {
    const {dateRange} = this.props;
    return dateRange[0];
  }
  getMaxX() {
    const {dateRange} = this.props;
    return dateRange[1];
  }
  // GET MAX & MIN Y
  getMinY() {
    return 0;
  }
  getMaxY() {
    const {data} = this.props;
    return d3.max(data, (date) => date.values.length) + 3;
  }
  getSvgX(x) {
    const {svgWidth, xScale} = this.props;
    console.log(x);
    return svgWidth - xScale(x);
  }
  getSvgY(y) {
    const {svgHeight, yScale} = this.props;
    return svgHeight - (yScale(y));
  }

  makePath() {
    const {data, color} = this.props;
    console.log(data);
    let pathD = "M " + this.getSvgX(new Date(data[0].key)) + " " + this.getSvgY(data[0].values.length) + " ";
    pathD += data.map((point, i) => {
          return "L " + this.getSvgX(new Date(point.key)) + " " + this.getSvgY(point.values.length) + " ";
    });
    return (
      <path className="linechart_path" d={pathD} style={{stroke: color, fill: "none"}} />
    );
  }

  render() {
    const {svgHeight, svgWidth} = this.props;

    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {this.makePath()}
        {
          //this.makeAxis()
        }
      </svg>
    );
  }
}

AreaChartReact.defaultProps = {
  chart: 'loading...'
}

// AreaChartReact.propTypes = {
//   data: PropTypes.arrayOf(PropTypes.object).isRequired,
//   dateRange: PropTypes.arrayOf(PropTypes.object).isRequired
// }

export default AreaChartReact;





/* Call to the component

{
  (this.state.startValue && this.state.endValue && this.state.selectedStores && this.state.selectedStores.length > 0)?
    this.state.selectedStores.map((store) => <AreaChartReact
    key={store.store}
    svgHeight={100}
    svgWidth={500}
    data={store.values_by_date}
    color={store.color}
    xScale={
      d3.scaleTime()
      .domain([this.state.startValue, this.state.endValue])
      .range([0, 500])
    }
    yScale={
      d3.scaleLinear()
      .domain([0, d3.max(store.values_by_date, (date) => date.values.length) + 3])
      .range([0, 100])
    }
    dateRange={[this.state.startValue, this.state.endValue]} />)
    :null
}

*/
