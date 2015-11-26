var Icon = require('./icon');

const Panel = React.createClass({
    render: function(){
        var children = React.Children.map(this.props.children, function(element){
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
                {children}
            </ul>
        </div>
    }
});

module.exports = Panel;
