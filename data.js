const PType = {
    QUEEN: 0,
    KING: 1,
    ROOK: 2,
    KNIGHT: 3,
    BISHOP: 4,
    PAWN: 5
}

const PValues = {
    0: 9,
    2: 5,
    3: 3,
    4: 3,
    5: 1
}

const Color = {
    WHITE: 0,
    BLACK: 1
}

const Direction = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    DIAGONALRIGHT: 2,
    DIAGONALLEFT: 3
}

function Move(x1, y1, dx, dy, isCapture=false, captureType=undefined, enpassantable=false, isEnPassant=false, isCastleLong=false, isCastleShort=false, isPromotion=false, promoteTo=undefined) {
    this.x = x1
    this.y = y1
    this.dx = dx
    this.dy = dy
    this.isCapture = isCapture
    this.captureType = captureType
    this.enpassantable = enpassantable
    this.isEnPassant = isEnPassant
    this.isCastleLong = isCastleLong
    this.isCastleShort = isCastleShort
    this.isPromotion = isPromotion
    this.promoteTo = promoteTo
}

class Piece {
    constructor(type, x, y, color) {
        this.type = type
        this.x = x
        this.y = y
        this.color = color

        this.pinned = false
        this.hasMoved = false
    }
}

function calcTakenPieces(players) {
    var taken = []
    for (const player of players) {
        var starting = [5,5,5,5,5,5,5,5,3,3,4,4,2,2,1,0]
        for (const piece of player.pieces) {
            var ind = starting.indexOf(piece.type)
            if (ind > -1) {
                starting.splice(ind, 1)
            }
        }
        taken.push(starting)
    }
    return taken
}