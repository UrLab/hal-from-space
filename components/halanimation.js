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
            V[x + i] = parseInt(y + i*dy);
        }
        this.setState({values: V, xmin: x, xmax: x+dx});
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
        this.fillValues(pos.x, pos.y, this.state.lastX, this.state.lastY);
        this.setState({lastX: pos.x, lastY: pos.y});
        this.renderValues();
    },
    startDrawing: function(evt){
        var pos = this.getMousePos(evt);
        this.setState({draw: true, lastX: pos.x, lastY: pos.y});
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
        var lower = this.state.xmin || 0,
            upper = this.state.xmax || 255;
        var canvas = ReactDOM.findDOMNode(this);
        var ctx = canvas.getContext('2d');
        ctx.clearRect(lower, 0, upper-lower+1, canvas.height);

        var V = this.state.values;
        for (var x=lower; x<=upper; x++){
            ctx.beginPath();
            ctx.arc(x, canvas.height-(V[x]/2),
                    this.props.pointSize, 
                    0, 2*Math.PI);
            ctx.stroke();
        }
    },
    onUpdate: function(res){
        var V = this.state.values;
        var y, xmin=255, xmax=0, changed=false;
        for (var i=0; i<V.length; i++){
            y = res[0][i];
            if (V[i] != y){
                if (! changed){
                    xmin = i;
                }
                V[i] = y;
                xmax = i;
                changed = true;
            }
        }
        if (changed){
            this.setState({values: V, xmin: xmin, xmax: xmax});
            this.renderValues();
        }
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
