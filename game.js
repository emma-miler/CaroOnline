function print(arg) {console.log(arg)}

// TODO: set up a structure so that pins, moves, etc are only calculated once per move

renderSources = [
    [0.0, 0.0, 150.0, 150.0],
    [150.0, 0.0, 150.0, 150.0],
    [300.0, 0.0, 150.0, 150.0],
    [450.0, 0.0, 150.0, 150.0],
    [600.0, 0.0, 150.0, 150.0],
    [750.0, 0.0, 150.0, 150.0],
    [0.0, 150.0, 150.0, 150.0],
    [150.0, 150.0, 150.0, 150.0],
    [300.0, 150.0, 150.0, 150.0],
    [450.0, 150.0, 150.0, 150.0],
    [600.0, 150.0, 150.0, 150.0],
    [750.0, 150.0, 150.0, 150.0]
]


class Player {
    constructor(name, color, pieces=undefined) {
        this.name = name
        this.color = color
        if (pieces == undefined) {
            if (color == Color.WHITE) {
                this.pieces = [
                    new Piece(PType.PAWN, 0, 1, Color.WHITE),
                    new Piece(PType.PAWN, 1, 1, Color.WHITE),
                    new Piece(PType.PAWN, 2, 1, Color.WHITE),
                    new Piece(PType.PAWN, 3, 1, Color.WHITE),
                    new Piece(PType.PAWN, 4, 1, Color.WHITE),
                    new Piece(PType.PAWN, 5, 1, Color.WHITE),
                    new Piece(PType.PAWN, 6, 1, Color.WHITE),
                    new Piece(PType.PAWN, 7, 1, Color.WHITE),
                    new Piece(PType.ROOK, 0, 0, Color.WHITE),
                    new Piece(PType.KNIGHT, 1, 0, Color.WHITE),
                    new Piece(PType.BISHOP, 2, 0, Color.WHITE),
                    new Piece(PType.QUEEN, 3, 0, Color.WHITE),
                    new Piece(PType.KING, 4, 0, Color.WHITE),
                    new Piece(PType.BISHOP, 5, 0, Color.WHITE),
                    new Piece(PType.KNIGHT, 6, 0, Color.WHITE),
                    new Piece(PType.ROOK, 7, 0, Color.WHITE),
                ]
                this.pieces = [
                    new Piece(PType.ROOK, 0, 0, Color.WHITE),
                    new Piece(PType.KING, 4, 0, Color.WHITE),
                    new Piece(PType.ROOK, 7, 0, Color.WHITE),
                ]
            }
            else if (color == Color.BLACK) {
                this.pieces = [
                    new Piece(PType.PAWN, 0, 6, Color.BLACK),
                    new Piece(PType.PAWN, 1, 6, Color.BLACK),
                    new Piece(PType.PAWN, 2, 6, Color.BLACK),
                    new Piece(PType.PAWN, 3, 6, Color.BLACK),
                    new Piece(PType.PAWN, 4, 6, Color.BLACK),
                    new Piece(PType.PAWN, 5, 6, Color.BLACK),
                    new Piece(PType.PAWN, 6, 6, Color.BLACK),
                    new Piece(PType.PAWN, 7, 6, Color.BLACK),
                    new Piece(PType.ROOK, 0, 7, Color.BLACK),
                    new Piece(PType.KNIGHT, 1, 7, Color.BLACK),
                    new Piece(PType.BISHOP, 2, 7, Color.BLACK),
                    new Piece(PType.QUEEN, 3, 7, Color.BLACK),
                    new Piece(PType.KING, 4, 7, Color.BLACK),
                    new Piece(PType.BISHOP, 5, 7, Color.BLACK),
                    new Piece(PType.KNIGHT, 6, 7, Color.BLACK),
                    new Piece(PType.ROOK, 7, 7, Color.BLACK),
                ]
                this.pieces = [
                    new Piece(PType.QUEEN, 3, 7, Color.BLACK),
                ]
            }
        }
        else {
            this.pieces = pieces
        }
    }
}

class Board {
    constructor(player1, player2) {
        this.players = [player1, player2]
        this.pieces = player1.pieces.concat(player2.pieces) 
        this.setup()
    }

    setup() {
        this.turn = Color.BLACK
        this.updateBoard()
        this.checks = [false, false]
        this.checkPieces = []
        this.pins = []
        this.checkStopSquares = [[],[]]
        this.controlled = [[], []]
        this.moves = [[], []]
        this.moveList = []
        this.tickTurn()
    }

