import subprocess

from tbntools import flaskApp
from flask import request

@flaskApp.route('/ovs/vs/show')
def show():
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','show'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/ovs/vs/list')
def list():
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','list'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/ovs/vs/listports/<br>')
def listPorts(br):
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','list-ports',br])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response