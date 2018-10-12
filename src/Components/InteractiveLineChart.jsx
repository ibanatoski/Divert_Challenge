import React from 'react'
import PropTypes from 'prop-types'
import { withFauxDOM } from 'react-faux-dom'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'

class InteractiveLineChart extends React.Component {
  constructor (props) {
    super(props)
  }

  renderAvgLine(svg, xScale, yScale){
    const avgdata = this.props.average_data;
    const dateRange = this.props.dateRange;

    const data = avgdata.filter( (date) => new Date(date.key) >= dateRange[0] && new Date(date.key) <= dateRange[1] );

    var min = (d) => yScale(d.min);
    var max = (d) => yScale(d.max);
    var avg = (d) => yScale(d.avg);


    if(data[1].min && data[1].max){
      var area = d3.area()
        .x((d) => xScale(new Date(d.key)))
        .y0((d) => max(d))
        .y1((d) => min(d))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .attr('d', area(data))
        .attr('fill', '#ddd');

      svg.append("text")
          .attr("transform", "translate(" + xScale(new Date(data[data.length - 1].key) ) + "," + yScale(data[data.length - 1].max) + ")" )
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text("max");

      svg.append("text")
          .attr("transform", "translate(" + xScale(new Date(data[data.length - 1].key) ) + "," + yScale(data[data.length - 1].min) + ")" )
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text("min");
    }

    var avgLine = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d)=>xScale(new Date(d.key)))
      .y((d) => yScale(d.avg));

    svg.append("path")
      .attr('d', avgLine(data))
      .attr("fill", "none")
      .style("stroke", "darkGray");

    svg.append("text")
        .attr("transform", "translate(" + xScale(new Date(data[data.length - 1].key) ) + "," + yScale(data[data.length - 1].avg) + ")" )
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text("avg");
  }

  renderGraph() {
    var data = this.props.data;
    var avgData = this.props.average_data;

    // console.log("updateD3",data)

      //d3.select('select_data_line').remove('svg');

      const faux = new ReactFauxDOM.createElement('svg');

      var margin = {top: 5, right: 40, bottom: 30, left: 50},
      width = (1200) - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

      var x_extent = [0, 0];
      // x_extent[0] = d3.min(data, (d) => d3.min(d.values_by_date, (date) => new Date(date.key) ) );
      // x_extent[1] = d3.max(data, (d) => d3.max(d.values_by_date, (date) => new Date(date.key) ) );
      x_extent = [this.props.dateRange[0], this.props.dateRange[1]]
      var y_max = 0;

      if(avgData !== undefined && this.props.selector[1] === 'total'){
        y_max = d3.max(data, (d) => d3.max(d.values_by_date, (date) => +date.total ) );
      } else if(this.props.selector[1] === 'score'){
        y_max = d3.max(data, (d) => d3.max(d.values_by_date, (date) => +date.score ) );
      } else {
        y_max = d3.max(data, (d) => +d[this.props.selector[0]] );
      }

      if(avgData !== null && avgData[0].max){
        y_max = d3.max(avgData, (d) => + d.max);
      }
      // var y_max = d3.max(data, (d) => d3.max(d.values_by_date, (d) => +d.total ));

      var xScale = d3.scaleTime()
        .domain(x_extent)
        .range([0, width]);

      var yScale = d3.scaleLinear()
        .domain([0, y_max])
        .rangeRound([height - margin.bottom, margin.top]);

      var keys = data.map(s => s.store);

      // set axises
      var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m-%d-%Y"));
      var yAxis = d3.axisLeft(yScale);

      //lineHeightvar
      var line = d3.line()
      .curve(d3.curveBasis)
      .x((d) => { return xScale(new Date(d.key)); })
      .y((d) => { return yScale(d[this.props.selector[1]]); });



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
          .call(yAxis);

      if(avgData !== null){
        this.renderAvgLine(svg, xScale, yScale);
      }

      var store = svg.selectAll(".store")
      .data(data)
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
          return "translate(" + xScale(new Date(d.value.key) ) + "," + yScale(d.value[this.props.selector[1]]) + ")";
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text((d) => { return d.store; });

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height/3)
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text( (this.props.selector[1] === 'total' || this.props.selector[1] === 'step_total')? "Weight (lbs)" : "Score (Weight/Sales)");

      return faux;
  }

  render(){
    return (
      <div>
        {
          (this.props.data && this.props.data.length > 0 ) ?
            this.renderGraph(this.props.data).toReact()
          : null
        }
      </div>
    );
  }
}

InteractiveLineChart.defaultProps = {
  chart: 'loading...'
}

InteractiveLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  selector: PropTypes.arrayOf(PropTypes.string).isRequired,
  average_data: PropTypes.arrayOf(PropTypes.object),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.object).isRequired
}

const FauxChart = withFauxDOM(InteractiveLineChart);

export default FauxChart;
