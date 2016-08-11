from flask import Flask

import threading

flaskApp = Flask(__package__)

flaskRunThread = threading.Thread(target=flaskApp.run,kwargs={'host':'0.0.0.0','threaded':True})
flaskRunThread.start()

__all__ = []

import pkgutil
import inspect

for loader, name, is_pkg in pkgutil.walk_packages(__path__):
    module = loader.find_module(name).load_module(name)

    for name, value in inspect.getmembers(module):
        if name.startswith('__'):
            continue
        globals()[name] = value
        __all__.append(name)

from tbntools import *