    updateBoard() {
        this.grid = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
        ]
        for (const piece of this.pieces) {
            this.grid[piece.x][piece.y] = piece
        }
    }

    performMove(move, fromOther=false) {
        print("PERFORMMOVE")
        var piece = this.grid[move.x][move.y]
        var newSquare = this.grid[move.x + move.dx][move.y + move.dy]
        if ( move.isPromotion) {
            piece.type = move.promoteTo
        }
        if ( newSquare != 0) {
            this.removePiece([newSquare.x, newSquare.y])
        }
        if ( move.isEnPassant) {
            this.removePiece([move.x + move.dx, move.y + move.dy - (this.turn == Color.WHITE ? 1:-1)])
        }
        if ( move.isCastleShort) {
            if ( piece.color == Color.WHITE) {
                this.grid[7][0].x = 5
            }
            else if ( piece.color == Color.BLACK) {
                this.grid[7][7].x = 5
            }
        }
        if ( move.isCastleLong) {
            if ( piece.color == Color.WHITE) {
                this.grid[0][0].x = 3
            }
            else if ( piece.color == Color.BLACK) {
                this.grid[0][7].x = 3
            }
        }
        piece.x = move.x + move.dx
        piece.y = move.y + move.dy
        piece.hasMoved = true
        this.moveList.push(move)
        this.updateBoard()
        this.tickTurn()

        if (!fromOther) {
            connection.send(JSON.stringify(move))
        }
        gui.draw()
    }

    tickTurn() {
        this.turn = Color[Object.keys(Color)[this.turn + 1 < Object.keys(Color).length ? this.turn + 1 : 0]]
        this.pins[this.turn] = this.calcPins()
        this.controlled = [[], []]
        this.controlled[0] = calcControl(Color.WHITE, this)
        this.controlled[1] = calcControl(Color.BLACK, this)
        this.checkStopSquares[this.turn] = calcCheckDefenseSquares(this)
    }

    removePiece(p) {
        var piece = this.grid[p[0]][p[1]]
        var y = undefined
        for (var x = 0; x < this.pieces.length; x++) {
            if (this.pieces[x] == piece) {
                y = x
            }
        }
        if (typeof(y) == "number") {
            this.pieces.splice(y, 1)
        }
        this.updateBoard()
    }

    calcPins() {
        var attacks = []
        for (const piece of this.pieces) {
            piece.pinned = false
        }
        for (const piece of this.pieces) {
            if (piece.color == Color.WHITE && piece.type == PType.KING) {
                calcRookPin(piece, attacks, this)
                calcBishopPin(piece, attacks, this)
            }
        }
        return attacks
    }
}

class graphicsHandler {
    constructor(board) {
        this.canvas = document.getElementById("board")
        this.p = this.canvas.getContext("2d")
        this.board = board

        this.ranks = ["a", "b", "c", "d", "e", "f", "g", "h"]

        this.lightBrush = "#FFFFFF"
        this.darkBrush = "#1a2737"

        this.selected = 0

        this.image = document.getElementById("chesspieces")

        this.timer = document.getElementById('stopwatch');

        this.flipped = false

        function lmbClick(event) {
            var xc = event.pageX + this.canvas.offsetLeft/2
            var yc = event.pageY + this.canvas.offsetTop/2
    
            var h = this.canvas.width
            var s = h/8
            
            var x = Math.floor(xc / s)
            var y = Math.floor(yc / s)
    
            print("Click: " + x + " " + y)
    
            print(event.button)

            if (this.selected == 0) {
                if (this.flipped) {this.selected = this.board.grid[7-x][y]}
                else { this.selected = this.board.grid[x][7 - y] }
                print(this.selected)
            }
            else {
                var sx = this.selected.x
                var sy = this.selected.y
                var succes = false
                // Generate moves and check if clicked square is legal
                var attacks = this.board.calcPins()
                for (const move of generateMoves(this.selected, this.board)) {
                    if ((!this.flipped && x == sx + move.dx && 7 - y == sy + move.dy) || (this.flipped && 7 - x == sx + move.dx && y == sy + move.dy)) {
                        if (move.isPromotion) {
                            this.drawPromotionDialog = true
                        }
                        else {
                            this.board.performMove(move)
                            this.selected = 0
                        }
                        succes = true
                        break
                    }
                }
                if (!succes) {
                    this.selected = this.board.grid[x][7 - y]
                    if (this.selected != 0 && this.selected.color != this.board.turn) {
                        this.selected = 0
                    }
                }
            }
            this.draw()
        }

        function rmbClick(event) {
            this.selected = 0
            event.preventDefault()
            this.draw()
        }
    

        this.canvas.addEventListener("click", lmbClick.bind(this), false)
        this.canvas.addEventListener("contextmenu", rmbClick.bind(this), false)
        window.addEventListener("resize", this.draw.bind(this), false)

    }

