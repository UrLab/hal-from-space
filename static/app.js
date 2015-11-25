var ButtonGroup    = ReactBootstrap.ButtonGroup,
    DropdownButton = ReactBootstrap.DropdownButton,
    MenuItem       = ReactBootstrap.MenuItem,
    Button         = ReactBootstrap.Button;


/* Translate boolean value to bootstrap class */
var bool2class = function(aBoolean){
    if (aBoolean === true){
        return "success";
    } else if (aBoolean === false){
        return "danger";
    }
    return "default";
};

var Icon = React.createClass({
    render: function(){
        return <i className={"glyphicon glyphicon-"+this.props.name}></i>;
    }
})

var Sensor = React.createClass({
    halKey: function(){return 'sensor.' + this.props.name;},
    render: function(){
        var style = {'width': this.state.value + '%'};
        var klass = "progress-bar";
        if (25 < this.state.value && this.state.value <= 50){
            klass += " progress-bar-info"
        } else if (50 < this.state.value && this.state.value <= 75){
            klass += " progress-bar-warning";
        } else if (this.state.value > 75){
            klass += " progress-bar-danger";
        }

        if (this.state.value < 25){
            return <div className="progress">
                <div className={klass} style={style}></div>
                &nbsp;
                {this.props.name} {this.state.value}%
            </div>
        }
        else if (this.state.value < 65){
            return <div className="progress">
                <div className={klass} style={style}>
                    {this.props.name}
                </div>
                &nbsp;
                {this.state.value}%
            </div>
        }
        else {
            return <div className="progress">
                <div className={klass} style={style}>
                    {this.props.name} {this.state.value}%
                </div>
            </div>
        }
    },
    getInitialState: function(){
        return {value: 0};
    },
    onUpdate: function(res){
        this.setState({value: Math.ceil(100*res[0])});
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.halKey(), this.onUpdate);
    }
});

