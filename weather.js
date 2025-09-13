const apiKey = "23ff5c03dabe9c59eae2bee6d11e3ddd";
let map;
let infoWindow;

// Sayfa açıldığında haritayı başlat
function initialize() {
    const mapOptions = {
        zoom: 6,
        center: new google.maps.LatLng(38.9637, 35.2433), // Türkiye merkez
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        minZoom: 2
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    infoWindow = new google.maps.InfoWindow();
}
google.maps.event.addDomListener(window, "load", initialize);

// Otomatik konum al
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showWeather, showError);
}

// Manuel arama fonksiyonu
function searchLocation() {
    const country = document.getElementById("country").value;
    const city = document.getElementById("city").value;
    const district = document.getElementById("district").value;

    if (!country && !city && !district) {
        alert("Lütfen en az bir değer girin!");
        return;
    }

    const query = `${district ? district + "," : ""}${city ? city + "," : ""}${country}`;
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("Konum bulunamadı!");
                return;
            }
            const lat = data[0].lat;
            const lon = data[0].lon;
            showWeather({ coords: { latitude: lat, longitude: lon } });
        })
        .catch(error => console.error("Hata:", error));
}

// Hava durumunu getir ve ekrana yaz
function showWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("location").textContent = `Konum: ${data.name}`;
            document.getElementById("temperature").textContent = `Sıcaklık: ${data.main.temp} °C`;
            document.getElementById("description").textContent = `Durum: ${data.weather[0].description}`;
            document.getElementById("feelsLike").textContent = `Hissedilen: ${data.main.feels_like} °C`;
            document.getElementById("humidity").textContent = `Nem: ${data.main.humidity}%`;
            document.getElementById("wind").textContent = `Rüzgar: ${data.wind.speed} km/h`;

            // Haritayı konuma taşı
            const location = new google.maps.LatLng(lat, lon);
            map.setCenter(location);
            map.setZoom(10);

            const marker = new google.maps.Marker({
                position: location,
                map: map
            });

            infoWindow.setContent(`<b>${data.name}</b><br>${data.weather[0].description}, ${data.main.temp}°C`);
            infoWindow.open(map, marker);
        })
        .catch(error => {
            alert("Hava durumu verisi alınamadı.");
            console.error(error);
        });
}

function showError(error) {
    alert("Konum alınamadı. Lütfen manuel giriş yapın.");
}
