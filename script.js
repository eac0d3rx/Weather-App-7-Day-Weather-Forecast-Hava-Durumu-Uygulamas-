const wrapper = document.querySelector(".wrapper"),
  inputPart = document.querySelector(".input-part"),
  infoTxt = inputPart.querySelector(".info-txt"),
  inputField = inputPart.querySelector("input"),
  locationBtn = inputPart.querySelector("button"),
  weatherPart = wrapper.querySelector(".weather-part"),
  wIcon = weatherPart.querySelector("img"),
  backArrow = wrapper.querySelector("header i"),
  localTimeElement = weatherPart.querySelector(".local-time"),
  forecastList = weatherPart.querySelector(".forecast-list");

let apiKey = "YOUR_API_KEY"; // API anahtarınızı buraya yazınız
let api;

inputField.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputField.value.trim() !== "") {
    requestApi(inputField.value.trim());
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Tarayıcınız konum paylaşımını desteklemiyor");
  }
});

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  api = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
  fetchData();
}

function onError(error) {
  infoTxt.innerText = error.message || "Konum bilgisi alınamadı";
  infoTxt.classList.add("error");
}

function requestApi(city) {
  api = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
  fetchData();
}

function fetchData() {
  infoTxt.innerText = "Hava durumu detayları alınıyor...";
  infoTxt.classList.add("pending");
  fetch(api)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Şehir bulunamadı");
      }
      return response.json();
    })
    .then((result) => weatherDetails(result))
    .catch((error) => {
      infoTxt.innerText = error.message || "Bir hata oluştu";
      infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(info) {
  const city = info.location.name;
  const country = info.location.country;
  const { text, icon } = info.current.condition;
  const { temp_c, feelslike_c, humidity } = info.current;
  const { lon, lat } = info.location;

  wIcon.src = `https:${icon}`;
  weatherPart.querySelector(".temp .numb").innerText = Math.round(temp_c);
  weatherPart.querySelector(".weather").innerText = text;
  weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
  weatherPart.querySelector(".bottom-details .feels .numb-2").innerText = Math.round(feelslike_c);
  weatherPart.querySelector(".bottom-details .humidity span").innerText = `${humidity}%`;

  
  setWeatherBackground(text);

  
  fetch(`http://worldtimeapi.org/api/timezone/${info.location.tz_id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Yerel zaman bilgisi alınamadı");
      }
      return response.json();
    })
    .then((data) => {
      const localTime = new Date(data.datetime);
      localTimeElement.innerText = `Local Time: ${localTime.toLocaleTimeString()}`;
    })
    .catch(() => {
      localTimeElement.innerText = `Local Time: N/A`;
    });

  
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Forecast information could not be received");
      }
      return response.json();
    })
    .then((data) => {
      renderForecastList(data.forecast.forecastday);
    })
    .catch(() => {
      renderForecastList([]); 
    });

  infoTxt.classList.remove("pending", "error");
  infoTxt.innerText = "";
  inputField.value = "";
  wrapper.classList.add("active");
}

function renderForecastList(days) {
  forecastList.innerHTML = "";
  days.slice(0, 6).forEach((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("tr-TR", { weekday: "short" });
    const icon = day.day.condition.icon;
    const temp = `${Math.round(day.day.avgtemp_c)}°C`;
    const description = day.day.condition.text;

    const forecastDay = document.createElement("div");
    forecastDay.classList.add("forecast-day");
    forecastDay.innerHTML = `
      <span class="date">${dayName}</span>
      <img src="https:${icon}" alt="Hava Durumu İkonu">
      <span class="temp">${temp}</span>
      <span class="description">${description}</span>
    `;

    if (description.toLowerCase().includes("yağmur") || description.toLowerCase().includes("sağanak")) {
      forecastDay.classList.add("rainy"); 
    }

    forecastList.appendChild(forecastDay);
  });

  
  if (days.length < 6) {
    for (let i = days.length; i < 6; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.classList.add("forecast-day", "empty");
      forecastList.appendChild(emptyDay);
    }
  }
}

function setWeatherBackground(weatherText) {
  const lowerCaseText = weatherText.toLowerCase();

  if (lowerCaseText.includes("güneşli") || lowerCaseText.includes("açık")) {
    document.body.style.background = "#f7b733"; 
  } else if (lowerCaseText.includes("yağmur") || lowerCaseText.includes("sağanak")) {
    document.body.style.background = "#005BEA"; 
  } else if (lowerCaseText.includes("bulut")) {
    document.body.style.background = "#90A4AE"; 
  } else {
    document.body.style.background = "#1674b7"; 
  }
}

backArrow.addEventListener("click", () => {
  wrapper.classList.remove("active");
  document.body.style.background = "#1674b7"; 
});
