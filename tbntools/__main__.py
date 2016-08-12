from flask import Flask

import threading

flaskApp = Flask(__name__)

flaskRunThread = threading.Thread(target=flaskApp.run,kwargs={'host':'0.0.0.0','threaded':True})
flaskRunThread.start()

__all__ = []

import pkgutil
import inspect

for loader, name, is_pkg in pkgutil.walk_packages(['tbntools']):
    if name.startswith('__'):
        continue

    module = loader.find_module(name).load_module(name)
