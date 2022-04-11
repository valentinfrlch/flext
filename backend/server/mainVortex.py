#/usr/bin/python3
from phue import Bridge
import time
import threading
from gpiozero import CPUTemperature
import psutil
from fanshim import FanShim

#constructors and global definitions
fanshim = FanShim()
NETWORK_INTERFACE = 'eth0'
netio = psutil.net_io_counters(pernic=True)
v = Bridge('10.0.1.145')
v.connect()


# main funtions
def mainThread():
    tempThreshold = 80
    while True:
        if int(monitor()[0]) >= tempThreshold:
            effect = "warning"
            fanshim.set_light(255, 0, 0)
        if monitor()[1] >= 111093288286: #todo: pihole API?
            effect = "warning"
        lighting_thread = threading.Thread(target=effects, args=["warning"])
        lighting_thread.start()
        time.sleep(5)



def monitor():
    usageMatrix = []
    usageMatrix.append(CPUTemperature().temperature) #CPU
    usageMatrix.append(netio[NETWORK_INTERFACE].bytes_sent + netio[NETWORK_INTERFACE].bytes_recv)
    
    return usageMatrix


def effects(effect):
    """
    effects:
        overheating: red
        warning: flashing red
        traffic: blue slowly fading
        welcome: blue fading in and out quickly
    
    v1.1 aded support for effects
    """

    commands = []

    if effect == "overheating":
        effectTime = 1 #in seconds
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])
    if effect == "warning":
        effectTime = 1
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])
    if effect == "traffic":
        effectTime = 1
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])
    if effect == "welcome":
        effectTime = 1
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])

    for request in commands:
        v.set_light(7, request[1])
        time.sleep(request[0])