    draw() {
        this.p = this.canvas.getContext("2d")
        let h = window.innerHeight
        this.canvas.height = h
        this.canvas.width = h
        var s = h/8
        var o = 0
        var sp = 60 / s

        this.p.fillStyle = this.lightBrush;
        this.p.fillRect(0, 0, h, h)
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 8; y++) {
                if (y % 2 == 0){ o = s; }
                else { o = 0; }
                this.p.fillStyle = this.darkBrush
                this.p.fillRect(s*2*x+o, s*y, s, s)
            }
        }
        for (var x = 0; x < 8; x++) {
            this.p.font = (s * 0.25).toString() + "px Arial"
            this.p.fillStyle = x % 2 == 0 ? "white" : "black"
            var posY = this.p.measureText(this.ranks[x]).actualBoundingBoxDescent
            if (this.flipped) {
                this.p.fillText(this.ranks[7-x], s * x + s*0.05, this.canvas.height - posY/1.25 - s*0.05)
                this.p.fillText(x + 1, this.canvas.width - posY/1.25 - s*0.15, s * x - s*0.25 + 0.5*s)
            }
            else {
                this.p.fillText(this.ranks[x], s * x + s*0.05, this.canvas.height - posY/1.25 - s*0.05)
                this.p.fillText(8 - x, this.canvas.width - posY/1.25 - s*0.15, s * x - s*0.25 + 0.5*s)
            }
        }


        if (this.selected != 0) {
            this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            if (this.selected.color != Color.WHITE && !this.board.godMode) {
                this.p.fillStyle = "rgba(255, 16, 16, 0.5)"
            }
            if (this.flipped) {this.p.fillRect(s * (7-this.selected.x), s * this.selected.y, s, s)}
            else {this.p.fillRect(s * this.selected.x, s * (7 - this.selected.y), s, s)}
        }

        for (const piece of this.board.pieces) {
            if (piece.x >= 0 && piece.y >= 0) {
                var source = renderSources[piece.type + 6*piece.color]
                if (this.flipped) {this.p.drawImage(this.image, source[0], source[1], 150, 150, (7-piece.x) * s, piece.y * s, s, s)}
                else {this.p.drawImage(this.image, source[0], source[1], 150, 150, piece.x * s, (7-piece.y) * s, s, s)}
            }
        }

        this.p.fillStyle = "rgba(255, 32, 32, 0.5)"
        for (const move of this.board.pins) {
            if (this.flipped) {this.p.fillRect(s * (7-move[0]), s * move[1], s+1, s+1)}
            else {this.p.fillRect(s * move[0], s * (7-move[1]), s+1, s+1)}
        }
        this.p.fillStyle = "rgba(200, 150, 64, 0.75)"
        for (const move of this.board.checkStopSquares[this.board.turn]) {
            if (this.flipped) {this.p.fillRect(s * (7-move[0]), s * move[1], s + 1, s + 1)}
            else {this.p.fillRect(s * move[0], s * (7 - move[1]), s + 1, s + 1)}
        }

        //var white = calcControl(Color.WHITE, this.board)
        //var black = calcControl(Color.BLACK, this.board)
        //this.board.controlled = [white, black]
        this.p.fillStyle = "rgba(255, 32, 32, 0.5)"
        for (const move of this.board.controlled[board.turn == 0 ? 1 : 0]) {
            var x = move.x + move.dx
            var y = move.y + move.dy
            if (this.flipped) {this.p.fillRect(s * (7-x), s * y, s+1, s+1)}
            else {this.p.fillRect(s * x, s * (7-y), s+1, s+1)}
        }

        if (this.selected != 0) {
            this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            if (this.selected.color != Color.WHITE && !this.board.godMode) {
                this.p.fillStyle = "rgba(255, 16, 16, 0.5)"
            }
            for (const move of generateMoves(this.selected, this.board)) {
                x = move.x + move.dx
                y = move.y + move.dy
                this.p.beginPath()
                if (this.flipped) {this.p.arc(s * (7-x) + s/2, y * s + s/2, s/4, 0, 2 * Math.PI, false)}
                else {this.p.arc(s * x + s/2, (7 - y) * s + s/2, s/4, 0, 2 * Math.PI, false)}
                this.p.fill()
            }
        }

    }
}

