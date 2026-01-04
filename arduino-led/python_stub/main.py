"""
Indy Sim LED Display - Python Stub

This app receives race data from the backend via arduino-router socket,
not from Python. This stub is just to keep the app framework happy.
The actual data flow is:
  Backend → arduino-router → Sketch (indy/raceUpdate method)
"""

from arduino.app_utils import *
import time

def loop():
    # The sketch receives data directly from backend
    # Python side doesn't need to do anything
    time.sleep(1)
    
    # Optional: could print status here
    # print("Indy Sim LED Display running...")

App.run(user_loop=loop)

