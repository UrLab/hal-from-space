var HAL = require('./hal');

$(document).ready(function(){
    var url;
    try {
        url = WAMP_ENDPOINT;
    } catch (err) {
        url = 'ws://' + window.location.hostname + '/ws';
    }
    var connection = new autobahn.Connection({
        url: url,
        realm: 'hal'
    });

    connection.onopen = function(session){
        console.log("Connected to " + url + " !");
        ReactDOM.render(
            <HAL session={session}/>,
            document.getElementById('content'));
    };
    connection.open();
});
