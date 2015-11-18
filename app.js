var Trigger = React.createClass({
    render: function(){
        return <h2>
            <div className={"label label-" + this.state.button_class}>
                {this.props.name}
            </div>
        </h2>
    },
    getInitialState: function(){
        return {button_class: "default"};
    },
    onUpdate: function(res){
        if (res[0] == true){
            this.setState({button_class: "success"});
        } else if (res[0] == false){
            this.setState({button_class: "danger"});
        } else {
            this.setState({button_class: "default"});
        }
    },
    componentDidMount: function(){
        this.props.session.subscribe('trigger.'+this.props.name, this.onUpdate);
    }
});

var Sensor = React.createClass({
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
        this.props.session.subscribe('sensor.'+this.props.name, this.onUpdate);
    }
});

var Switch = React.createClass({
    render: function(){
        return <button onClick={this.onClick} className={"btn btn-" + this.state.button_class}>
            {this.props.name}
        </button>
    },
    getInitialState: function(){
        return {button_class: "default"};
    },
    onClick: function(ev){
        this.props.session.call('switch.'+this.props.name+'.toggle');
    },
    onUpdate: function(res){
        if (res[0] == true){
            this.setState({button_class: "success"});
        } else if (res[0] == false){
            this.setState({button_class: "danger"});
        } else {
            this.setState({button_class: "default"});
        }
    },
    componentDidMount: function(){
        this.props.session.subscribe('switch.'+this.props.name, this.onUpdate);
    }
});

var HAL = React.createClass({
    render: function(){
        var session = this.props.session;
        var triggers = this.state.triggers.map(function(trig){
            return <li><Trigger name={trig} session={session}/></li>
        });
        var sensors = this.state.sensors.map(function(sens){
            return <li><Sensor name={sens} session={session}/></li>
        });
        var switchs = this.state.switchs.map(function(sw){
            return <li><Switch name={sw} session={session}/></li>
        });

        return <div className="row">
            <ul className="col-md-3">{triggers}</ul>
            <ul className="col-md-3">{sensors}</ul>
            <ul className="col-md-3">{switchs}</ul>
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
