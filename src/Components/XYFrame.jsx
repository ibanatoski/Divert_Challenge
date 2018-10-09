import React from 'react';
import * as d3 from "d3";
import * as d3Color from "d3-scale-chromatic";
import { line } from 'd3-shape'
import { ResponsiveXYFrame } from "semiotic";
import { scaleTime } from 'd3-scale';

var color = {
  CLETPUS: "black", //Coal
  PAETPUS: "#19586D", //Petroleum
  NGETPUS: "#ffcc00", //Natural Gas
  OJETPUS: "#D3D3D3", //Other Gases
  NUETPUS: "#81FF14", //Nuclear
  HPETPUS: "blue", //Hydroelectric Pumped Storage
  HVETPUS: "blue", //Conventional Hydroelectric Power
  WDETPUS: "brown", //Wood
  WSETPUS: "#847e08", //Waste
  GEETPUS: "#ee3b3b", //Geothermal
  SOETPUS: "#ffd900", //Solar
  WYETPUS: "#ADD8E6", //Wind
  ELETPUS: "red" //total
};

var name = {
  CLETPUS: "Coal", //Coal
  PAETPUS: "Petroleum", //Petroleum
  NGETPUS: "Natural Gas", //Natural Gas
  OJETPUS: "Other Gases", //Other Gases
  NUETPUS: "Nuclear", //Nuclear
  HPETPUS: "Hydroelectric Pumped Storage", //Hydroelectric Pumped Storage
  HVETPUS: "Conventional Hydroelectric Power", //Conventional Hydroelectric Power
  WDETPUS: "Wood", //Wood
  WSETPUS: "Waste", //Waste
  GEETPUS: "Geothermal", //Geothermal
  SOETPUS: "Solar", //Solar
  WYETPUS: "Wind", //Wind
  ELETPUS: "Total" //total
};

export class Semiotic_Line_Graph extends React.Component {
  constructor(props) {
      super(props);
   }

   render() {
      //console.log("props", this.props);
      var annotations = this.props.annotations;
      // console.log("semiotic line", data);
      let data = JSON.parse(JSON.stringify(this.props.data));
      data = data.filter(function(msn){ return (msn.MSN == "CLETPUS" || msn.MSN == "NGETPUS")});

      data.forEach(function(msn){
        msn.coordinates = msn.coordinates.filter( function(year){
          return ((new Date(year.YYYYMM).getFullYear()) > 2000);
        });
      });


      const chartAxes = [
        {orient: "left", ticks: 4, label:'Million MWh', tickFormat: function(d) {
          return d/100000;}},
        {orient: "bottom", ticks: 5, tickFormat: function(d) {
          return new Date(d).getFullYear();
        }}
      ]

      const chartSettings = {
        responsiveWidth: true,
        responsiveHeight: false,
        size: [80, 150],
        margin: {top: 30, bottom: 35, left: 60, right: 50},
        lines: data,
        lineType: "line",
        xScaleType: scaleTime(),
        xAccessor: function(d){
          return new Date(d.YYYYMM); },
        yAccessor: "value",
        lineDataAccessor: function(d){
          return d.coordinates;
        },
        lineStyle: function(d) {
          return ({stroke: color[d.MSN], strokeWidth: 2, fillOpacity: 0.75 });},
        axes: chartAxes,
        annotations: annotations,
        hoverAnnotation: [
          {type: "frame-hover"},
          d => ({type: "x", color: "#000"}) ],
        tooltipContent: function(d) {
          return <div className="tooltip-content" style={{boxShadow: "2px 2px 5px grey", color: "#000", opacity: 0.9, background: "#FFF", padding: 10, borderRadius: 5, transform: "translate(10px,10px)"}}>
             <p><b>{new Date(d.YYYYMM).getFullYear()} | {name[d.MSN]}</b></p>
              <p><strong>{d.value.toString()}</strong> Mwh</p>
          </div>;
        }
      };

      return (
         <ResponsiveXYFrame
           {...chartSettings}
         />
      );
   }
}
