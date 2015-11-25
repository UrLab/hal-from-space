var HALButton    = require('./halbutton'),
    HALSensor    = require('./halsensor'),
    HALRgb       = require('./halrgb'),
    HALAnimation = require('./halanimation'),
    Panel        = require('./panel');

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

module.exports = React.createClass({
    render: function(){
        var session = this.props.session;
        var triggers = this.state.triggers.sort().map(function(trig){
            return <LargeRowWrapper padding={2}>
                <HALButton klass="col-xs-8" prefix="trigger"
                           name={trig} session={session}/>
            </LargeRowWrapper>
        });
        var sensors = this.state.sensors.sort().map(function(sens){
            return <HALSensor name={sens} session={session}/>
        });
        var switchs = this.state.switchs.sort().map(function(sw){
            return <LargeRowWrapper padding={2}>
                <HALButton prefix="switch" name={sw} klass="col-xs-8"
                           session={session} writeable={true}/>
            </LargeRowWrapper>
        });
        var animations = this.state.animations.sort().map(function(anim){
            return <HALAnimation name={anim} session={session}/>
        });
        var rgbs = this.state.rgbs.sort().map(function(rgb){
            return <HALRgb name={rgb} session={session}/>
        });

        return <div className="row">
            <div className="col-lg-1 lg-only"></div>
            <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Many switchs" kind="danger" content={switchs} icon="log-out"/>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Much RGB leds" kind="primary" content={rgbs} icon="star"/>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Such animations" kind="success" content={animations} icon="fire"/>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Very triggers" kind="warning" content={triggers} icon="log-in"/>
            </div>
            <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header="Wow sensors" kind="info" content={sensors} icon="stats"/>
            </div>
            <div className="col-lg-1 lg-only"></div>
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
