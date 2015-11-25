module.exports = React.createClass({
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
