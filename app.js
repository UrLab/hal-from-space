var bool2class = function(aBoolean){
    if (aBoolean === true){
        return "success";
    } else if (aBoolean === false){
        return "danger";
    }
    return "default";
};

var Sensor = React.createClass({
    halKey: function(){return 'sensor.' + this.props.name;},
    render: function(){
        var style = {'width': this.state.value + '%'};
        return <div className="progress">
            <div className="progress-bar" style={style}>
                {this.props.name} {this.state.value}%
            </div>
        </div>
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
        return (this.props.writeable ? "btn btn-" : "disabled btn btn-");
    },
    render: function(){
        var klass = this.bootstrapClass() + this.state.button_class;
        if (this.props.klass){
            klass = klass + " " + this.props.klass;
        }

        var caption = this.props.name;
        if (this.props.icon){
            caption = <i className={"glyphicon glyphicon-"+this.props.icon}></i>;
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

var Animation = React.createClass({
    render: function(){
        return <div className="row">
            <div className="col-md-6">
                <h4>{this.props.name}</h4>
            </div>
            <div className="col-md-6">
                <HALButton prefix="animation" suffix="play" writeable={true}
                        name={this.props.name} session={this.props.session}
                        icon="play"/>
                &nbsp;
                <HALButton prefix="animation" suffix="loop" writeable={true}
                        name={this.props.name} session={this.props.session}
                        icon="repeat"/>
            </div>
        </div>;
    }
});

var Panel = React.createClass({
    render: function(){
        var lis = this.props.content.map(function(element){
            return <li className="list-group-item">{element}</li>;
        });
        return <div className={"panel panel-"+this.props.kind}>
            <div className="panel-heading">
                <h3>{this.props.header}</h3>
            </div>
            <ul className="panel-body list-group">
                {lis}
            </ul>
        </div>
    }
});

var HAL = React.createClass({
    render: function(){
        var session = this.props.session;
        var triggers = this.state.triggers.sort().map(function(trig){
            return <HALButton prefix="trigger" name={trig} session={session}/>
        });
        var sensors = this.state.sensors.sort().map(function(sens){
            return <Sensor name={sens} session={session}/>
        });
        var switchs = this.state.switchs.sort().map(function(sw){
            return <HALButton prefix="switch" name={sw}
                           session={session} writeable={true}/>
        });
        var animations = this.state.animations.sort().map(function(anim){
            return <Animation name={anim} session={session}/>
        });

        return <div className="row">
            <div className="col-md-3 col-sm-6 col-xs-12">
                <Panel header="Switchs" kind="danger" content={switchs}/>
            </div>
            <div className="col-md-3 col-sm-6 col-xs-12">
                <Panel header="Animations" kind="success" content={animations}/>
            </div>
            <div className="col-md-3 col-sm-6 col-xs-12">
                <Panel header="Triggers" kind="warning" content={triggers}/>
            </div>
            <div className="col-md-3 col-sm-6 col-xs-12">
                <Panel header="Sensors" kind="info" content={sensors}/>
            </div>
        </div>
    },
    getInitialState: function(){
        return {
            animations: [],
            switchs: [],
            sensors: [],
            triggers: []
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
        console.log("Connected !");
        ReactDOM.render(
            <HAL session={session}/>,
            document.getElementById('content'));
    };
    connection.open();
});
