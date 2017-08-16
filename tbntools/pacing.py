from __main__ import flaskApp
from flask import request
import subprocess

@flaskApp.route('/pacing/add/<iface>')
def add(iface):
    global flaskApp
    output = subprocess.check_call(['tc','qdisc','add','dev',iface,'root','fq'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/pacing/rem/<iface>')
def rem(iface):
    global flaskApp
    output = subprocess.check_call(['tc','qdisc','del',iface,'root'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/pacing/set', methods=['GET'])
def set(iface, rate):
    global flaskApp
    iface = request.args.get('iface')
    rate = request.args.get('rate')
    output = subprocess.check_call(['tc','qdisc','change','dev',iface,'root','fq','maxrate',str(rate)+'Mbit'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response
