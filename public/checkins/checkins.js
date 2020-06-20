const dataTable = document.getElementById("data-table");

var checkinMap = L.map("checkin-map", { center: [0, 0], zoom: 1 });
const attribution = {
  foo: "bar",
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
};

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}",
  attribution
).addTo(checkinMap);

L.polyline(
  [
    [0, -360],
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

  document.getElementById('db-entries').textContent = `Total database entries: ${data.length}`

  for (i = 0; i < data.length; i++) {
    let aqiCategory = "";
    const latDirection = (data[i].latitude < 0) ? 'S' : 'N'
    const lonDirection = (data[i].longitude < 0) ? 'E' : 'W'
    const aqi = data[i].airQualityIndex;

    if (aqi > 300) aqiCategory = "maroon";
    //Hazardous
    else if (aqi > 200) aqiCategory = "purple";
    //Very unhealthy
    else if (aqi > 150) aqiCategory = "red";
    //Unhealthy
    else if (aqi > 100) aqiCategory = "orange";
    //Unhealthy for sensitive groups
    else if (aqi > 50) aqiCategory = "yellow";
    //Moderate
    else aqiCategory = "green"; //Good

    const tableRow = `<tr>
                        <td>${data[i].city}</td>
                        <td>${data[i].latitude.toFixed(2)}° ${latDirection}</td>
                        <td>${data[i].longitude.toFixed(2)}° ${lonDirection}</td>
                        <td>${data[i].currentTemp.toFixed(1)} °C</td>
                        <td>${data[i].currentCondition}</td>
                        <td class="center ${aqiCategory}">${
      data[i].airQualityIndex
    }</td>
                        <td>${new Intl.DateTimeFormat("en-GB").format(
                          data[i].timestamp
                        )}</td>
                        </tr>`;
    dataTable.insertAdjacentHTML("beforeend", tableRow);

    let j = data.length - i - 1   //to plot markers in the reverse order so that latest data tooltip will be open
    let marker = L.marker([data[j].latitude, data[j].longitude]).addTo(
      checkinMap
    );
    marker
      .bindPopup(
        `<span>City / Area: <strong>${data[j].city}</strong><br>Temp: <strong>${
          data[j].currentTemp
        }°C</strong> 
        (${data[j].currentCondition})<br>Air Quality Index: <strong>${
          data[j].airQualityIndex
        }</strong></span><br>
        <span>Logged on: ${new Intl.DateTimeFormat("en-GB").format(
          data[j].timestamp
        )}</span>`
      )
      .openPopup();
  }

}

getData();