var HALButton = React.createClass({
    halKey: function(){
        var suffix = (this.props.suffix) ? ('.' + this.props.suffix) : '';
        return this.props.prefix + '.' + this.props.name + suffix;
    },
    bootstrapClass: function(){
        var klass = "btn btn-" + this.state.button_class;
        if (! this.props.writeable){
            klass = "disabled " + klass;
        }
        if (this.props.klass){
            klass = this.props.klass + ' ' + klass;
        }
        return klass;
    },
    render: function(){
        var klass = this.bootstrapClass();
        var caption = this.props.name;
        if (this.props.icon){
            caption = <Icon name={this.props.icon}/>;
        } else if (this.props.suffix){
            caption = this.props.name + ' ' + this.props.suffix;
        }

        return <div onClick={this.onClick} className={klass}>
            {caption}
        </div>
    },
    getInitialState: function(){
        return {button_class: "default"};
    },
    onClick: function(ev){
        if (this.props.writeable){
            this.props.session.call(this.halKey() + '.toggle');
        }
    },
    onUpdate: function(res){
        this.setState({button_class: bool2class(res[0])});
    },
    componentDidMount: function(){
        this.props.session.call(this.halKey() + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
        this.props.session.subscribe(this.halKey(), this.onUpdate);
    }
});

var HALSlider = React.createClass({
    handleChange: function(arg){
        var val = arg.target.value;
        this.props.session.call(this.props.halKey + '.set', [val]);
    },
    render: function(){
        return <BootstrapSlider value={this.state.value} step={1}
                                min={this.props.min} max={this.props.max}
                                handleChange={this.handleChange}/>
    },
    getInitialState: function(){
        return {value: 0};
    },
    onUpdate: function(res){
        this.setState({value: parseInt(res[0], 10)});
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.props.halKey, this.onUpdate);
        this.props.session.call(this.props.halKey + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
    }
});

var DrawZone = React.createClass({
    fillValues: function(x1, y1, x2, y2){
        var y, dy, x, dx;
        if (x1 < x2){
            x = x1;  dx = x2 - x1;
            y = y1;  dy = (y2 - y1) / dx;
        } else if (x2 < x1) {
            x = x2;  dx = x1 - x2;
            y = y2;  dy = (y1 - y2) / dx;
        } else {
            x = x1;  dx = 0;
            y = y1;  dy = 1;
        }

        var V = this.state.values;
        for (var i=0; i<=dx; i++){
            V[x + i] = y + i*dy;
        }
        return V;
    },
    getMousePos: function(evt){
        var canvas = evt.target;
        var rect = canvas.getBoundingClientRect();
        return {
            x: parseInt(evt.clientX - rect.left),
            y: 2 * parseInt(canvas.height - (evt.clientY - rect.top))
        };
    },
    drawFromMouse: function(evt){
        if (! this.state.draw){
            return;
        }
        var pos = this.getMousePos(evt);
        var V = this.fillValues(pos.x, pos.y, this.state.lastX, this.state.lastY);
        this.setState({values: V, lastX: pos.x, lastY: pos.y});
        this.renderValues();
    },
    startDrawing: function(evt){
        var pos = this.getMousePos(evt);
        this.setState({draw: true, lastX: pos.x, lastY: pos.y});
        this.drawFromMouse(evt);
    },
    finishDrawing: function(evt){
        var wasDrawing = this.state.draw;
        this.setState({draw: false});
        if (wasDrawing){
            this.props.session.call(
                this.props.halKey + '.set',
                [this.state.values]);
        }
    },
    getInitialState: function(){
        var V = new Array(255);
        for (var i=0; i<V.length; i++){
            V[i] = 0;
        }
        return {values: V, lastX: 0, lastY: 0};
    },
    renderValues: function(){
        var canvas = this.getDOMNode();
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var V = this.state.values;
        for (var x=0; x<V.length; x++){
            ctx.beginPath();
            ctx.arc(x, canvas.height-(V[x]/2),
                    this.props.pointSize, 
                    0, 2*Math.PI);
            ctx.stroke();
        }
    },
    onUpdate: function(res){
        var V = this.state.values;
        for (var i=0; i<V.length; i++){
            V[i] = parseInt(res[0][i]);
        }
        this.setState({values: V});
        this.renderValues();
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.props.halKey, this.onUpdate);
        this.props.session.call(this.props.halKey + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
    },
    render: function(){
        var style = {border: "solid 1px #333", cursor: "crosshair"};
        return <canvas width={253} height={125} style={style}
                       onMouseDown={this.startDrawing}
                       onMouseUp={this.finishDrawing}
                       onMouseMove={this.drawFromMouse}
                       onMouseOut={this.finishDrawing}>
        </canvas>;
    }
});

var Animation = React.createClass({
    render: function(){
        var session = this.props.session;
        var name = this.props.name;

        return <div className="row">
            <ButtonGroup className="col-md-12">
                <HALButton prefix="animation" suffix="play"
                           writeable={true} name={name}
                           session={session} icon="play"/>
                <HALButton prefix="animation" suffix="loop"
                           writeable={true} name={name}
                           session={session} icon="repeat"/>
                <DropdownButton title={this.props.name}>
                    <MenuItem header>
                        <h3>{this.props.name.toUpperCase()}</h3>
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem header>
                        <h4>
                            Frames&nbsp;
                            <small>Animation content</small>
                        </h4>
                        <DrawZone halKey={'animation.'+name+'.frames'}
                                  session={this.props.session}
                                  pointSize={1}/>
                    </MenuItem>
                    <MenuItem header>
                        <h4>
                            FPS&nbsp;
                            <small>Animation speed</small>
                        </h4>
                        <HALSlider halKey={'animation.'+this.props.name+'.fps'}
                                   min={4} max={250} session={session}/>
                    </MenuItem>
                </DropdownButton>
            </ButtonGroup>
        </div>;
    }
});

var HALRgb = React.createClass({
    halKey: function(){
        return "rgb." + this.props.name;
    },
    getInitialState: function(){
        return {color: '#000000'};
    },
    handleChange: function(arg){
        var color = arg.target.value;
        this.props.session.call(this.halKey() + '.set', [color]);
    },
    render: function(){
        var style = {background: this.state.color};
        return <div className="row">
            <ButtonGroup className="col-xs-12">
                <Button style={style}>
                    <Icon name="star"/>
                </Button>
                <DropdownButton title={this.props.name}>
                    <MenuItem header>
                        <h3>{this.props.name.toUpperCase()}</h3>
                    </MenuItem>
                    <MenuItem header>
                        <h4>Color <small>Click to change</small></h4>
                        <input type="color" value={this.state.color}
                               onChange={this.handleChange}/>
                    </MenuItem>
                </DropdownButton>
            </ButtonGroup>
        </div>;
    },
    onUpdate: function(res){
        this.setState({color: res[0]});
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.halKey(), this.onUpdate);
        this.props.session.call(this.halKey() + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
    }
});

var Panel = React.createClass({
    render: function(){
        var lis = this.props.content.map(function(element){
            return <li className="list-group-item">{element}</li>;
        });
        var icon_dom = '';
        if (this.props.icon){
            icon_dom = <Icon name={this.props.icon}/>;
        }
        return <div className={"panel panel-"+this.props.kind}>
            <div className="panel-heading">
                <h3>
                    {icon_dom}&nbsp;
                    {this.props.header}
                </h3>
            </div>
            <ul className="panel-body list-group">
                {lis}
            </ul>
        </div>
    }
});

var LargeRowWrapper = React.createClass({
    render: function(){
        var klass = "col-xs-" + this.props.padding;
        return <div className="row">
            <div className={klass}></div>
            {React.Children.only(this.props.children)}
            <div className={klass}></div>
        </div>
    }
});

var HAL = React.createClass({
    render: function(){
        var session = this.props.session;
        var triggers = this.state.triggers.sort().map(function(trig){
            return <LargeRowWrapper padding={2}>
                <HALButton klass="col-xs-8" prefix="trigger"
                           name={trig} session={session}/>
            </LargeRowWrapper>
        });
        var sensors = this.state.sensors.sort().map(function(sens){
            return <Sensor name={sens} session={session}/>
        });
        var switchs = this.state.switchs.sort().map(function(sw){
            return <LargeRowWrapper padding={2}>
                <HALButton prefix="switch" name={sw} klass="col-xs-8"
                           session={session} writeable={true}/>
            </LargeRowWrapper>
        });
        var animations = this.state.animations.sort().map(function(anim){
            return <Animation name={anim} session={session}/>
        });
        var rgbs = this.state.rgbs.sort().map(function(rgb){
            return <HALRgb name={rgb} session={session}/>
        });

        return <div className="row">
            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Many switchs" kind="danger" content={switchs} icon="log-out"/>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Much RGB leds" kind="primary" content={rgbs} icon="star"/>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Such animations" kind="success" content={animations} icon="fire"/>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Very triggers" kind="warning" content={triggers} icon="log-in"/>
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Wow sensors" kind="info" content={sensors} icon="stats"/>
            </div>
        </div>
    },
    getInitialState: function(){
        return {
            animations: [],
            switchs: [],
            sensors: [],
            triggers: [],
            rgbs: []
        };
    },
    componentDidMount: function(){
        this.props.session.call('tree').then(function(res){
            this.setState(res);
        }.bind(this));
    }
});

$(document).ready(function(){
    var url;
    try {
        url = WAMP_ENDPOINT;
    } catch (err) {
        url = 'ws://127.0.0.1:8081/ws';
    }
    var connection = new autobahn.Connection({
        url: url,
        realm: 'hal'
    });

    connection.onopen = function(session){
        console.log("Connected to " + url + " !");
        ReactDOM.render(
            <HAL session={session}/>,
            document.getElementById('content'));
    };
    connection.open();
});
