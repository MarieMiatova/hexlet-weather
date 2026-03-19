const weatherForm = document.querySelector(".top-banner form");
const cityInput = document.querySelector(".top-banner input");
const searchButton = document.getElementById("submit-btn");
const messageElement = document.querySelector(".top-banner .msg");
const cityList = document.querySelector(".ajax-section .cities");

const API_KEY = "680d617c6725b752eadc743b8f9156fe";

function isCityAlreadyListed(cityName, existingCities) {
  return existingCities.some((cityElement) => {
    const citySpan = cityElement.querySelector(".city-name span");
    const cityDataName = cityElement.querySelector(".city-name").dataset.name;
    let comparisonName = citySpan.textContent.toLowerCase();

    if (cityName.includes(",")) {
      const parts = cityName.split(",");
      if (parts[1].length > 2) {
        cityName = parts[0];
        comparisonName = citySpan.textContent.toLowerCase();
     } else {
       comparisonName = cityDataName.toLowerCase();
     }
    }
    
    return comparisonName === cityName.toLowerCase();
  });
}

async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(apiUrl);
  return await response.json();
}

function buildCityElement(weatherData) {
  const { main, name, sys, weather } = weatherData;
  const iconUrl = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

  const cityItem = document.createElement("li");
  cityItem.classList.add("city");

  const cityMarkup = `
    <h2 class="city-name" data-name="${name},${sys.country}">
      <span>${name}</span>
      <sup>${sys.country}</sup>
    </h2>
    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
    <figure>
      <img class="city-icon" src="${iconUrl}" alt="${weather[0]["description"]}">
      <figcaption>${weather[0]["description"]}</figcaption>
    </figure>
  `;

  cityItem.innerHTML = cityMarkup;
  return cityItem;
}

cityInput.addEventListener("input", (event) => {
  searchButton.disabled = !event.target.value.trim();
});

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const enteredCity = cityInput.value.trim();

  const existingCityElements = Array.from(cityList.querySelectorAll(".city"));

  if (
    existingCityElements.length > 0 &&
    isCityAlreadyListed(enteredCity, existingCityElements)
  ) {
    const duplicateCityName = existingCityElements
      .find((el) => {
        const span = el.querySelector(".city-name span");
        return (
          span.textContent.toLowerCase() ===
          enteredCity.toLowerCase().split(",")[0]
        );
      })
      .querySelector(".city-name span").textContent;

    messageElement.textContent = `You already know the weather for ${duplicateCityName} ...otherwise be more specific by providing the country code as well 😉`;
    weatherForm.reset();
    cityInput.focus();
    return;
  }

  messageElement.textContent = "Населенный пункт был найден";

   try {
    const weatherInfo = await getWeatherData(enteredCity);
    const newCityElement = buildCityElement(weatherInfo);
    cityList.appendChild(newCityElement);
    messageElement.textContent = "";
  } catch (error) {
    console.error(error);
    messageElement.textContent = "Населенный пункт не найден";
  }

    weatherForm.reset();
  cityInput.focus();
});