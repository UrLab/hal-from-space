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
    renderPanels: function(){
        var session = this.props.session;
        return [
            {
                icon: 'log-out', header: "Many Switchs", kind: 'danger',
                content: this.state.switchs.sort().map(function(sw){
                    var key = "switch." + sw;
                    return <LargeRowWrapper padding={2}>
                        <HALButton klass="col-xs-8" halKey={key} writeable={true} session={session}>
                            <span>{sw}</span>
                        </HALButton>
                    </LargeRowWrapper>;
                })
            },
            {
                icon: 'star', header: "Much RGB leds", kind: 'primary',
                content: this.state.rgbs.sort().map(function(rgb){
                    return <HALRgb name={rgb} session={session}/>;
                })
            },
            {
                icon: 'fire', header: "Such Animations", kind: 'success',
                content: this.state.animations.sort().map(function(anim){
                    return <HALAnimation name={anim} session={session}/>;
                })
            },
            {
                icon: 'log-in', header: "Very Triggers", kind: 'warning',
                content: this.state.triggers.sort().map(function(trig){
                    var key = "trigger." + trig;
                    return <LargeRowWrapper padding={2}>
                        <HALButton klass="col-xs-8" halKey={key} writeable={false} session={session}>
                            <span>{trig}</span>
                        </HALButton>
                    </LargeRowWrapper>;
                })
            },
            {
                icon: 'stats', header: "Wow Sensors", kind: 'info',
                content: this.state.sensors.sort().map(function(sens){
                    return <HALSensor name={sens} session={session}/>;
                })
            }
        ];
    },
    render: function(){
        var panelsWrapped = this.renderPanels().map(function(pan){
            return <div className="col-lg-2 col-md-6 col-sm-12 col-xs-12">
                <Panel header={pan.header} kind={pan.kind} icon={pan.icon}>
                    {pan.content}
                </Panel>
            </div>;
        })

        return <div className="row">
            <div className="col-lg-1 lg-only"></div>
            {panelsWrapped}
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
