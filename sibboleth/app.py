from flask import Flask, jsonify, request
from sibboleth import SibbolethLogger
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/classes", methods=['POST'])
def get_classes():
    request_json=request.get_json()
    #print(request)
    #print(request.json)
    sl = SibbolethLogger(request_json['username'],request_json['password'])
    sl.setup_selenium()
    classes=sl.get_classes()
    print(classes)
    return jsonify(classes)

if __name__ == '__main__':
    app.run(debug=True)