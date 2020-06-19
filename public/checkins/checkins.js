const dataDiv = document.getElementById("data-area");

var checkinMap = L.map("checkin-map", { center: [30, 50], zoom: 2 });
const attribution = {
  foo: "bar",
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
};

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}",
  attribution
).addTo(checkinMap);

/* var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(checkinMap); */

// create a red polyline from an array of LatLng points

L.polyline(
  [
    [0, -360], //equator
    [0, 360],
  ],
  { color: "grey", weight: 1 }
).addTo(checkinMap); //equator

L.polyline(
  [
    [360, 0],
    [-360, 0],
  ],
  { color: "grey", weight: 1 }
).addTo(checkinMap); //prime meridian

async function getData() {
  const response = await fetch("/data");
  const responseJSON = await response.json();
  const data = responseJSON;
  console.log(data);
  // dataDiv.textContent = ''

  data.forEach((element) => {
    // console.log(element)
    const dataRow = document.createElement("p");
    dataRow.textContent = `City: ${element.city} (Lat: ${element.latitude.toFixed(2)}° | 
      Long: ${element.longitude.toFixed(2)}°)  
      Temp: ${element.currentTemp}°C  Conditions: ${element.currentCondition}
      AQI: ${element.airQualityIndex} Time: ${new Date(element.timestamp).toLocaleString()}`;

    console.log(dataRow.textContent);
    dataDiv.appendChild(dataRow);

    let marker = L.marker([element.latitude, element.longitude]).addTo(
      checkinMap
    );
    marker
      .bindPopup(
        `<span>City: <strong>${element.city}</strong><br>Temp: <strong>${element.currentTemp}°C</strong> (${element.currentCondition})<br>AQI: <strong>${element.airQualityIndex}</strong></span>`
      )
      .openPopup();

    /* var popup = L.popup({closeButton: true, closeOnClick: false, className: 'popup'})
            .setLatLng([element.latitude, element.longitude])
            .setContent(`<span>City: ${element.city}<br>Temp: ${element.currentTemp} (${element.currentCondition})<br>AQI: ${element.airQualityIndex}</span>`)
            .addTo(checkinMap); */

    // marker.bindTooltip(`${element.city}<br>${element.currentTemp} °C<br>${element.currentCondition}<br>AQI:${element.airQualityIndex}`).openTooltip();
  });
}

/* checkinMap.on('click', function(ev) {
    alert(ev.latlng); // ev is an event object (MouseEvent in this case)
}); */

getData();
