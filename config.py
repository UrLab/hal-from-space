WAMP_BROKER = u"ws://127.0.0.1:8081/ws"
WAMP_REALM = "hal"
HALFS_ROOT = "/tmp/hal"
HAL_IGNORE = {
    'animations': set(),
    'switchs': set(),
    'sensors': set(),
    'triggers': set(),
    'rgbs': set(),
}
DEBUG = False

try:
    from local_config import *
except ImportError:
    pass
