var map = L.map("map", { center: [0, 0], zoom: 1 });

const attribution = {
  foo: "bar",
  attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
};

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", attribution).addTo(map);

const marker = L.marker([0, 0]);
let latitude = 0;
let longitude = 0;
let currentCondition = "";
let currentTemp = 0;
let city = "";
let airQualityIndex = 0;

function geoFindMe() {
  //get location coords and weather info
  const status = document.querySelector(".status");

  async function success(position) {
    console.log(position);
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;

    // console.log(latitude.toFixed(0), longitude.toFixed(0))
    //pass latitude and longitude to to get weather info and air quality info
    const api_url = `weather_aq/${latitude}/${longitude}`;
    const response = await fetch(api_url);
    // console.log(response);
    const data = await response.json();
    console.log(data);

    city = data.weatherjson.name;
    currentCondition = data.weatherjson.weather[0].description;
    currentTemp = data.weatherjson.main.temp;
    airQualityIndex = data.aqjson.data.aqi;

    status.textContent = "";
    document.getElementById("city").textContent = city;
    document.getElementById("lat").textContent = `(Lat: ${latitude.toFixed(2)}°`;
    document.getElementById("lon").textContent = `Long: ${longitude.toFixed(2)}°)`;
    document.getElementById("temp").textContent = `Temperature: ${currentTemp || 'n/a'}°C`;
    document.getElementById("cond").textContent = ` (${currentCondition || 'n/a'})`;
    document.getElementById("aqi").textContent = `Air Quality Index: ${airQualityIndex || 'n/a'}`;

    marker.setLatLng([latitude, longitude]).addTo(map); //plot on Leaflet map
    map.setView([latitude, longitude], 9);

    marker.bindTooltip(
        `City: <strong>${city}</strong><br\>Temp: <strong>${currentTemp} °C</strong> (${currentCondition})<br>
        Air Quality Index: <strong>${airQualityIndex}</strong>`).openTooltip();
  }

  function error() {
    status.textContent = "Unable to retrieve your location";
  }

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser";
  } else {
    console.log("Geolocation available");
    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

geoFindMe();

async function logData() {
  //send geolocation data to server for saving to database
  const data = {
    latitude,
    longitude,
    currentTemp,
    currentCondition,
    airQualityIndex,
    city,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch("/api", options);

  //convert to JSON and console log the response received from the POST operation above
  const responseJSON = await response.json();
  console.log(responseJSON);
}

document.querySelector("#check-in").addEventListener("click", logData);
