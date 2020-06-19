const dataTable = document.getElementById('data-table')

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
  // console.log(data);  

  data.forEach((element) => {
    let aqiCategory = ''
    const aqi = element.airQualityIndex
    if(aqi > 300)
      aqiCategory = 'maroon'    //Hazardous
    else if(aqi > 200)
      aqiCategory = 'purple'    //Very unhealthy
    else if(aqi > 150)
      aqiCategory = 'red'       //Unhealthy
    else if(aqi > 100)
      aqiCategory = 'orange'    //Unhealthy for sensitive groups
    else if(aqi > 50)
      aqiCategory = 'yellow'    //Moderate
    else
      aqiCategory = 'green'     //Good

    const tableRow = `<tr>
                      <td>${element.city}</td>
                      <td>${element.latitude.toFixed(2)} °</td>
                      <td>${element.longitude.toFixed(2)} °</td>
                      <td>${element.currentTemp} °C</td>
                      <td>${element.currentCondition}</td>
                      <td class="center ${aqiCategory}">${element.airQualityIndex}</td>
                      <td>${new Intl.DateTimeFormat('en-GB').format(element.timestamp)}</td>
                      </tr>`
    dataTable.insertAdjacentHTML("beforeend", tableRow)

    let marker = L.marker([element.latitude, element.longitude]).addTo(checkinMap);
    marker
      .bindPopup(
        `<span>City: <strong>${element.city}</strong><br>Temp: <strong>${element.currentTemp}°C</strong> 
        (${element.currentCondition})<br>Air Quality Index: <strong>${element.airQualityIndex}</strong></span><br>
        <span>Logged on: ${new Intl.DateTimeFormat('en-GB').format(element.timestamp)}</span>`
      )
      .openPopup();
  });
}

getData();
