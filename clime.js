let user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  newUser = uuidv1();
  axios.post('http://localhost:3000/users/', { newUser }).then(result => {
    user = result.data.user;
    localStorage.setItem('user', JSON.stringify(user));
  });
}

localStorage.removeItem('user');

function renderChart(ctx, forecast) {
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.time,
      datasets: [{
        label: 'Temp',
        yAxisID: 'Temp',
        data: forecast.temp,
        fill: false,
        borderColor: "#c45850",
        backgroundColor: 'rgba(196, 88, 80, 0.3)'
      }, {
        label: 'Precip',
        yAxisID: 'Precip',
        data: forecast.precip,
        fill: true,
        borderColor: "#3e95cd",
        backgroundColor: 'rgba(62, 149, 205, 0.3)'
      }]
    },
    options: {
      elements: {
        line: { tension: 0.5 },
        point: { radius: 1.5 }
      },
      legend: { display: false},
      tooltips : {
        intersect: false,
        callbacks: {
          title: function(t, d) {
            return moment(t[0].xLabel).format('LT');
          },
          label: function(t, d) {
            if (t.datasetIndex === 0) {
              return `${t.yLabel}°F`;
            } else if (t.datasetIndex === 1) {
              return `${t.yLabel}%`;
            }
          }
        }
      },
      hover: { mode: 'nearest', intersect: false },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            day: 'day',
            displayFormats: {
              hour: 'ddd, MMM D',
              day: 'ddd, MMM D'
            }
          },
        }],
        yAxes: [{
          id: 'Temp',
          type: 'linear',
          position: 'left',
          ticks: {
            max: forecast.maxTemp,
            min: forecast.minTemp,
            stepSize: (forecast.maxTemp-forecast.minTemp)/5,
            callback: function(value, index, values) {
              return `${parseFloat(value).toFixed(0)}°F`
            }
          }
        }, {
          id: 'Precip',
          type: 'linear',
          position: 'right',
          ticks: {
            max: 100,
            min: 0,
            callback: function(value, index, values) {
              return `${value}%`
            }
          }
        }]
      }
    }
  });
}

function createPlusButton(crag) {

}

function renderForecasts(crags) {
  crags.forEach(crag => {
    const forecastDiv = document.createElement('div');
    forecastDiv.classList.add('panel');
    forecastDiv.classList.add('forecast-panel');

    const forecastHeading = document.createElement('p');
    forecastHeading.classList = 'panel-heading';
    forecastHeading.innerHTML = `<b>${crag.name}, ${crag.state}</b>`;
    forecastDiv.appendChild(forecastHeading);

    const forecastCanvas = document.createElement('canvas');
    forecastCanvas.classList = 'forecast';
    forecastCanvas.height = 60;
    forecastCanvas.style.paddingRight = '1.5%';
    forecastCanvas.style.paddingTop = '0.75%';
    forecastDiv.appendChild(forecastCanvas);

    forecastArea.appendChild(forecastDiv);

    let ctx = forecastCanvas.getContext('2d');
    renderChart(ctx, crag.forecast);
  });
}

function clearForecasts() {
  while (forecastArea.children.length) {
    forecastArea.removeChild(forecastArea.lastChild);
  }
}

const forecastArea = document.querySelector('#forecasts');

function validate(input) {
  return input.trim().toLowerCase().replace(' ', '');
}

const submitButton = document.querySelector('#submit');
submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  clearForecasts();
  let searchInput = document.querySelector('#search-input').value;
  axios.get(`http://localhost:3000/crags/${validate(searchInput)}`)
    .then(result => {
      const crags = result.data.crags
      renderForecasts(crags);
    });
});

// navigator.geolocation.getCurrentPosition(function(position) {
//   console.log(position);
// });
