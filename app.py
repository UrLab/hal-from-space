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

    @asyncio.coroutine
    def periodic_tasks(self):
        while True:
            for sensor in self.hal.sensors.values():
                self.publish('sensor.'+sensor.name, sensor.value)
            yield from asyncio.sleep(2.5)

    @asyncio.coroutine
    def register_triggers(self):
        @self.hal.on_trigger()
        def publish_trigger(name, state):
            key = 'trigger.%s' % name
            self.publish(key, state)

        for trig in self.hal.triggers.values():
            key = 'trigger.%s.state' % trig.name

            def current_state_trigger(trigger=trig):
                return trigger.on
            yield from self.register(current_state_trigger, key)

    @asyncio.coroutine
    def register_switchs(self):
        for sw in self.hal.switchs.values():
            key = 'switch.%s' % sw.name

            def current_state_switch(switch=sw):
                return switch.on
            yield from self.register(current_state_switch, key + '.state')

            def toggle_switch(switch=sw):
                switch.on = not switch.on
            yield from self.register(toggle_switch, key + '.toggle')

            @sw.on_change
            def publish_switch(switch):
                self.publish('switch.%s' % switch.name, switch.on)

    @asyncio.coroutine
    def register_animations(self):
        for anim in self.hal.animations.values():
            key = 'animation.%s' % anim.name

            def current_state_playing(animation=anim):
                return animation.playing
            yield from self.register(current_state_playing, key + '.play.state')

            def toggle_playing(animation=anim):
                animation.playing = not animation.playing
            yield from self.register(toggle_playing, key + '.play.toggle')

            def current_state_looping(animation=anim):
                return animation.looping
            yield from self.register(current_state_looping, key + '.loop.state')

            def toggle_looping(animation=anim):
                animation.looping = not animation.looping
            yield from self.register(toggle_looping, key + '.loop.toggle')

            def current_fps(animation=anim):
                return animation.fps
            yield from self.register(current_fps, key + '.fps.state')

            def set_fps(fps, animation=anim):
                animation.fps = int(fps)
            yield from self.register(set_fps, key + '.fps.set')

            @anim.on_change
            def publish_anim(animation):
                key = "animation.%s" % animation.name
                self.publish(key+'.loop', animation.looping)
                self.publish(key+'.play', animation.playing)
                self.publish(key+'.fps', animation.fps)

    @asyncio.coroutine
    def onJoin(self, details):
        self.hal = WebHAL(HALFS_ROOT)
        yield from self.register(self.hal.layout, u'tree')
        yield from self.register_switchs()
        yield from self.register_triggers()
        yield from self.register_animations()
        self.hal.install_loop()
        yield from self.periodic_tasks()


if __name__ == '__main__':
    runner = ApplicationRunner(WAMP_BROKER, WAMP_REALM)
    runner.run(Component)