var Icon = require('./icon');

var ButtonGroup    = ReactBootstrap.ButtonGroup,
    DropdownButton = ReactBootstrap.DropdownButton,
    MenuItem       = ReactBootstrap.MenuItem,
    Button         = ReactBootstrap.Button;

const HALRgb = React.createClass({
    halKey: function(){
        return "rgb." + this.props.name;
    },
    getInitialState: function(){
        return {color: '#000000'};
    },
    handleChange: function(arg){
        var color = arg.target.value;
        this.props.session.call(this.halKey() + '.set', [color]);
    },
    render: function(){
        var style = {background: this.state.color};
        return <div className="row">
            <ButtonGroup className="col-xs-12">
                <Button style={style}>
                    <Icon name="star"/>
                </Button>
                <DropdownButton title={this.props.name}>
                    <MenuItem header>
                        <h3>{this.props.name.toUpperCase()}</h3>
                    </MenuItem>
                    <MenuItem header>
                        <h4>Color <small>Click to change</small></h4>
                        <input type="color" value={this.state.color}
                               onChange={this.handleChange}/>
                    </MenuItem>
                </DropdownButton>
            </ButtonGroup>
        </div>;
    },
    onUpdate: function(res){
        this.setState({color: res[0]});
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.halKey(), this.onUpdate);
        this.props.session.call(this.halKey() + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
    }
});

module.exports = HALRgb;
