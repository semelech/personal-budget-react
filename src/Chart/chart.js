import React from "react";
import Chart from "chart.js/auto";
import axios from "axios";

function PieChart() {
    const data = {
      labels: ["food","water","x"],
      datasets: [
        {
            data: [30,75,180],
            backgroundColor: [
                '#ffcd56',
                '#ff6384',
                '#36a2eb',
                '#fd6b19',
                '#AEE5D8',
                'pink',
                'purple',
                'black'
            ],
        },
      ],
    };

    function createChart() {
        var ctx = document.getElementById("myChart").getContext("2d");
        new Chart(ctx, {
            type: 'pie',
            data: data
        });
    }

    function getBudget() {
        axios.get("http://localhost:3001/budget")
        .then(function (res) {
            console.log(res);
            for (var i=0; i < res.data.myBudget.length; i++) {
                data.datasets[0].data[i] = res.data.myBudget[i].budget;
                data.labels[i] = res.data.myBudget[i].title;
            }
            createChart();
        });
    }
    getBudget();

    return (
          <canvas id="myChart" width="400" height="400"></canvas>
    );
  }
  
  export default PieChart;