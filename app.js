var bool2class = function(aBoolean){
    if (aBoolean == true){
        return "success";
    } else if (aBoolean == false){
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

/* <Binary session= prefix= suffix= name= writeable={true|false}> */
var Binary = React.createClass({
    halKey: function(){
        var suffix = (this.props.suffix) ? ('.' + this.props.suffix) : '';
        return this.props.prefix + '.' + this.props.name + suffix;
    },
    bootstrapClass: function(){
        return (this.props.writeable ? "btn btn-" : "disabled btn btn-");
    },
    render: function(){
        var klass = this.bootstrapClass() + this.state.button_class;
        return <div onClick={this.onClick} className={klass}>
            {this.props.name} {this.props.suffix}
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
        return <div>
            <Binary prefix="animation" suffix="play" writeable={true}
                    name={this.props.name} session={this.props.session}/>
            <Binary prefix="animation" suffix="loop" writeable={true}
                    name={this.props.name} session={this.props.session}/>
        </div>;
    }
});

var HAL = React.createClass({
    render: function(){
        var session = this.props.session;
        var triggers = this.state.triggers.map(function(trig){
            return <li><Binary prefix="trigger" name={trig} session={session}/></li>
        });
        var sensors = this.state.sensors.map(function(sens){
            return <li><Sensor name={sens} session={session}/></li>
        });
        var switchs = this.state.switchs.map(function(sw){
            return <li><Binary prefix="switch" name={sw}
                               session={session} writeable={true}/></li>
        });
        var animations = this.state.animations.map(function(anim){
            return <li><Animation name={anim} session={session}/></li>
        });

        return <div className="row">
            <ul className="col-md-3">{triggers}</ul>
            <ul className="col-md-3">{sensors}</ul>
            <ul className="col-md-3">{switchs}</ul>
            <ul className="col-md-3">{animations}</ul>
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
    var connection = new autobahn.Connection({
        url: 'ws://127.0.0.1:8080/ws',
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
