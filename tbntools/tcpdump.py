import subprocess

from __main__ import flaskApp
from flask import Response,request
from common import runShell


@flaskApp.route('/net/tcpdump',methods=['POST', 'GET'])
def tcpDump():
    def getHelp():
        helpMsg = 'syntax:\n\tcurl -X POST -d "intf=<interface name>&opt1=<option1>&opt2=<option2>&...&optN=<optionN>"'
        helpMsg += ' http://address:port/net/tcpdump'
        return helpMsg

    if request.method == 'POST':
        blacklist = ['-F','-C','-r']
        return runShell('tcpdump',request.form,blacklist)


    if request.method == 'GET':
        return Response(getHelp(), mimetype='text/plain')