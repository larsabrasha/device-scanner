#!/usr/bin/python

import bluetooth
import time
from device import device_id
from device import device_name

print "Device Scanner"

file_name = 'devicelog.txt'
is_checked_in = False

check_interval = 5 * 60 # 5 minutes

def save(status):
    with open(file_name, "a") as myfile:
        myfile.write(status + '\n')

while True:
    now = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    print now + " Checking"

    result = bluetooth.lookup_name(device_id, timeout=5)

    if (result != None):
        if (is_checked_in == False):
            message = now + ' ' + device_name + " Arrived"
            print message
            save(message)
        is_checked_in = True
    else:
        if (is_checked_in == True):
            message = now + ' ' + device_name + " Left"
            print message
            save(message)
        is_checked_in = False

    time.sleep(check_interval)
