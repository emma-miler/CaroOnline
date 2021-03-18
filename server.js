
var x = undefined;

function start(isServer) {

    var lastPeerId = null;
    var peer = null; // Own peer object
    var peerId = null;
    var conn = null;
    var recvId = document.getElementById("receiver-id");
    var clientId = document.getElementById("client-id");
    var status = document.getElementById("status");
    var message = document.getElementById("message");
    var sendMessageBox = document.getElementById("sendMessageBox");
    var sendMessage = document.getElementById("send");
    var recvMessage = document.getElementById("send");
    var game = document.getElementById("connected");

    /**
     * Create the Peer object for our end of the connection.
     *
     * Sets up callbacks that handle any events related to our
     * peer object.
     */
     function initialize(isServer) {
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer(null, {
            debug: 2
        });
        
        if (isServer) {
            peer.on('open', function (id) {
                // Workaround for peer.reconnect deleting previous id
                if (peer.id === null) {
                    console.log('Received null id from peer open');
                    peer.id = lastPeerId;
                } else {
                    lastPeerId = peer.id;
                }

                console.log('ID: ' + peer.id);
                document.getElementById("idText").innerHTML = peer.id;
                //status.innerHTML = "Awaiting connection...";
            });
        }
        else {
            peer.on('open', function (id) {
                // Workaround for peer.reconnect deleting previous id
                if (peer.id === null) {
                    console.log('Received null id from peer open');
                    peer.id = lastPeerId;
                } else {
                    lastPeerId = peer.id;
                }
    
                console.log('ID: ' + peer.id);
            });
        }
        if (isServer) {
            peer.on('connection', function (c) {
                // Allow only a single connection
                if (conn && conn.open) {
                    c.on('open', function() {
                        c.send("Already connected to another client");
                        setTimeout(function() { c.close(); }, 500);
                    });
                    return;
                }

                conn = c;
                x = c;
                console.log("Connected to: " + conn.peer);
                game.click()
                //status.innerHTML = "Connected";
                ready();
            });
        }
        else {
            peer.on('connection', function (c) {
                // Disallow incoming connections
                c.on('open', function() {
                    c.send("Sender does not accept incoming connections");
                    setTimeout(function() { c.close(); }, 500);
                });
            });
        }
        peer.on('disconnected', function () {
            status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });
        peer.on('close', function() {
            conn = null;
            status.innerHTML = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
        });
        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });

        if (!isServer) {
            join()
        }

    };

    function join() {
        // Close old connection
        if (conn) {
            conn.close();
        }

        // Create connection to destination peer specified in the input field
        conn = peer.connect(clientId.value, {
            reliable: true
        });

        conn.on('open', function () {
            //status.innerHTML = "Connected to: " + conn.peer;
            console.log("Connected to: " + conn.peer);
            game.click()

            // Check URL params for comamnds that should be sent immediately
            //var command = getUrlParam("command");
            //if (command)
            //    conn.send(command);
        });
        // Handle incoming data (messages only since this is the signal sender)
        conn.on('data', function (data) {
            addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
            console.log("test123")
        });
        conn.on('close', function () {
            status.innerHTML = "Connection closed";
        });
    };

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    function ready() {
        conn.on('data', function (data) {
            console.log("Data recieved");
            var cueString = "<span class=\"cueMsg\">Cue: </span>";
            switch (data) {
                case 'Go':
                    go();
                    addMessage(cueString + data);
                    break;
                case 'Fade':
                    fade();
                    addMessage(cueString + data);
                    break;
                case 'Off':
                    off();
                    addMessage(cueString + data);
                    break;
                case 'Reset':
                    reset();
                    addMessage(cueString + data);
                    break;
                default:
                    addMessage("<span class=\"peerMsg\">Peer: </span>" + data);
                    break;
            };
            console.log("data")
            console.log(data)
            recvMessage.innerHTML = data
            recvMessage.click()
        });
        conn.on('close', function () {
            //status.innerHTML = "Connection reset<br>Awaiting connection...";
            console.log("CONNECTION CLOSED")
            conn = null;
        });
    }

    function addMessage(msg) {
        var now = new Date();
        var h = now.getHours();
        var m = addZero(now.getMinutes());
        var s = addZero(now.getSeconds());

        if (h > 12)
            h -= 12;
        else if (h === 0)
            h = 12;

        function addZero(t) {
            if (t < 10)
                t = "0" + t;
            return t;
        };

        console.log(msg)

        //message.innerHTML = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  " + msg + message.innerHTML;
    }

    function clearMessages() {
        message.innerHTML = "";
        addMessage("Msgs cleared");
    }

    // Listen for enter in message box
    /*sendMessageBox.addEventListener('keypress', function (e) {
        var event = e || window.event;
        var char = event.which || event.keyCode;
        if (char == '13')
            sendButton.click();
    });*/
    // Send message
    /*
    sendButton.addEventListener('click', function () {
        if (conn && conn.open) {
            var msg = sendMessageBox.value;
            sendMessageBox.value = "";
            conn.send(msg);
            console.log("Sent: " + msg)
            addMessage("<span class=\"selfMsg\">Self: </span>" + msg);
        } else {
            console.log('Connection is closed');
        }
    });*/

    sendMessage.addEventListener('click', function () {
        console.log("TEST12323423423423")
        if (conn && conn.open) {
            var msg = "test123"; //customMessage.value;
            //message.value = "";
            conn.send(msg);
            console.log("Sent: " + msg)
            addMessage("<span class=\"selfMsg\">Self: </span>" + msg);
        } else {
            console.log('Connection is closed');
        }
    });

    function test() {
        console.log(conn)
    }

    initialize(isServer);
    if (!isServer) {
        setTimeout(join, 100)
    }
}