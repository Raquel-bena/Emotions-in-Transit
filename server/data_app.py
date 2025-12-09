# TORUN:^
#  python -m flask --app data_app run

from flask import Flask
import json
from datetime import datetime
import os
import requests

app = Flask(__name__)

@app.route("/")
def hello_world():
    return json.dumps({"hello":"world"})

@app.route("/light-level")
def get_light_level():
    hours = datetime.now().hour

    if (hours >= 7 and hours < 19):
        return json.dumps({"light-level": 1.0})
    if (hours >= 19 and hours < 21):
        return json.dumps({"light-level": 0.5})
    return json.dumps({"light-level": 0.1})


@app.route('/weather-data')
def get_weather_data():
    apiKey = os.getenv("OWM_KEY")
    nextInterval = 10 * 60 * 1000

    if (apiKey):
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?id=3128740&appid={apiKey}&units=metric"
            print(url)
            res = requests.get(url)
            d = res.json()
            print(d)
            weatherData = {
                'temp': d['main']['temp'],
                'humidity': d['main']['humidity'],
                'pressure': d['main']['pressure'],
                'windSpeed': d['wind']['speed'] * 3.6, # m/s a km/h
                'windDir': d['wind']['deg'],
                'rain': d['rain']['1h'] if (d['rain'] and d['rain']['1h']) else 0,
                'description': d['weather'][0]['description']
            }
            print(f"✅ [OWM] T:{weatherData.temp}°C H:{weatherData.humidity}%")
        except Exception as e:
            print(f"❌ OWM Error: {e}")
            weatherData = get_simulated_weather() # Fallback
    else:
        print("⚠️ No OWM Key - Usando Simulación")
        weatherData = get_simulated_weather()
        nextInterval = 60000 # Más rápido en simulación

    return json.dumps(weatherData)


def get_simulated_weather():
    return {
        'temp': 20,
        'humidity': 50,
        'pressure': 1013,
        'windSpeed': 5,
        'windDir': 0,
        'rain': 0,
        'description': 'simulated'
    }