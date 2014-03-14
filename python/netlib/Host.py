from ipconf import IcfgFile
from vlans import vlans

class HostNetwork:


    def __init__(self,physdevs=[],networkMap=[],hostId=None,rootpath="/tmp"):
        self.physdevs = physdevs
        self.networkMap = networkMap
        self.hostId = hostId
        self.rootpath = rootpath

    def generateIftab(self):
        for physdev in self.physdevs:
            print physdev[0] + " mac " + physdev[1]


    def getInterfaces(self, vlan):
        res = {}
        type = vlans[vlan]
        count = 1
        for physdev in self.physdevs:
            for network in self.networkMap:
                device = (physdev[0],vlan,network[0])
                ip = "10." + type + "." + network[1] + str(count) + "." + self.hostId
                res.update({device:[physdev[1],ip]})
            count += 1
        return res

    def makeIfcfg(self,force=False):
        for physdev in self.physdevs:
            conf = IcfgFile(physdev=physdev,rootpath=self.rootpath)
            conf.generate(force=force)
            conf.save(view=False)
        for vlan in vlans:
            interfaces = self.getInterfaces(vlan)
            for physdev in self.physdevs:
                for vlan in vlans:
                    conf = IcfgFile(physdev=physdev,vlan=vlan,rootpath=self.rootpath)
                    conf.generate(force=force)
                    conf.save(view=False)

            for interface in interfaces:
                # print interface
                conf = IcfgFile(physdev=interface,vlan=interface[1],vif=interface[2],rootpath=self.rootpath)
                conf.generate(ipaddr=interfaces[interface][1],hwaddr=interfaces[interface][0],force=force)
                conf.save(view=False)

hn=None

# template
if False:
    physdevs = [
        ["eth10",""],
        ["eth11",""],
        ["eth12",""],
        ["eth13",""],
        ["eth14",""],
        ["eth15",""]
    ]
    hostId="2"

# nersc-diskpt-1
if False:
    physdevs = [
        ["eth10","00:60:DD:45:62:00"],
        ["eth11","00:60:DD:45:62:01"],
        ["eth12","00:60:DD:45:65:08"],
        ["eth13","00:60:DD:45:65:09"],
        ["eth14","00:02:C9:50:14:CA"],
        ["eth15","00:02:C9:50:14:CB"]
    ]
    hostId="2"

# nersc-diskpt-2
if False:
    physdevs = [
        ["eth10","00:60:DD:45:65:04"],
        ["eth11","00:60:DD:45:65:05"],
        ["eth12","00:60:DD:45:64:EC"],
        ["eth13","00:60:DD:45:64:ED"],
    ]
    hostId="4"

# nersc-diskpt-3
if False:
    physdevs = [
        ["eth10","00:60:DD:46:7A:BE"],
        ["eth11","00:60:DD:46:7A:BF "],
        ["eth12","00:60:DD:46:7A:A0"],
        ["eth13","00:60:DD:46:7A:A1"],
        ["eth14","00:02:C9:10:F1:BE"],
        ["eth15","00:02:C9:10:F1:BF"]
    ]
    hostId="6"

# nersc-diskpt-6
if False:
    physdevs = [
        ["eth40","00:02:C9:45:1C:70"],
    ]
    hostId="12"

# nersc-diskpt-7
if False:
    physdevs = [
        ["eth40","00:02:C9:45:1C:F0"],
    ]
    hostId="14"

# nersc-ssdpt-1
if False:
    physdevs = [
        ["eth40","00:02:C9:E8:8B:00"],
        ["eth41","00:02:C9:E8:8B:01"],
    ]
    hostId="18"

# nersc-ssdpt-2
if False:
    physdevs = [
        ["eth40","00:02:C9:E8:F2:50"],
        ["eth41","00:02:C9:E8:F2:80"],
        ["eth42","00:02:C9:E8:F2:10"],
        ["eth43","00:02:C9:E8:F2:11"],
    ]
    hostId="20"

# star-mempt-1
if False:
    physdevs = [
        ["eth10","00:60:DD:45:64:48"],
        ["eth11","00:60:DD:45:64:49"],
        ["eth12","00:60:DD:46:52:2C"],
        ["eth13","00:60:DD:46:7A:C6"],
    ]
    hostId="128"

# star-mempt-2
if False:
    physdevs = [
        ["eth10","00:60:DD:45:65:0E"],
        ["eth11","00:60:DD:45:65:0F"],
        ["eth12","00:60:DD:46:53:0C"],
        ["eth13","00:60:DD:46:7A:BA"],
    ]
    hostId="130"

# star-mempt-3
if False:
    physdevs = [
        ["eth10","00:60:DD:45:61:FC"],
        ["eth11","00:60:DD:45:61:FD"],
        ["eth12","00:60:DD:46:7A:B8"],
        ["eth13","00:60:DD:46:52:34"],
        ["eth14","00:02:C9:50:14:C0"],
        ["eth15","00:02:C9:50:14:C1"]
    ]
    hostId="132"

networkMap = [["0",""]]
rootpath="/etc/sysconfig/network-scripts"
#rootpath="/tmp/etc"
hn = HostNetwork (physdevs=physdevs,networkMap=networkMap,hostId=hostId,rootpath=rootpath)
hn.makeIfcfg(force=True)

hn.generateIftab()