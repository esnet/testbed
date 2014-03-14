import os,commands


def getmac(iface, test=False):
    if test:
        return "01:02:03:04:05:06"

    mac = commands.getoutput("ifconfig " + iface + "| grep HWaddr | awk '{ print $5 }'")
    if len(mac)==17:
        return mac



class IcfgFile:
    def __init__ (self,physdev,vlan=None, rootpath="/etc/sysconfig/network-scripts",vif=None):
        self.physdev = physdev[0]
        self.mac = physdev[1]
        self.vlan = vlan
        self.vif = vif
        self.rootpath = rootpath
        self.fileName = os.path.join(self.rootpath + "/ifcfg-" + self.physdev)
        if self.vlan !=  None:
            self.fileName = self.fileName + "." + self.vlan
        if self.vif != None:
            self.fileName = self.fileName + ":" + self.vif
        self.exists = False
        if os.path.exists(self.fileName):
            f = open(self.fileName)
            self.lines = f.readlines()
            f.close()
            self.exists = True
        else:
            self.lines = []


    def display(self):
        print "Filename: " + self.fileName
        for line in self.lines:
            print line

    def generate(self, ipaddr=None, netmask="255.255.255.0", mtu="9000", hwaddr=None, bootproto="none",onboot="yes",force=False):
        if self.exists and not force:
            print self.fileName + " already exists"
            return False
        if self.physdev == None:
            # Should handle error better
            print "No device name provided"
            return False

        d = dict()

        device = self.physdev
        if self.vlan != None:
            device += "." + self.vlan
        if self.vif != None:
            device += ":" + self.vif
        d.update({"DEVICE":device})
        if self.vlan != None:
            d.update({"PHYSDEV":self.physdev})
            d.update({"VLAN":"yes"})
        d.update({"TYPE":"Ethernet"})
        d.update({"NM_CONTROLLED":"no"})
        d.update({"BOOTPROTO":bootproto})
        d.update({"ONBOOT":onboot})
        if ipaddr != None:
            d.update({"IPADDR":ipaddr})
        if netmask != None:
            d.update({"NETMASK":netmask})
        if hwaddr != None:
            d.update({"HWADDR":hwaddr})
        else:
            if self.mac != None:
                d.update({"HWADDR":self.mac})
            else:
                d.update({"HWADDR":getmac(self.physdev)})
        d.update({"MTU":mtu})
        self.setDict(d)


    def rename (self, interface, vlan=None):
        name = os.path.join(self.rootpath + "/ifcfg-" + interface)
        if vlan !=  None:
            name = name + "." + vlan
        if os.path.exists(name):
            return False
        print self.fileName
        print name
        os.rename(self.fileName, name)
        self.fileName = name
        return True

    def remove (self, view=False):
        os.remove(self.fileName)

    def getDict(self):
        d = dict()
        for line in self.lines:
            if line[0] == "#":
                continue
            v = line.split("=")
            if len(v) != 2:
                continue
            v[0] = v[0].upper()
            # Strip trailing \n
            if v[1][-1] == "\n":
                v[1] = v[1][0:-1]
            assert isinstance(v, object)
            d.update ({v[0]:v[1]})
        return d

    def setDict(self, d):
        newDict = d.copy()
        index = 0
        for line in self.lines:
            v = line.split("=")
            if (line[0] == "#") or (len(v) != 2):
                index = index + 1
                continue
            key = v[0].upper()
            if key in newDict:
                self.lines[index] = v[0] +"="+newDict[key]+"\n"
                del newDict[key]
            index = index + 1
        # Add remaining items
        for key in newDict:
            line = [key +"="+newDict[key]+"\n"]
            self.lines = self.lines + line


    def save(self, view=False, force=False):
        if view:
            for line in self.lines:
                print line
        else:
            f = open(self.fileName,"w")
            for line in self.lines:
                f.write(line)
            f.close()

    def change(self, vlan=None, interface=None):
        if vlan != None:
            self.vlan = vlan
        if interface != None:
            self.interface = interface

        result = self.rename(self.interface,self.vlan)
        if not result:
            return False
        d = self.getDict()
        d["DEVICE"] = self.interface + "." + self.vlan
        d["PHYSDEV"]= self.interface
        self.setDict(d)
        self.save()


cfgtpath="/etc/sysconfig/network-scripts"



if False:
    IcfgFile("eth2","4012",cfgtpath).change(interface="eth10",vlan="4012")
    IcfgFile("eth3","4013",cfgtpath).change(interface="eth11",vlan="4012")
    IcfgFile("eth4","4014",cfgtpath).change(interface="eth12",vlan="4012")
    IcfgFile("eth5","4015",cfgtpath).change(interface="eth13",vlan="4012")

    mlx1 = IcfgFile("eth20",None,cfgtpath)
    if mlx1.exists:
        mlx1.change(interface="eth14",vlan="4012")
    mlx2 = IcfgFile("eth21",None,cfgtpath)
    if mlx2.exists:
        mlx2.change(interface="eth15",vlan="4012")


