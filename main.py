from flask import Flask, render_template, jsonify, request
from flask_cors import CORS, cross_origin
import requests, time, math

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

period_dict = {}
period_dict['Y'] = 365*24*60*60 # seconds in a year
period_dict['M'] = 31*24*60*60 # seconds in a month
period_dict['W'] = 7*24*60*60 # seconds in a week
period_dict['D'] = 24*60*60 # seconds in a week

@app.route('/_get_data/', methods=['POST'])
def _get_data():
    values = request.values
    now = math.floor(time.time())
    old = now-period_dict[values['period']]
    url = "https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from="+str(old)+"&to="+str(now)+"&token=brhub4vrh5r807v5kllg"
    r = requests.get(url)
    # print(r.text)
    try:
        res = r.json()
    except:
        res = None
    return jsonify({'data' : res})

if __name__ == "__main__":
    print("Starting Flask server.")
    app.run(debug=True)