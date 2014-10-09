#!/usr/bin/python

from flask import Flask, render_template, request
from flask.ext.socketio import SocketIO, emit
# from halpy.hal import HAL
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'BITEBITEBITEBITEBITEBITEBITEB1TEBITE'
app.debug = True
socketio = SocketIO(app)
#hal = HAL("/dev/hal")
last_requests = {} # last request timestamp for each client

@app.route('/')
def index():
    return render_template('index.html')

def emit_data_update():
    #print "Emitting", hal.read("animations/red/play").strip()
    #emit('data_update', {'data':int(hal.read("animations/red/play").strip())}, broadcast=True)
    emit('data_update', {'data':1}, broadcast=True)

@socketio.on('client_connected')
def client_connected():
    last_requests[request.environ['REMOTE_ADDR']] = datetime.now()
    print "Client connected -", str(request.environ['REMOTE_ADDR'])
    emit_data_update()

@socketio.on('client_disconnected')
def client_disconnected():
    last_requests.pop(request.environ['REMOTE_ADDR'], None)
    print "Client disconnected -", str(request.environ['REMOTE_ADDR'])

@socketio.on('ask_update')
def ask_update(message):
    emit_data_update()

@socketio.on('value_switch_off')
def value_switch_off(message):
    print "Asked for value switch off"
    #open("value", 'w').write(str(0))
    #hal.stop("red")
    emit_data_update()

@socketio.on('value_switch_on')
def value_switch_on(message):
    print "Asked for value switch on"
    #open("value", 'w').write(str(1))
    #hal.play("red")
    emit_data_update()

if __name__ == '__main__':
    socketio.run(app)
