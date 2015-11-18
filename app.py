import asyncio
from os import environ
from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner
from halpy import HAL
from config import WAMP_BROKER, WAMP_REALM, HALFS_ROOT


class WebHAL(HAL):
    def layout(self):
        return {
            'animations': list(self.animations.keys()),
            'switchs': list(self.switchs.keys()),
            'sensors': list(self.sensors.keys()),
            'triggers': list(self.triggers.keys()),
        }


class Component(ApplicationSession):
    """
    An application component that publishes an event every second.
    """

    def periodic_tasks(self):
        while True:
            for sensor in self.hal.sensors.values():
                self.publish('sensor.'+sensor.name, sensor.value)
            yield from asyncio.sleep(2.5)

    @asyncio.coroutine
    def onJoin(self, details):
        self.hal = WebHAL(HALFS_ROOT)
        self.hal.install_loop()

        @self.hal.on_trigger()
        def publish_trigger(name, state):
            key = 'trigger.%s' % name
            self.publish(key, state)

        yield from self.register(self.hal.layout, u'tree')
        for sw in self.hal.switchs.values():
            key = 'switch.%s' % sw.name
            def toggle_switch():
                sw.on = not sw.on
            yield from self.register(toggle_switch, key + '.toggle')
            @sw.on_change
            def publish_switch(*args):
                self.publish(key, sw.on)

        yield from self.periodic_tasks()


if __name__ == '__main__':
    runner = ApplicationRunner(
        WAMP_BROKER, WAMP_REALM,
        debug_wamp=True,  # optional; log many WAMP details
        debug=False,  # optional; log even more details
    )
    runner.run(Component)