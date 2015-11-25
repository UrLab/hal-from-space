module.exports = React.createClass({
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
