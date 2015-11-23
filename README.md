# HAL from Space

Control [HAL](https://github.com/urlab/hal) in a reactive WebApp from the hackerspace network !

![screenshot](screenshot.png)

## Install your own

    virtualenv -p python3 ve3
    source ve3/bin/activate
    pip install -r requirements.txt

## Run

You need a running [HAL-driver](https://github.com/urlab/hal-driver)

* Eventually add a `local_config.py` file, copy and edit config values from `config.py` as needed
* Eventually add a `static/config.js` with your host (see `static/config.example.js`)
* `crossbar start`