function masterToggle() {
    board.godMode = masterSwitch.checked
    gui.draw()
}

function flipBoardButton() {
    gui.flipped = flipSwitch.checked
    gui.draw()
}

window.onload = function() {

    masterSwitch = document.getElementById("masterSwitch")
    masterSwitch.addEventListener("click", masterToggle)

    flipSwitch = document.getElementById("flipSwitch")
    flipSwitch.addEventListener("click", flipBoardButton)

    player1 = new Player("Player 1", Color.WHITE)
    player2 = new Player("Player 2", Color.BLACK)

    board = new Board(player1, player2)
    gui = new graphicsHandler(board)
    gui.draw()
    print("LOAD COMPLETE")
    connection = undefined

    /*sendMessage = document.getElementById("send");
    recvMessage = document.getElementById("recv");
    recvMessage.addEventListener("click", function() {
        var message = recvMessage.getAttribute("value")
        print(JSON.parse(message))
        print("COUNTER::::::" + counter)
        counter++
        board.performMove(JSON.parse(message), fromOther=true)
        gui.draw()
    } )
    game = document.getElementById("connected");*/

    createButton = document.getElementById("create")
    createButton.addEventListener("click", function() {
        document.getElementById("serverScreen").style["right"] = "0"
        document.getElementById("mainScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
        connection = new Server(board)
        connection.init()
        console.log(connection)
    })

    copyButton = document.getElementById("copy")
    copyButton.addEventListener("click", function() {
        navigator.clipboard.writeText(document.getElementById("idText").innerHTML)
    })

    backServer = document.getElementById("backButtonServer")
    backServer.addEventListener("click", function() {
        document.getElementById("serverScreen").style["right"] = "-100%"
        document.getElementById("mainScreen").style["right"] = "0"
        document.getElementById("box").style["pointer-events"] = "none"
        document.getElementById("boxMain").style["pointer-events"] = "auto"
    })

    joinButton = document.getElementById("join")
    joinButton.addEventListener("click", function(){
        document.getElementById("clientScreen").style["right"] = "0"
        document.getElementById("mainScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
    })
    backJoin = document.getElementById("backButtonJoin")
    backJoin.addEventListener("click", function() {
        document.getElementById("clientScreen").style["right"] = "-100%"
        document.getElementById("mainScreen").style["right"] = "0"
        document.getElementById("box").style["pointer-events"] = "none"
        document.getElementById("boxMain").style["pointer-events"] = "auto"
    })

    connectButton = document.getElementById("connect")
    connectButton.addEventListener("click", function() {
        connection = new Client(board)
        connection.init()
        setTimeout(function() {connection.join()}.bind(connection), 100)
        console.log(connection)
    })

}

function runPerformanceTest() {
    const timer = document.getElementById('stopwatch');
    var iter = 100
    print("\n\n")
    pieceTimers = [[0],[],[],[],[],[],[],[]]
    for (const piece of board.pieces) {
        var times = []
        for (var x = 0; x < iter; x++) {
            var startTime = window.performance.now()
            moves = generateMoves(piece, board)
            var endTime = window.performance.now()
            times.push(endTime - startTime)
        }
        var total = 0
        for(var i = 0; i < times.length; i++) {
            total += times[i];
        }
        pieceTimers[piece.type].push(total/times.length)
    }
    for (var x = 0; x < pieceTimers.length; x++) {
        var total = 0
        for(var i = 0; i < pieceTimers[x].length; i++) {
            total += pieceTimers[x][i];
        }
        print(Object.keys(PType)[x] + ": " + (total/pieceTimers[x].length).toString().substring(0, 5))
    }
    var endTime = window.performance.now()
    timer.innerHTML = ((endTime - startTime)).toString().substring(0, 5)
    print("\n\n")
}