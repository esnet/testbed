import subprocess

from __main__ import flaskApp
from flask import request

@flaskApp.route('/ovs/vs/show')
def show():
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','show'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/ovs/vs/listbr')
def listBridges():
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','list-br'])
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