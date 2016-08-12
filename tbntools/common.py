from __main__ import flaskApp
from flask import request,Response
import subprocess

@flaskApp.route('/stop/<value>')
def killAll(value = 0):
	if (value != '1'):
		return 'not authorized'
	func = request.environ.get('werkzeug.server.shutdown')
	if func is None:
		raise RuntimeError('Not running with the Werkzeug Server')
	func()
	return "Shutting down..."

# DO NOT MAKE THE FOLLOWING FUNCTION A FLASK ROUTE.
def runShell(cmd,args=None,blacklist=None):
	for x in args:
		cmd += ' ' + x

	print cmd
	proc = subprocess.Popen(
		[cmd],
		shell=True,
		stdout=subprocess.PIPE
	)

	def execute():
		for line in iter(proc.stdout.readline, ''):
			yield line.rstrip() + '\n'

	return Response(execute(), mimetype='text/plain')