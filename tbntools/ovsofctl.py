import subprocess

from tbntools import flaskApp
from flask import request

@flaskApp.route('/ovs/of/show/<br>')
def show(br):
    global flaskApp
    output = subprocess.check_output(['ovs-ofctl','show',br])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response


@flaskApp.route('/ovs/of/dumpflows/<br>')
def dumpFlows(br):
    global flaskApp
    output = subprocess.check_output(['ovs-ofctl','dump-flows',br])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/ovs/of/dumpports/<br>')
def dumpPorts(br):
    global flaskApp
    output = subprocess.check_output(['ovs-ofctl','dump-ports',br])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response