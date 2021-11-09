#/usr/bin/python3
from phue import Bridge
import time
import threading
from gpiozero import CPUTemperature
import psutil
NETWORK_INTERFACE = 'en0'
netio = psutil.net_io_counters(pernic=True)


v = Bridge('10.0.1.145')
v.connect()

v.get_api()

# main funtions

def monitor():
    usageMatrix = []
    usageMatrix.append(CPUTemperature()) #CPU
    usageMatrix.append(netio[NETWORK_INTERFACE].bytes_sent + netio[NETWORK_INTERFACE].bytes_recv)



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
        effectTime = 1 #in seconds
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])
    if effect == "traffic":
        effectTime = 1 #in seconds
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])
    if effect == "welcome":
        effectTime = 1 #in seconds
        commands.append([effectTime, {'transitiontime' : 30, 'on' : True, 'bri' : 254}])

    for request in commands:
        v.set_light(7, request[1])
        time.sleep(request[0])







lighting_thread = threading.Thread(target=thread_function, args=(1,))
lighting_thread.start()
