var Icon = require('./icon');

module.exports = React.createClass({
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
