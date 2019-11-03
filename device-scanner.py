#!/usr/bin/python

import bluetooth
import time
import requests
from device import device_id
from device import device_name
from settings import backend_base_url
from settings import api_key

print "Device Scanner"

file_name = 'devicelog.txt'
is_checked_in = False

check_interval = 5 * 60 # 5 minutes

def save(status, message):
    with open(file_name, "a") as myfile:
        myfile.write(message + '\n')

    if (status == 0):
        requests.post(backend_base_url + '/checkIn?apiKey=' + api_key, {})
    elif (status == 1):
        requests.post(backend_base_url + '/checkOut?apiKey=' + api_key, {})

while True:
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    print now + " Checking"

    result = bluetooth.lookup_name(device_id, timeout=5)

    if (result != None):
        if (is_checked_in == False):
            message = now + ' ' + device_name + " Arrived"
            print message
            save(0, message)
        is_checked_in = True
    else:
        if (is_checked_in == True):
            message = now + ' ' + device_name + " Left"
            print message
            save(1, message)
        is_checked_in = False

    time.sleep(check_interval)
