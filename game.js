const PType = {
    QUEEN: 0,
    KING: 1,
    ROOK: 2,
    KNIGHT: 3,
    BISHOP: 4,
    PAWN: 5
}

const Color = {
    WHITE: 0,
    BLACK: 1
}

class Piece {
    constructor(type, x, y, color) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Board {
    constructor() {
        this.setup()
    }

    setup() {
        this.board = [
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
            ['','','','','','','',''],
        ]
        this.pieces = [
            new Piece(PType.QUEEN, 5, 5, Color.WHITE)
        ]
        for (const piece of this.pieces) {
            this.board[piece.x][piece.y] = piece
        }
        this.pieces[0].color = Color.BLACK
        console.log(this.board)
    }
}

board = new Board()