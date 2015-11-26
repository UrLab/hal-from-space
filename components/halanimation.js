const HALButton = require('./halbutton'),
    HALSlider = require('./halslider'),
    Icon      = require('./icon');

const ButtonGroup    = ReactBootstrap.ButtonGroup,
    DropdownButton = ReactBootstrap.DropdownButton,
    MenuItem       = ReactBootstrap.MenuItem,
    Button         = ReactBootstrap.Button;

const DrawZone = React.createClass({
    fillValues: function(x1, y1, x2, y2){
        var y, dy, x, dx;
        if (x1 < x2){
            x = x1;  dx = x2 - x1;
            y = y1;  dy = (y2 - y1) / dx;
        } else if (x2 < x1) {
            x = x2;  dx = x1 - x2;
            y = y2;  dy = (y1 - y2) / dx;
        } else {
            x = x1;  dx = 0;
            y = y1;  dy = 1;
        }

        var V = this.state.values;
        for (var i=0; i<=dx; i++){
            V[x + i] = y + i*dy;
        }
        return V;
    },
    getMousePos: function(evt){
        var canvas = evt.target;
        var rect = canvas.getBoundingClientRect();
        return {
            x: parseInt(evt.clientX - rect.left),
            y: 2 * parseInt(canvas.height - (evt.clientY - rect.top))
        };
    },
    drawFromMouse: function(evt){
        if (! this.state.draw){
            return;
        }
        var pos = this.getMousePos(evt);
        var V = this.fillValues(pos.x, pos.y, this.state.lastX, this.state.lastY);
        this.setState({values: V, lastX: pos.x, lastY: pos.y});
        this.renderValues();
    },
    startDrawing: function(evt){
        var pos = this.getMousePos(evt);
        this.setState({draw: true, lastX: pos.x, lastY: pos.y});
        this.drawFromMouse(evt);
    },
    finishDrawing: function(evt){
        var wasDrawing = this.state.draw;
        this.setState({draw: false});
        if (wasDrawing){
            this.props.session.call(
                this.props.halKey + '.set',
                [this.state.values]);
        }
    },
    getInitialState: function(){
        var V = new Array(255);
        for (var i=0; i<V.length; i++){
            V[i] = 0;
        }
        return {values: V, lastX: 0, lastY: 0};
    },
    renderValues: function(){
        var canvas = ReactDOM.findDOMNode(this);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var V = this.state.values;
        for (var x=0; x<V.length; x++){
            ctx.beginPath();
            ctx.arc(x, canvas.height-(V[x]/2),
                    this.props.pointSize, 
                    0, 2*Math.PI);
            ctx.stroke();
        }
    },
    onUpdate: function(res){
        var V = this.state.values;
        for (var i=0; i<V.length; i++){
            V[i] = parseInt(res[0][i]);
        }
        this.setState({values: V});
        this.renderValues();
    },
    componentDidMount: function(){
        this.props.session.subscribe(this.props.halKey, this.onUpdate);
        this.props.session.call(this.props.halKey + '.state').then(function(res){
            this.onUpdate([res]);
        }.bind(this));
    },
    render: function(){
        var style = {border: "solid 1px #333", cursor: "crosshair"};
        return <canvas width={253} height={125} style={style}
                       onMouseDown={this.startDrawing}
                       onMouseUp={this.finishDrawing}
                       onMouseMove={this.drawFromMouse}
                       onMouseOut={this.finishDrawing}>
        </canvas>;
    }
});

const HALAnimation = React.createClass({
    render: function(){
        var session = this.props.session;
        var name = this.props.name;
        var key = "animation." + name;

        return <div className="row">
            <ButtonGroup className="col-md-12">
                <HALButton halKey={key+'.play'} writeable={true} session={session}>
                    <Icon name="play"/>
                </HALButton>
                <HALButton halKey={key+'.loop'} writeable={true} session={session}>
                    <Icon name="repeat"/>
                </HALButton>
                <DropdownButton title={this.props.name}>
                    <MenuItem header>
                        <h3>{this.props.name.toUpperCase()}</h3>
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem header>
                        <h4>
                            Frames&nbsp;
                            <small>Animation content</small>
                        </h4>
                        <DrawZone halKey={'animation.'+name+'.frames'}
                                  session={this.props.session}
                                  pointSize={1}/>
                    </MenuItem>
                    <MenuItem header>
                        <h4>
                            FPS&nbsp;
                            <small>Animation speed</small>
                        </h4>
                        <HALSlider halKey={'animation.'+this.props.name+'.fps'}
                                   min={4} max={250} session={session}/>
                    </MenuItem>
                </DropdownButton>
            </ButtonGroup>
        </div>;
    }
});

module.exports = HALAnimation;
