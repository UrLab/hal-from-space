var Icon = require('./icon');

/* Translate boolean value to bootstrap class */
var bool2class = function(aBoolean){
    if (aBoolean === true){
        return "success";
    } else if (aBoolean === false){
        return "danger";
    }
    return "default";
};

module.exports = React.createClass({
    halKey: function(){
        var suffix = (this.props.suffix) ? ('.' + this.props.suffix) : '';
        return this.props.prefix + '.' + this.props.name + suffix;
    },
    bootstrapClass: function(){
        var klass = "btn btn-" + this.state.button_class;
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
        var caption = this.props.name;
        if (this.props.icon){
            caption = <Icon name={this.props.icon}/>;
        } else if (this.props.suffix){
            caption = this.props.name + ' ' + this.props.suffix;
        }

        return <div onClick={this.onClick} className={klass}>
            {caption}
        </div>
    },
    getInitialState: function(){
        return {button_class: "default"};
    },
    onClick: function(ev){
        if (this.props.writeable){
            this.props.session.call(this.halKey() + '.toggle');
        }
    },
    onUpdate: function(res){
        this.setState({button_class: bool2class(res[0])});
    },
    componentDidMount: function(){
        this.props.session.call(this.halKey() + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
        this.props.session.subscribe(this.halKey(), this.onUpdate);
    }
});
