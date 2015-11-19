WAMP_BROKER = u"ws://127.0.0.1:8081/ws"
WAMP_REALM = "hal"
HALFS_ROOT = "/tmp/hal"

try:
    from local_config import *
except ImportError:
    pass
