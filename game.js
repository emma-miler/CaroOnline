print = console.log

// TODO: implement some master signals for debugging

function d2b(dec){
    return (dec >>> 0).toString(2)
}


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

promotionSources = [
    [0.0, 0.0, 150.0, 150.0],
    [300.0, 0.0, 150.0, 150.0],
    [450.0, 0.0, 150.0, 150.0],
    [600.0, 0.0, 150.0, 150.0],
    [0.0, 150.0, 150.0, 150.0],
    [300.0, 150.0, 150.0, 150.0],
    [450.0, 150.0, 150.0, 150.0],
    [600.0, 150.0, 150.0, 150.0],
]

const typeMask =  0b00011100
const colorMask = 0b00000010

const CPPType = {
    QUEEN: 0,
    KING: 4,
    ROOK: 8,
    KNIGHT: 12,
    BISHOP: 16,
    PAWN: 20
};

function JSType(x) {
    switch (x) {
    case 0:
        return 0
    case 4:
        return 1
    case 8:
        return 2
    case 12:
        return 3
    case 16:
        return 4
    case 20:
        return 5
    }
}

class Player {
    constructor(name, color, pieces=undefined) {
        this.name = name
        this.color = color
        this.taken = []
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
                this.pieces = []
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
                this.pieces = []
            }
        }
        else {
            this.pieces = pieces
        }
    }
}

async function getResponse() {
    //var x = await fetch("caesar.wasm")
    //print(x)
    return "test"
}

class Board {
    constructor(player1, player2) {
        this.players = [player1, player2]
        this.pieces = player1.pieces.concat(player2.pieces) 
        this.setup()
        this.isOffline = true
        this.response = false
        this.init().then(print("LOADING COMPLETE"))
    }

    async init() {
        // MARK: init
        this.response = await fetch("caesar.wasm");
        this.file = await this.response.arrayBuffer();
        this.wasm = await WebAssembly.instantiate(this.file);
        const { memory, addMove, getMoveAmount, getData, getTest, getControlData, getBoardOffset, writeRow, generateMoves, performMove, promoteMove, calcControl, calcCheckDefenseSquares } = this.wasm.instance.exports;
        this.memory = memory
        this.addMove = addMove
        this.getMoveAmount = getMoveAmount
        this.getData = getData
        this.getControlData = getControlData
        this.getBoardOffset = getBoardOffset
        this.writeRow = writeRow
        this.WASMgenerateMoves = generateMoves
        this.WASMperformMove = performMove
        this.WASMpromoteMove = promoteMove
        this.calcControl = calcControl
        this.calcCheckDefenseSquares = calcCheckDefenseSquares
        this.getTest = getTest
        this.setup()
        this.updateBoard()
        gui.draw()
        this.readControl(1)
    }

