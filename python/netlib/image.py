from ipconf import IcfgFile
import os

def getProjects (host=None):
    return None

class Image:

    def __init__(self, host, project, version, rootpath="/storage/pxe-images/"):
        self.path = os.path.join(rootpath + "/" + host + "/" + project + "." + host + "." + version + "/")
        self.exist = os.path.exists(self.path)

    def changeInterface (self, interface, vlan=None, view=False):
        oldInterface = interface[0]
        newInterface = interface[0]
        oldVlan = None
        newVlan = None
        if interface[1] != None:
            newInterface = interface[1]
        if vlan != None:
            oldVlan = vlan[0]
            newVlan = vlan[1]

        # Change interface configuration file
        conf = IcfgFile(oldInterface,oldVlan,os.path.join(self.path + "/etc/sysconfig/network-scripts"))
        conf.change(interface=newInterface,vlan=newVlan,view=view)

        # Change interface specific tuning


