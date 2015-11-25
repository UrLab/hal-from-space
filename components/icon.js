module.exports = React.createClass({
    render: function(){
        return <i className={"glyphicon glyphicon-"+this.props.name}></i>;
    }
});
