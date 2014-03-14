import os
from Host import HostNetwork

class Tb100Hosts:

    hosts = {
        "nersc-ssdpt-2":{
            "hostId" : "20",
            "physdev" :["eth40","eth41","eth42","eth43"],
            "networkMap" : [["0",""],["1","1"]],
        },
    }

    def __init__(self, rootpath="/tmp"):
        self.rootpath = rootpath


    def getHostNetwork(self,name=None):
        conf = self.hosts[name]
        if conf != None:
            return HostNetwork(physdevs=conf["physdev"],
                               networkMap=conf["networkMap"],
                               hostId=conf["hostId"],
                               rootpath=self.rootpath)



tb = Tb100Hosts()
