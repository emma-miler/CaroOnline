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