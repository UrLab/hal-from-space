#!/usr/bin/python

from flask import Flask, render_template
from flask.ext.socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'BITEBITEBITEBITEBITEBITEBITEB1TEBITE'
app.debug = True
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('client_connected')
def client_connected():
	print "Client connected"

@socketio.on('ask_update')
def test_message(message):

    emit('data_update', {'data':int(open("value").read().strip())}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)