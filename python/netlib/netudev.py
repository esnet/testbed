import os,commands


class NetUdev:
    def __init__(self,rootpath=""):

        self.exists = False
        self.rootpath = rootpath
        self.filename = os.path.join(self.rootpath + "/etc/udev/rules.d/70-persistent-net.rules")
        # Try first /etc/rc.d/rc.local and then /etc/rc.local
        if not os.path.exists(self.filename):
            self.filename = self.rootpath + "/etc/udev/rules.d/10-persistent-net.rules"
            if not os.path.exists(self.filename):
                    self.exists = False
            else:
                self.exists = True
        else:
            self.exists = True
        if self.exists:
            file = open(self.filename)
            self.lines = file.readlines()
            file.close()
        else:
            self.lines = []

    def display(self):
        for line in self.lines:
            if line[-1] == "\n":
                print line [0:-1]
            else:
                print line


    def changeInterface(self,interface,vlan=None,view=False):
        # Seems nothing needs to be done in relation to VLAN's. Keeping it for future
        # Dumb find and change works for now.
        newLines = []
        for line in self.lines:
            newLines = newLines + [line.replace ('"' + interface[0] + '"','"' + interface[1] + '"')]
        self.lines = newLines
        #print self.lines

    def save(self,view=False):
        if view:
            self.display()
        else:
            file = open(self.filename,"w")
            for line in self.lines:
                file.write (line)
            file.close()




if False:
    conf = NetUdev(rootpath="/")
    if not conf.exists:
        print conf.filename + " does not exist."
        exit(-1)

    #conf.changeInterface(["eth2","eth10"],view=True)
    # ["eth20","eth14"],["eth21","eth15"]
    for eth in [["eth2","eth10"],["eth3","eth11"],["eth4","eth12"],["eth5","eth13"],["eth20","eth14"],["eth21","eth15"],["eth2","eth10"]]:
        print eth
        conf.changeInterface(eth,view=False)

    conf.save(view=False)