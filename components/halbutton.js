/* Translate boolean value to bootstrap class */
var bool2class = function(aBoolean){
    if (aBoolean === true){
        return "success";
    } else if (aBoolean === false){
        return "danger";
    }
    return "default";
};

const HALButton = React.createClass({
    bootstrapClass: function(){
        var klass = "btn btn-" + bool2class(this.state.active);
        if (! this.props.writeable){
            klass = "disabled " + klass;
        }
        if (this.props.klass){
            klass = this.props.klass + ' ' + klass;
        }
        return klass;
    },
    render: function(){
        var klass = this.bootstrapClass();
        return <div onClick={this.onClick} className={klass}>
            {React.Children.only(this.props.children)}
        </div>;
    },
    getInitialState: function(){
        return {active: undefined};
    },
    onClick: function(ev){
        if (this.props.writeable){
            this.props.session.call(this.props.halKey + '.toggle');
        }
    },
    onUpdate: function(res){
        this.setState({active: res[0]});
    },
    componentDidMount: function(){
        this.props.session.call(this.props.halKey + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
        this.props.session.subscribe(this.props.halKey, this.onUpdate);
    }
});

module.exports = HALButton;
