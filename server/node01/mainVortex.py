#/usr/bin/python3
from phue import Bridge

v = Bridge('10.0.1.145')
v.connect()

v.get_api()

#needs some threading: one thread to check server status
# and one to control the lights. -> effects()



def effects(effect):
    """
    effects:
        overheating: red
        warning: flashing red
        traffic: blue slowly fading
        welcome: blue fading in and out quickly
        """
    if effect == "overheating":
        command =  {'transitiontime' : 30, 'on' : True, 'bri' : 254}
    if effect == "warning":
        command =  {'transitiontime' : 30, 'on' : True, 'bri' : 254}
    if effect == "traffic":
        command =  {'transitiontime' : 30, 'on' : True, 'bri' : 254}
    if effect == "welcome":
        command =  {'transitiontime' : 30, 'on' : True, 'bri' : 254}
    v.set_light(7, command)
