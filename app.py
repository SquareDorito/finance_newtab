from flask import Flask, jsonify, request
import sibboleth

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/classes")
def get_classes():
    pass

if __name__ == '__main__':
    app.run(debug=True)