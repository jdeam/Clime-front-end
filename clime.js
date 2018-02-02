//Index: https://api.weather.gov/gridpoints/SEW/150,72/forecast/hourly
//47.82, -121.556

let forecast;
let hourly = [];
axios.get('http://localhost:3000/forecast').then(result => {
  forecast = result.data.data.hourly.data;
  forecast.forEach(hour => {
    hourly.push(hour.temperature);
  })
});

let ctx = document.getElementById("myChart").getContext("2d");
