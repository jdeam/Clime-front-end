const path = 'http://localhost:3000';
let user = JSON.parse(localStorage.getItem('user'));
let searchResults = null;
let cragAdded = null;

if (user) {
  axios.get(`${path}/users/${user.uuid}/favorites`).then(result => {
    user.favorites = result.data.crags;
  });
} else {
  axios.post(`${path}/users/`).then(result => {
    user = result.data.user;
    localStorage.setItem('user', JSON.stringify(user));
  });
}

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
  const plusButton = document.createElement('a');
  plusButton.className = 'plus';
  const plusImage = document.createElement('img');
  plusImage.src = './images/heart.svg';
  plusButton.appendChild(plusImage);
  plusButton.addEventListener('click', (e) => {
    axios.post(`${path}/users/${user.uuid}/favorites`, { cragId: crag.id })
      .then(result => {
        if (result.data.favorite) {
          user.favorites.push(crag);
          let minusButton = plusButton.parentNode.querySelector('.minus');
          minusButton.style.display = 'inline';
          plusButton.style.display = 'none';
          if (favoriteButton.classList.contains('is-active')) {
            clearForecasts();
            renderForecasts(user.favorites);
          }
        }
      });
  });
  return plusButton;
}

function createMinusButton(crag) {
  const minusButton = document.createElement('a');
  minusButton.className = 'minus';
  const minusImage = document.createElement('img');
  minusImage.src = './images/x.svg';
  minusButton.appendChild(minusImage);
  minusButton.addEventListener('click', (e) => {
    axios.delete(`${path}/users/${user.uuid}/favorites/${crag.id}`)
      .then(result => {
        if (result.data.deleted) {
          let i = user.favorites.findIndex(favorite => favorite.id === crag.id);
          user.favorites.splice(i, 1);
          let plusButton = minusButton.parentNode.querySelector('.plus');
          plusButton.style.display = 'inline';
          minusButton.style.display = 'none';
          if (favoriteButton.classList.contains('is-active')) {
            clearForecasts();
            renderForecasts(user.favorites);
          }
        }
      });
  });
  return minusButton;
}

function renderForecasts(crags) {
  forecastArea.style.display = 'block';
  crags.forEach(crag => {
    const forecastDiv = document.createElement('div');
    forecastDiv.classList.add('panel');
    forecastDiv.classList.add('forecast-panel');

    const forecastHeading = document.createElement('p');
    forecastHeading.classList = 'panel-heading';

    let minusButton = createMinusButton(crag);
    forecastHeading.appendChild(minusButton);
    let plusButton = createPlusButton(crag);
    forecastHeading.appendChild(plusButton);
    if (user.favorites.find(favorite => favorite.id === crag.id)) {
      plusButton.style.display = 'none';
    } else {
      minusButton.style.display = 'none';
    }

    let cragName = document.createElement('b');
    cragName.textContent = `${crag.name}, ${crag.state}`;
    forecastHeading.appendChild(cragName);
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
const searchArea = document.querySelector('#search');
const addCragsArea = document.querySelector('#add-crags');

function validate(input) {
  return input.trim().toLowerCase().replace(' ', '');
}

const searchForm = document.querySelector('#search-input');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('blah');
})

const submitButton = document.querySelector('#submit');
submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  clearForecasts();
  forecastArea.style.display = 'none';
  let searchInput = document.querySelector('#search-input').value;
  if (searchInput) {
    axios.get(`${path}/crags/${validate(searchInput)}`)
      .then(result => {
        searchResults = result.data.crags
        renderForecasts(searchResults);
      });
  }
});

const findCragsButton = document.querySelector('#find-crags');
const favoriteButton = document.querySelector('#favorites');
const addCragsButton = document.querySelector('#add-a-crag');

favoriteButton.addEventListener('click', (e) => {
  if (findCragsButton.classList.contains('is-active')) {
    findCragsButton.classList.remove('is-active');
  }
  if (addCragsButton.classList.contains('is-active')) {
    addCragsButton.classList.remove('is-active');
  }
  if (!e.target.classList.contains('is-active')) {
    e.target.classList.add('is-active');
  }
  clearForecasts();
  forecastArea.style.marginTop = '80px';
  searchArea.style.display = 'none';
  addCragsArea.style.display = 'none';
  if (user.favorites.length) {
    renderForecasts(user.favorites);
  }
});

addCragsButton.addEventListener('click', (e) => {
  if (findCragsButton.classList.contains('is-active')) {
    findCragsButton.classList.remove('is-active');
  }
  if (favoriteButton.classList.contains('is-active')) {
    favoriteButton.classList.remove('is-active');
  }
  if (!e.target.classList.contains('is-active')) {
    e.target.classList.add('is-active');
  }
  clearForecasts();
  searchArea.style.display = 'none';
  forecastArea.style.display = 'none';
  addCragsArea.style.display = 'flex';
  if (cragAdded) {
    renderForecasts(cragAdded);
    forecastArea.style.marginTop = '20px';
  } else {
    forecastArea.style.display = 'none';
  }
});

findCragsButton.addEventListener('click', (e) => {
  if (favoriteButton.classList.contains('is-active')) {
    favoriteButton.classList.remove('is-active');
  }
  if (addCragsButton.classList.contains('is-active')) {
    addCragsButton.classList.remove('is-active');
  }
  if (!e.target.classList.contains('is-active')) {
    e.target.classList.add('is-active');
  }
  clearForecasts();
  forecastArea.style.marginTop = '20px';
  addCragsArea.style.display = 'none';
  searchArea.style.display = 'block';
  if (searchResults) {
    renderForecasts(searchResults);
  } else {
    forecastArea.style.display = 'none';
  }
});

const addCragButton = document.querySelector('#crag-submit');
const cragName = document.querySelector('#crag-name').querySelector('input');
const cragLat = document.querySelector('#crag-lat').querySelector('input');
const cragLng = document.querySelector('#crag-lng').querySelector('input');

addCragButton.addEventListener('click', (e) => {
  let name = cragName.value;
  let lat = cragLat.value;
  let lng = cragLng.value;

  if (name && lat && lng) {
    clearForecasts();
    axios.post(`${path}/crags`, { name, lat, lng }).then(result => {
      cragAdded = result.data.crag;
      renderForecasts(cragAdded);
    });
  }
});
