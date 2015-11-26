const Icon = React.createClass({
    render: function(){
        return <i className={"glyphicon glyphicon-"+this.props.name}></i>;
    }
});

module.exports = Icon;
