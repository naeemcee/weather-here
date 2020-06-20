const express = require("express");
const Datastore = require("nedb");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3000

app.listen(port, () => console.log(`listening on port  ${port}...`));
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const database = new Datastore("./_data/database.db");
// database.loadDatabase();
// database.find({}).sort({ timestamp: -1 });
// database.insert({name: 'Naeem', age: 52, bloodType: 'A+'})

app.post("/api", (request, response) => {
  console.log("POST request received with geo-coordinates & weather info..!");
  database.loadDatabase();
  const data = request.body;
  if (data.city) {
    const timestamp = Date.now();
    data.timestamp = timestamp;
    // console.log(data.city)

    // check and remove any entries from the db for the same city as received in this request
    database.remove({ city: data.city }, { multi: true }, function (err, numRemoved) {
      console.log(`removed ${numRemoved} record(s).`)
  });

  database.insert(data); //save received data into database
  response.json(data); //send back a json object with received data, as a confirmation

  // console.log(database)
  }
  response.end()
});

app.get("/data", (request, response) => {
  console.log("GET request received for all database entries..!");
  database.loadDatabase();
  // const data = database.getAllData()
  const data = database
    .find({})
    .sort({ timestamp: -1 })
    .exec((err, data) => {
      if (err) {
        response.end();
        return;
      }
      response.json(data); //send back a json object with received data, as a confirmation
    });

  // console.log(database)
});

app.get("/weather_aq/:lat/:lon", async (request, response) => {
  console.log("GET request received with geocoordinates to lookup weather..!");
  // const latlon = request.params
  console.log(request.params);
  const lat = request.params.lat;
  const lon = request.params.lon;
  console.log(lat, lon);

  // const api_url = `http://api.openweathermap.org/data/2.5/weather?lat=24.57&lon=46.84&units=metric&appid=619a8f3149224f0cddc73bdbdcfbba3d`
  const weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=619a8f3149224f0cddc73bdbdcfbba3d`;
  const weatherinfo = await fetch(weather_url);
  // console.log(weatherinfo);
  const weatherjson = await weatherinfo.json();
  // console.log(weatherjson);

  const aq_url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=fdfcbe33ea338e47fdfa886936e3098f5fdacbf5`;
  const aqinfo = await fetch(aq_url); //lookup airquality for the lat lon
  const aqjson = await aqinfo.json();
  console.log(aqjson);
  response.send({ weatherjson, aqjson });
});
