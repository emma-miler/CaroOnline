function print(arg) {console.log(arg)}

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


class Piece {
    constructor(type, x, y, color) {
        this.type = type
        this.x = x
        this.y = y
        this.color = color
    }
}

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
        this.pieces[0].color = Color.WHITE
        console.log(this.grid)
    }
}

class graphicsHandler {
    constructor(board) {
        this.canvas = document.getElementById("board")
        this.p = this.canvas.getContext("2d")
        this.board = board

        this.lightBrush = "#FFFFFF"
        this.darkBrush = "#1a2737"

        this.selected = 0

        this.image = document.getElementById("chesspieces")

        function lmbClick(event) {
            var xc = event.pageX - this.canvas.offsetLeft
            var yc = event.pageY - this.canvas.offsetTop
    
            var h = this.canvas.height
            var s = h/8
            
            var x = Math.floor(xc / s)
            var y = Math.floor(yc / s)
    
            print("Click: " + x + " " + y)
    
            print(event.button)

            if (this.selected == 0) {
                this.selected = this.board.grid[x][7 - y]
                print(this.selected)
            }
            this.draw()
        }

        function rmbClick(event) {
            this.selected = 0
            event.preventDefault()
            this.draw()
        }

        function test() {
            alert("123")
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

        for (const piece of this.board.pieces) {
            if (piece.x >= 0 && piece.y >= 0) {
                var source = renderSources[piece.type + 6*piece.color]
                this.p.drawImage(this.image, source[0], source[1], 150, 150, piece.x * s, (7-piece.y) * s, s, s)
            }
        }

        if (this.selected != 0) {
            for (const move of generateMoves(this.selected, this.board)) {
                print(move)
                x = move.x + move.dx
                y = move.y + move.dy
                print(x)
                this.p.beginPath()
                this.p.arc(s * x + s/2, (7 - y) * s + s/2, s/4, 0, 2 * Math.PI, false)
                this.p.fillStyle = "red"
                this.p.fill()
            }
        }

    }
}

window.onload = function() {

    player1 = new Player("Player 1", Color.WHITE)
    player2 = new Player("Player 2", Color.BLACK)

    board = new Board(player1, player2)
    gui = new graphicsHandler(board)
    gui.draw()
    print("test")

}