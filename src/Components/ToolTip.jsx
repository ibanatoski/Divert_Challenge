import React from 'react'
import PropTypes from 'prop-types'
import { ResponsiveXYFrame } from "semiotic";
import { withFauxDOM } from 'react-faux-dom'
import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'
// import './AreaCharts.css';

//import Tooltip from './ToolTip.jsx';
import { XYFrame } from "semiotic";


class ToolTipAreaCharts extends React.Component {
  constructor (props) {
    super(props)
    // this.renderD3 = this.renderD3.bind(this)
    // this.updateD3 = this.updateD3.bind(this)
  }

  componentDidMount () {
    // this.renderD3()
  }

  renderAreaChart(values_by_date, color) {
    var data = values_by_date;
    console.log(data);

    const faux = new ReactFauxDOM.createElement('div');

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

    return faux;
  }

  render(){
    return (
      <div className="areacharts">
        {
          (this.props.data && this.props.data.length > 0 ) ?
          <div className="chart">
              <XYFrame
                size={[ 1200, 50 ]}
                lines={this.props.data}
                lineDataAccessor={"values_by_date"}
                lineStyle={d => ({ fill: d.color, fillOpacity: 0.5, stroke: d.color, strokeWidth: '3px' })}
                xAccessor={(d) => new Date(d.key)}
                yAccessor={(d) => (d.values.length)}
                lineIDAccessor="key"
                margin={{"top":60,"bottom":65,"left":60,"right":20}}
                axes={[
                  { orient: 'left', tickFormat: d => d },
                  { orient: 'bottom', tickFormat: d => d }
                ]}
                hoverAnnotation={true}
                />
            {
            // this.props.data.map((store) => this.renderAreaChart(store.values_by_date, store.color).toReact())
            }
          </div>
          : null
        }
      </div>
    );
  }
}

ToolTipAreaCharts.defaultProps = {
  chart: 'loading...'
}

ToolTipAreaCharts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateRange: PropTypes.arrayOf(PropTypes.object).isRequired
}

const FauxChart = withFauxDOM(ToolTipAreaCharts);

export default FauxChart;
