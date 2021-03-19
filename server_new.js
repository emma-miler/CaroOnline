class Server {
    constructor(board) {
        this.peer = undefined
        this.lastPeerId = 0
        this.recvId = 0
        this.conn = undefined
        this.sendMessageBox = document.getElementById("sendMessageBox")
        this.board = board
    }

    init() {
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', function (id) {
            // Workaround for this.peer.reconnect deleting previous id
            if (this.peer.id === null) {
                console.log('Received null id from this.peer open');
                this.peer.id = this.lastPeerId;
            } else {
                this.lastPeerId = this.peer.id;
            }

            console.log('ID: ' + this.peer.id);
            document.getElementById("idText").innerHTML = connection.peer.id
            //navigator.clipboard.writeText(this.peer.id)
            //this.recvId.innerHTML = "ID: " + this.peer.id;
            //status.innerHTML = "Awaiting this.connection...";
        }.bind(this));
        this.peer.on('connection', function (c) {
            // Allow only a single this.connection
            if (this.conn && this.conn.open) {
                c.on('open', function() {
                    c.send("Already this.connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }

            this.conn = c;
            console.log("Connected to: " + this.conn.peer);
            //status.innerHTML = "Connected";
            document.getElementById("overlay").style["display"] = "none"
            this.ready();
        }.bind(this));
        this.peer.on('disconnected', function () {
            status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');

            // Workaround for this.peer.reconnect deleting previous id
            this.peer.id = this.lastPeerId;
            this.peer._lastServerId = this.lastPeerId;
            this.peer.reconnect();
        }.bind(this));
        this.peer.on('close', function() {
            this.conn = null;
            console.log("Connection destroyed. Please refresh")
            console.log('Connection destroyed');
        }.bind(this));
        this.peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        }.bind(this));
    }
    ready() {
        this.conn.on('data', function (data) {
            console.log("Data recieved");
            var cueString = "<span class=\"cueMsg\">Cue: </span>";
            console.log("Received data: " + data)
            this.board.performMove(JSON.parse(data), true)
        }.bind(this));
        this.conn.on('close', function () {
            console.log("Connection reset<br>Awaiting connection...")
            this.conn = null;
        }.bind(this));
    }

    send(message) {
        if (this.conn && this.conn.open) {
            //var msg = sendMessageBox.value;
            //sendMessageBox.value = "";
            this.conn.send(message);
            console.log("Sent: " + message);
            //addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
        } else {
            console.log('Connection is closed');
        }
    }
    
}


class Client {
    constructor(board) {
        this.peer = undefined
        this.lastPeerId = 0
        this.recvId = 0
        this.recvIdInput = document.getElementById("client-id")
        this.sendMessageBox = document.getElementById("sendMessageBox")
        this.conn = undefined
        this.board = board
    }

    init() {
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', function (id) {
            // Workaround for this.peer.reconnect deleting previous id
            if (this.peer.id === null) {
                console.log('Received null id from this.peer open');
                this.peer.id = this.lastPeerId;
            } else {
                this.lastPeerId = this.peer.id;
            }

            console.log('ID: ' + this.peer.id);
        }.bind(this));
        this.peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function() {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() { c.close(); }, 500);
            });
        }.bind(this));
        this.peer.on('disconnected', function () {
            status.innerHTML = "Connection lost. Please reconnect";
            console.log('Connection lost. Please reconnect');

            // Workaround for this.peer.reconnect deleting previous id
            this.peer.id = this.lastPeerId;
            this.peer._lastServerId = this.lastPeerId;
            this.peer.reconnect();
        }.bind(this));
        this.peer.on('close', function() {
            conn = null;
            status.innerHTML = "Connection destroyed. Please refresh";
            console.log('Connection destroyed');
        }.bind(this));
        this.peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        }.bind(this));
    }
    ready() {
        this.conn.on('data', function (data) {
            console.log("Data recieved");
            var cueString = "<span class=\"cueMsg\">Cue: </span>";
            console.log("Received data: " + data)
        }.bind(this));
        this.conn.on('close', function () {
            status.innerHTML = "Connection reset<br>Awaiting connection...";
            this.conn = null;
        }.bind(this));
    }

    join() {
        // Close old connection
        if (this.conn) {
            this.conn.close();
        }

        // Create connection to destination peer specified in the input field
        this.conn = this.peer.connect(this.recvIdInput.value, {
            reliable: true
        });

        this.conn.on('open', function () {
            //status.innerHTML = "Connected to: " + this.conn.peer;
            console.log("Connected to: " + this.conn.peer);
            document.getElementById("overlay").style["display"] = "none"

            // Check URL params for comamnds that should be sent immediately
            //var command = getUrlParam("command");
            //if (command)
            //    this.conn.send(command);
        }.bind(this));
        // Handle incoming data (messages only since this is the signal sender)
        this.conn.on('data', function (data) {
            console.log("Received data: " + data)
            this.board.performMove(JSON.parse(data), true)
            //addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
        }.bind(this));
        this.conn.on('close', function () {
            console.log("Connection closed")
            //status.innerHTML = "Connection closed";
        }.bind(this));
    };

    send(message) {
        if (this.conn && this.conn.open) {
            //var msg = sendMessageBox.value;
            //sendMessageBox.value = "";
            this.conn.send(message);
            console.log("Sent: " + message);
            //addMessage("<span class=\"selfMsg\">Self: </span> " + msg);
        } else {
            console.log('Connection is closed');
        }
    }
}

window.onload1 = function() {

    connection = undefined;

    serverButton = document.getElementById("serverButton")
    serverButton.addEventListener("click", function() {
        connection = new Server()
        connection.init()
        console.log(connection)
    } )

    clientButton = document.getElementById("clientButton")
    clientButton.addEventListener("click", function() {
        connection = new Client()
        connection.init()
        setTimeout(function() {connection.join()}.bind(connection), 100)
        console.log(connection)
    } )
}