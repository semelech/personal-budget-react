import React from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import * as d3 from 'd3';

export default class Budget extends React.Component {
    chart = null;
    dataSource = {
        datasets: [
            {
                data: [],
                backgroundColor: [
                    '#ffcd56',
                    '#ff6384',
                    '#36a2eb',
                    '#fd6b19',
                    'brown',
                    'purple',
                    'green'
                ]
            }
        ],
        labels: []
    };

    componentDidMount() {
        axios.get('http://localhost:4000/myBudget')
        .then(res => {
            for (var i = 0; i < res.data.length; i++) {
                this.dataSource.datasets[0].data[i] = res.data[i].budget;
                this.dataSource.labels[i] = res.data[i].title;
            }
            this.createChart();
            this.createD3Chart();
        });
    }

    createChart(){
        const ctx = document.getElementById("myChart");
        const chartInstance = Chart.getChart(ctx);
        if (chartInstance) {
            chartInstance.destroy();
        }

        this.chart = new Chart(ctx, {
            type: "pie",
            data: this.dataSource
        });
    }

    createD3Chart() {
        let arrTitle = [];
        let arrBudget = [];

        var svgElement = document.getElementById("d3Chart");
        if(!svgElement.hasChildNodes()){
            var svg = d3.select("#d3Chart")
            .append("svg")
            .append("g")

            svg.append("g")
                .attr("width",100)
                .attr("height",100)
                .attr("viewBox", "0 0 1000 1000")
            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g")
                .attr("class", "lines");

            var width = 900,
                height = 400,
                radius = Math.min(width, height) / 2;

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.value;
                });

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.6)
                .innerRadius(radius * 0.3);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.7)
                .outerRadius(radius * 0.7);

            svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var key = function(d){ return d.data.label; };

            d3.json("http://localhost:4000/myBudget", function(data) {
                for(var i = 0; i < data.length; i++){
                    arrTitle[i] = data[i].title;
                    arrBudget[i] = data[i].budget;
                }

                var color = d3.scale.ordinal()
                    .domain(arrTitle)
                    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]); 

                function randomData (){
                    var labels = color.domain();
                    return labels.map(function(label, budget){
                        return { label: label, value: arrBudget[budget] }
                    });
                }

                change(randomData());

                function change(data) {

                    /* ------- PIE SLICES -------*/
                    var slice = svg.select(".slices").selectAll("path.slice")
                        .data(pie(data), key);

                    slice.enter()
                        .insert("path")
                        .style("fill", function(d) { return color(d.data.label); })
                        .attr("class", "slice");

                    slice		
                        .transition().duration(1000)
                        .attrTween("d", function(d) {
                            this._current = this._current || d;
                            var interpolate = d3.interpolate(this._current, d);
                            this._current = interpolate(0);
                            return function(t) {
                                return arc(interpolate(t));
                            };
                        })

                    slice.exit()
                        .remove();

                    /* ------- TEXT LABELS -------*/

                    var text = svg.select(".labels").selectAll("text")
                        .data(pie(data), key);

                    text.enter()
                        .append("text")
                        .attr("dy", ".35em")
                        .text(function(d) {
                            return d.data.label;
                        });
                    
                    function midAngle(d){
                        return d.startAngle + (d.endAngle - d.startAngle)/2;
                    }

                    text.transition().duration(1000)
                        .attrTween("transform", function(d) {
                            this._current = this._current || d;
                            var interpolate = d3.interpolate(this._current, d);
                            this._current = interpolate(0);
                            return function(t) {
                                var d2 = interpolate(t);
                                var pos = outerArc.centroid(d2);
                                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                                return "translate("+ pos +")";
                            };
                        })
                        .styleTween("text-anchor", function(d){
                            this._current = this._current || d;
                            var interpolate = d3.interpolate(this._current, d);
                            this._current = interpolate(0);
                            return function(t) {
                                var d2 = interpolate(t);
                                return midAngle(d2) < Math.PI ? "start":"end";
                            };
                        });

                    text.exit()
                        .remove();

                    /* ------- SLICE TO TEXT POLYLINES -------*/

                    var polyline = svg.select(".lines").selectAll("polyline")
                        .data(pie(data), key);
                    
                    polyline.enter()
                        .append("polyline");

                    polyline.transition().duration(1000)
                        .attrTween("points", function(d){
                            this._current = this._current || d;
                            var interpolate = d3.interpolate(this._current, d);
                            this._current = interpolate(0);
                            return function(t) {
                                var d2 = interpolate(t);
                                var pos = outerArc.centroid(d2);
                                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                                return [arc.centroid(d2), outerArc.centroid(d2), pos];
                            };			
                        });
                    
                    polyline.exit()
                        .remove();
                };

            });
        }
    }

    render() {
        return(
            <br/>
        );
    }
}