    updateBoard() {
        var offset = this.getBoardOffset();
        var boardMemory = new Int32Array(this.memory.buffer, offset, 64);
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                this.grid[x][y] = boardMemory[y*8 + x]
            }
        }
    }

    readControl(color) {
        // MARK: control
        this.controlled[color] = []
        var moves = this.calcControl(color)
        var offset = this.getData();
        var linearMemory = new Int32Array(this.memory.buffer, offset, moves * 6);
        for (var i = 0; i < linearMemory.length / 6; i++) {
            var x = linearMemory[i * 6]
            var y = linearMemory[i * 6 + 1]
            var dx = linearMemory[i * 6 + 2]
            var dy = linearMemory[i * 6 + 3]
            var square = JSON.stringify([x + dx, y + dy])
            if (this.controlled[color].indexOf(square) == -1) {
                this.controlled[color].push(square)
            }
        }
        gui.draw()
    }

    calcCheckStop(color) {
        // MARK: control
        this.checkstop = []
        var moves = this.calcCheckDefenseSquares(color)
        var offset = this.getTest();
        if (moves > 0) {
            var linearMemory = new Int32Array(this.memory.buffer, offset, moves * 2);
            for (var i = 0; i < linearMemory.length / 2; i++) {
                var x = linearMemory[i * 2]
                var y = linearMemory[i * 2 + 1]
                //var square = JSON.stringify([x + dx, y + dy])
                //if (this.controlled[color].indexOf(square) == -1) {
                //    this.controlled[color].push(square)
                //}
                print(x + " " + y)
            }
            gui.draw()
        }
        else {
            print("NO MOVES!")
            print(moves)
        }
    }

    setup() {
        this.turn = Color.BLACK
        this.checks = [false, false]
        this.checkPieces = []
        this.pins = []
        this.checkStopSquares = [[],[]]
        this.controlled = [[], []]
        this.moves = [[], []]
        this.moveList = []
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
    }

    performMove1(move, fromOther=false) {
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

        if (!fromOther && !this.isOffline) {
            connection.send(JSON.stringify(move))
        }
        gui.draw()
    }

    performMove(move, fromOther=false) {
        // MARK: perfMove
        print("TEST123")
        print(move)
        var special = (move.isCastleShort || move.isCastleLong || move.isEnPassant)
        var taken = this.WASMperformMove(move.x, move.y, move.x+move.dx, move.y+move.dy, special)
        print("Taken piece: " + taken)
        this.tickTurn()
        this.updateBoard()
        gui.draw()
    }

    promoteMove(move, fromOther=false) {
        // MARK: promMove
        print("Promotion")
        print(move)
        var taken = this.WASMpromoteMove(move.x, move.y, move.x+move.dx, move.y+move.dy, move.promoteTo)
        print("Taken piece: " + taken)
        this.updateBoard()
        gui.draw()
    }

    tickTurn() {
        this.turn = Color[Object.keys(Color)[this.turn + 1 < Object.keys(Color).length ? this.turn + 1 : 0]]
        this.pins[this.turn] = this.calcPins()
        this.controlled = [[], []]
        this.readControl(this.turn)
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
        for (var x = 0; x < this.players[piece.color].pieces.length; x++) {
            if (this.players[piece.color].pieces[x] == piece) {
                y = x
            }
        }
        if (typeof(y) == "number") {
            this.players[piece.color].pieces.splice(y, 1)
        }
        this.players[piece.color == 0 ? 1 : 0].taken.push(piece.type)
        print(this.players)
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
    
    generateMoves(px, py) {
        // MARK : genMoves
        this.WASMgenerateMoves(px, py, true)
        const moves = this.getMoveAmount()
        //console.log("Moves: " + moves)

        var offset = this.getData();
        //console.log(offset)

        var linearMemory = new Int32Array(this.memory.buffer, offset, moves * 6);
        var testMoves = []
        for (var i = 0; i < linearMemory.length / 6; i++) {
            var x = linearMemory[i * 6]
            var y = linearMemory[i * 6 + 1]
            var dx = linearMemory[i * 6 + 2]
            var dy = linearMemory[i * 6 + 3]
            var isCapture = linearMemory[i * 6 + 4]
            var specialFlag = linearMemory[i * 6 + 5]
            var promotion = false
            if (x == 0 && y == 0 && dx == 0 && dy == 0) {
                continue
            }
            if ((this.grid[y][x] & 0b10) > 1 == 0) {
                if ((this.grid[y][x] & typeMask) == CPPType.PAWN && y == 6) {
                    promotion = true
                }
            } 
            else if ((this.grid[y][x] & 0b10) > 1 == 1) {
                if ((this.grid[y][x] & typeMask) == CPPType.PAWN && y == 1) {
                    promotion = true
                }
            } 
            //print(promotion)
            var isCap = linearMemory[i * 6 + 4] ? true : false
            //print(x + " " + y + " " + dx + " " + dy)
            var move = new Move(x, y, dx, dy, isCap)
            if (specialFlag) {
                if ((board.grid[y][x] & typeMask) == CPPType.KING) {
                    if (dx == 2) {
                        move.isCastleShort = true
                    }
                    else if (dx == -2) {
                        move.isCastleLong = true
                    }
                }
            }
            move.isPromotion = promotion
            testMoves.push(move)
        }

        return testMoves
    }
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

class graphicsHandler {
    constructor(board) {
        this.canvas = document.getElementById("board")
        this.p = this.canvas.getContext("2d")
        this.board = board

        this.ranks = ["a", "b", "c", "d", "e", "f", "g", "h"]

        this.lightBrush = "#FFFFFF60"
        this.darkBrush = "#1a2737D0"

        this.selected = 0

        this.image = document.getElementById("chesspieces")

        this.timer = document.getElementById('stopwatch');

        this.boardScale = 0.9

        this.flipped = false

        this.promotionX = 0

        function moveTest(event) {
            this.draw()
            this.p.fillStyle = "red"
            var vo = ((1-this.boardScale)*window.innerHeight) / 2
            var xc = event.pageX
            var yc = event.pageY - vo
    
            var h = this.canvas.width
            var s = (h/8) * this.boardScale
            
            var x = Math.floor(xc / s)
            var y = Math.floor(yc / s)
            this.p.fillRect(x*s, y*s + vo, s, s)
            this.p.fillStyle = "green"
            this.p.fillRect(event.pageX, event.pageY, s/4, s/4)
        }

        function lmbClick(event) {
            // MARK: lmbClick
            var vo = ((1-this.boardScale)*window.innerHeight) / 2
            var xc = event.pageX
            var yc = event.pageY - vo
    
            var h = this.canvas.width
            var s = (h/8) * this.boardScale
            
            var x = Math.floor(xc / s)
            var y = Math.floor(yc / s)
    
            //print("Click: " + x + " " + y)
            //print(event.pageX + " " + event.pageY)
    
            //print(event.button)

            if (this.selected == 0) {
                if (this.flipped) {
                    if (board.grid[7-y][x] != 0) { this.selected = [y, 7 - x] }
                }
                else {
                    if (board.grid[7-y][x] != 0) { this.selected = [7 - y, x] }
                }
                print("Selected: " + d2b(this.selected))
            }
            else {
                var sx = this.selected[1]
                var sy = this.selected[0]
                var succes = false
                if (this.drawPromotionDialog) {
                    var color = (this.board.grid[sy][sx] & 0b10) > 1
                    if (color == 1) {y = 7-y;}
                    if (this.flipped) {y=7-y}
                    if (x == sx) {
                        var move = new Move(sx, sy, this.promotionX, color == 0 ? 1 : -1)
                        //this.board.performMove(move)
                        print("Y: " + y)
                        if (y == 0) {
                            move.promoteTo = CPPType.QUEEN
                            this.board.promoteMove(move)
                            this.drawPromotionDialog = false
                            this.selected = 0
                        }
                        else if (y == 1) {
                            move.promoteTo = CPPType.ROOK
                            this.board.promoteMove(move)
                            this.drawPromotionDialog = false
                            this.selected = 0
                        }
                        else if (y == 2) {
                            move.promoteTo = CPPType.KNIGHT
                            this.board.promoteMove(move)
                            this.drawPromotionDialog = false
                            this.selected = 0
                        }
                        else if (y == 3) {
                            move.promoteTo = CPPType.BISHOP
                            this.board.promoteMove(move)
                            this.drawPromotionDialog = false
                            this.selected = 0
                        }
                        this.board.updateBoard()
                        this.draw()

                    }
                }
                else {
                    // Generate moves and check if clicked square is legal
                    var attacks = this.board.calcPins()
                    for (const move of this.board.generateMoves(this.selected[1], this.selected[0])) {
                        if ((!this.flipped && x == sx + move.dx && 7-y == sy + move.dy) || (this.flipped && 7 - x == sx + move.dx && y == sy + move.dy)) {
                            if (move.isPromotion) {
                                this.drawPromotionDialog = true
                                this.promotionX = move.dx
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
            }
            this.draw()
        }

        function rmbClick(event) {
            this.selected = 0
            event.preventDefault()
            this.draw()
        }
    

        this.canvas.addEventListener("mousedown", lmbClick.bind(this), false)
        this.canvas.addEventListener("contextmenu", rmbClick.bind(this), false)

        //this.canvas.addEventListener("mousemove", moveTest.bind(this), false)

        window.addEventListener("resize", this.draw.bind(this), false)

    }

    draw() {
        // MARK: draw
        this.p = this.canvas.getContext("2d")
        let h = window.innerHeight
        this.canvas.height = h
        this.canvas.width = h
        var bh = h-((1-this.boardScale)*h)
        var s = bh/8
        var vo = ((1-this.boardScale)*h) / 2
        var o = 0
        var sp = 60 / s

        this.p.fillStyle = "rgba(40, 40, 40, 1)"
        //this.p.fillRect(0, 0, h, h)

        this.p.fillStyle = this.lightBrush;
        this.p.fillRect(0, vo, bh, bh)

        // Draw board
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 8; y++) {
                if (y % 2 == 0){ o = s; }
                else { o = 0; }
                this.p.fillStyle = this.darkBrush
                this.p.fillRect(s*2*x+o, s*y + vo, s, s)
            }
        }

        // Draw player info
        for (var x = 0; x < 8; x++) {
            this.p.font = (s * 0.25).toString() + "px Arial"
            this.p.fillStyle = x % 2 == 0 ? "white" : "black"
            var posY = this.p.measureText(this.ranks[x]).actualBoundingBoxDescent
            if (this.flipped) {
                this.p.fillText(this.ranks[7-x], s * x + s*0.05, this.canvas.height - posY/1.25 - s*0.05 - vo)
                this.p.fillText(x + 1, this.canvas.width - posY/1.25 - s*0.15 - 2*vo, s * x - s*0.25 + 0.5*s + vo)
            }
            else {
                this.p.fillText(this.ranks[x], s * x + s*0.05, this.canvas.height - posY/1.25 - s*0.05 - vo)
                this.p.fillText(8 - x, this.canvas.width - posY/1.25 - s*0.15 - 2*vo, s * x - s*0.25 + 0.5*s + vo)
            }
        }


        if (this.selected != 0) {
            this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            if (this.selected.color != Color.WHITE && !this.board.godMode) {
                this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            }
            if (this.flipped) {this.p.fillRect(s * (7-this.selected[1]), s * this.selected[0] + vo, s, s)}
            else {this.p.fillRect(s * this.selected[1], s * (7 - this.selected[0]) + vo, s, s)}
        }

        this.p.fillStyle = "rgba(255, 32, 32, 0.5)"
        for (const move of this.board.pins) {
            if (this.flipped) {this.p.fillRect(s * (7-move[0]), s * move[1] + vo, s+1, s+1)}
            else {this.p.fillRect(s * move[0], s * (7-move[1]) + vo, s+1, s+1)}
        }
        this.p.fillStyle = "rgba(200, 150, 64, 0.75)"
        for (const move of this.board.checkStopSquares[this.board.turn]) {
            if (this.flipped) {this.p.fillRect(s * (7-move[0]), s * move[1] + vo, s + 1, s + 1)}
            else {this.p.fillRect(s * move[0], s * (7 - move[1]) + vo, s + 1, s + 1)}
        }

        // Controlled Squares
        this.p.fillStyle = "rgba(255, 32, 32, 0.5)"
        for (const move of this.board.controlled[1]) {
            var square = JSON.parse(move)
            var x = square[0]
            var y = square[1]
            if (this.flipped) {this.p.fillRect(s * (7-x), s * y + vo, s+1, s+1)}
            else {this.p.fillRect(s * x, s * (7-y) + vo, s+1, s+1)}
        }
        this.p.fillStyle = "rgba(32, 255, 32, 0.5)"
        for (const move of this.board.controlled[0]) {
            var square = JSON.parse(move)
            var x = square[0]
            var y = square[1]
            if (this.flipped) {this.p.fillRect(s * (7-x), s * y + vo, s+1, s+1)}
            else {this.p.fillRect(s * x, s * (7-y) + vo, s+1, s+1)}
        }

        // Draw moves
        if (this.selected != 0) {
            this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            if (this.selected.color != Color.WHITE && !this.board.godMode) {
                this.p.fillStyle = "rgba(128, 0, 128, 0.5)"
            }
            for (const move of this.board.generateMoves(this.selected[1], this.selected[0])) {
                x = move.x + move.dx
                y = move.y + move.dy
                this.p.beginPath()
                if (this.flipped) {this.p.arc(s * (7-x) + s/2, y * s + s/2 + vo, s/4, 0, 2 * Math.PI, false)}
                else {this.p.arc(s * x + s/2, (7 - y) * s + s/2 + vo, s/4, 0, 2 * Math.PI, false)}
                this.p.fill()
            }
        }

        // Render pieces
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                if (this.board.grid[x][y] & 1) {
                    var source = renderSources[((this.board.grid[x][y] & typeMask) >> 2) + 6*((this.board.grid[x][y] & colorMask) >> 1)]
                    if (this.flipped) { this.p.drawImage(this.image, source[0], source[1], 150, 150, (7-y) * s, x * s + vo, s, s) }
                    else { this.p.drawImage(this.image, source[0], source[1], 150, 150, y * s, (7-x) * s + vo, s, s) }
                }
            }
        }
        //this.p.drawImage(this.image, source[0], source[1], 150, 150, piece.x * s, (7-piece.y) * s + vo, s, s)

        var adv = 0
        for(var i = 0; i < this.board.players[0].taken.length; i++) {
            adv += PValues[this.board.players[0].taken[i]];
        }
        for(var i = 0; i < this.board.players[1].taken.length; i++) {
            adv -= PValues[this.board.players[1].taken[i]];
        }

        // Draw player info
        if (this.flipped) {
            this.p.fillStyle = "black"
            var t = (1-this.boardScale) * h / 2.5
            this.p.fillRect(0, h-vo + t/4, t, t)
            this.p.fillStyle = "white"
            this.p.fillText("Player BLACK", t*1.25, h-vo + t)
            var so = this.p.measureText("Player BLACK").actualBoundingBoxRight
            for (var x = 0; x < this.board.players[1].taken.length; x++) {
                var piece = this.board.players[1].taken[x]
                var source = renderSources[piece]
                this.p.drawImage(this.image, source[0], source[1], 150, 150, so + 1.5*t + (t*0.75)*x, h-vo + t/4, t, t)
            }

            this.p.fillStyle = "white"
            var t = (1-this.boardScale) * h / 2.5
            this.p.fillRect(0, 0, t, t)
            this.p.fillStyle = "white"
            this.p.fillText("Player WHITE", t*1.25, vo - t/2.5)
            for (var x = 0; x < this.board.players[0].taken.length; x++) {
                var piece = this.board.players[0].taken[x]
                var source = renderSources[piece + 6]
                this.p.drawImage(this.image, source[0], source[1], 150, 150, so + 1.5*t + (t*0.75)*x, 0, t, t)
            }
            if (adv > 0) {
                this.p.fillText("+ " + adv.toString(), so + 1.75*t + (t*0.75)*this.board.players[0].taken.length, vo - t/2.5)
            }
            else if (adv < 0) {
                this.p.fillText(adv.toString().replace("-", "+ "), so + 1.75*t + (t*0.75)*this.board.players[1].taken.length, h-vo + t)
            }
        }
        else {
            this.p.fillStyle = "white"
            var t = (1-this.boardScale) * h / 2.5
            this.p.fillRect(0, h-vo + t/4, t, t)
            this.p.fillStyle = "white"
            this.p.fillText("Player WHITE", t*1.25, h-vo + t)
            var so = this.p.measureText("Player WHITE").actualBoundingBoxRight
            for (var x = 0; x < this.board.players[0].taken.length; x++) {
                var piece = this.board.players[0].taken[x]
                var source = renderSources[piece + 6]
                this.p.drawImage(this.image, source[0], source[1], 150, 150, so + 1.5*t + (t*0.75)*x, h-vo + t/6, t, t)
            }

            this.p.fillStyle = "black"
            var t = (1-this.boardScale) * h / 2.5
            this.p.fillRect(0, 0, t, t)
            this.p.fillStyle = "white"
            this.p.fillText("Player BLACK", t*1.25, vo - t/2.5)
            for (var x = 0; x < this.board.players[1].taken.length; x++) {
                var piece = this.board.players[1].taken[x]
                var source = renderSources[piece]
                this.p.drawImage(this.image, source[0], source[1], 150, 150, so + 1.5*t + (t*0.75)*x, 0, t, t)
            }

            if (adv > 0) {
                this.p.fillText("+ " + adv.toString(), so + 1.75*t + (t*0.75)*this.board.players[0].taken.length, h-vo + t)
            }
            else if (adv < 0) {
                this.p.fillText(adv.toString().replace("-", "+ "), so + 1.75*t + (t*0.75)*this.board.players[1].taken.length, vo - t/2.5)
            }
        }
        
        if (this.drawPromotionDialog) {
            //var pieceType = this.board.grid[this.selected[0]][this.selected[1]] & typeMask
//            if ((pieceType & typeMask) == CPPType.PAWN) {
                this.p.fillStyle = "rgba(0, 0, 0, 0.5)"
                this.p.fillRect(0, 0, h, h)
                this.p.fillStyle = "rgba(255, 255, 255, 0.5)"
                var x = this.selected[0]
                var y = this.selected[1]

                print(this.board.grid[x][y])
                if ((this.board.grid[x][y] & 0b10) > 1  == 0) {
                    if (this.flipped) {this.p.fillRect(s*(7-y), h - vo - 4*s, s, 4*s)}
                    else { this.p.fillRect(s*y, vo, s, 4*s) }
                    for (var z = 0; z < 4; z++) {
                        if (this.flipped) { this.p.drawImage(this.image, promotionSources[z][0], promotionSources[z][1], 150, 150, (7-y) * s, h - (z+1)*s - vo, 60 / sp, 60 / sp) }
                        else { this.p.drawImage(this.image, promotionSources[z][0], promotionSources[z][1], 150, 150, y * s, vo + z*s, 60 / sp, 60 / sp) }
                    }
                }
                else if ((this.board.grid[x][y] & 0b10) > 1  == 1) {
                    if (this.flipped) {this.p.fillRect(s*(7-y), vo, s, 4*s)}
                    else { this.p.fillRect(s*y, h - vo - 4*s, s, 4*s) }
                    for (var z = 0; z < 4; z++) {
                        if (this.flipped) { this.p.drawImage(this.image, promotionSources[z+4][0], promotionSources[z+4][1], 150, 150, y * s, vo + z*s, 60 / sp, 60 / sp) }
                        else { this.p.drawImage(this.image, promotionSources[z+4][0], promotionSources[z+4][1], 150, 150, y * s, h - (z+1)*s - vo, 60 / sp, 60 / sp) }
                    }
                }
//            }
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
    print("WINDOW LOAD COMPLETE")
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
        document.getElementById("createScreen").style["right"] = "0"
        document.getElementById("mainScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
    })

    backCreate = document.getElementById("backButtonServer")
    backCreate.addEventListener("click", function() {
        document.getElementById("serverScreen").style["right"] = "-100%"
        document.getElementById("mainScreen").style["right"] = "0"
        document.getElementById("box").style["pointer-events"] = "none"
        document.getElementById("boxMain").style["pointer-events"] = "auto"
    })

    createFinishButton = document.getElementById("createFinish")
    createFinishButton.addEventListener("click", function() {
        document.getElementById("serverScreen").style["right"] = "0%"
        document.getElementById("createScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
        connection = new Server(board)
        connection.init()
        console.log(connection)
    })

    backCreate = document.getElementById("backButtonCreate")
    backCreate.addEventListener("click", function() {
        document.getElementById("mainScreen").style["right"] = "0%"
        document.getElementById("createScreen").style["right"] = "-100%"
        document.getElementById("box").style["pointer-events"] = "none"
        document.getElementById("boxMain").style["pointer-events"] = "auto"
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
        document.getElementById("createScreen").style["right"] = "0"
        document.getElementById("mainScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
    })

    joinButton = document.getElementById("join")
    joinButton.addEventListener("click", function(){
        document.getElementById("clientScreen").style["right"] = "0"
        document.getElementById("mainScreen").style["right"] = "100%"
        document.getElementById("box").style["pointer-events"] = "auto"
        document.getElementById("boxMain").style["pointer-events"] = "none"
        connection = new Client(board)
        connection.init()
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
        setTimeout(function() {connection.join()}.bind(connection), 100)
        console.log(connection)
    })

    offlineButton = document.getElementById("offline")
    offlineButton.addEventListener("click", function() {
        document.getElementById("overlay").style["display"] = "none"
        board.isOffline = true
    })
    
    document.getElementById("overlay").style["display"] = "none"
    board.isOffline = true

    //runCppTest()
}

function runPerformanceTest1() {
    const timer = document.getElementById('stopwatch');
    var initTime = window.performance.now()
    var iter = 10000
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
        print(Object.keys(PType)[x] + ": " + (total/pieceTimers[x].length * 1000).toString().substring(0, 5))
    }
    var endTime = window.performance.now()
    timer.innerHTML = ((endTime - initTime)).toString().substring(0, 5)
    print("\n\n")
}