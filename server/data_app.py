# TORUN:^
#  python -m flask --app data_app run

from flask import Flask
import json
from datetime import datetime

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
