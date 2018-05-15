import subprocess, datetime

from __main__ import flaskApp
from flask import Response,request
from common import runShell

from __main__ import flaskApp
from flask import request

current_file = None

@flaskApp.route('/cachestat/start')
def startCacheStat():
    global flaskApp
    global file
    file = open('/storage/data1/cachestat/cachestat.' + datetime.datetime.now().__str__(), 'a')
    output = subprocess.call(['cachestat','-t','1'], stdout=file)
    response = 'cachestat has stopped.'
    return response

@flaskApp.route('/cachestat/stop')
def stopCacheStat():
    global flaskApp
    global file
    file.close()
    output = subprocess.check_output(['killall','cachestat'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response

@flaskApp.route('/cachestat/clear')
def clearCacheStat():
	# free && sync && echo 3 > /proc/sys/vm/drop_caches && free
    global flaskApp
    output = subprocess.check_output(['sh','-c','free && sync && echo 3 > /proc/sys/vm/drop_caches && free'])
    response = flaskApp.make_response(output)
    response.headers["content-type"] = "text/plain"
    return response
