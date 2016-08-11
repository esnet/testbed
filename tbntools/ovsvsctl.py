import subprocess

from tbntools import flaskApp
from flask import request

@flaskApp.route('/ovs/vs/show')
def show(value=None):
    global flaskApp
    output = subprocess.check_output(['ovs-vsctl','show'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

