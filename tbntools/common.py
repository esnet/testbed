from tbntools import flaskApp
from flask import request

@flaskApp.route('/stop/<value>')
def killAll(value = 0):
	if (value != '1'):
		return 'not authorized'
	func = request.environ.get('werkzeug.server.shutdown')
	if func is None:
		raise RuntimeError('Not running with the Werkzeug Server')
	func()
	return "Shutting down..."