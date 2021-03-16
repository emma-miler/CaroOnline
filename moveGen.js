function generateMoves(self, board, ignoreCheck=false) {
    plm = []
    if (self.type == PType.PAWN) {
        var capLeft = false
        var capRight = false
        if (self.pinned) {
            if (self.pinDirection == Direction.DIAGONALRIGHT) {
                capRight = true
            }
            if (self.pinDirection == Direction.DIAGONALLEFT) {
                capLeft = true
            }
        }
        calcPawn(self, plm, board, capLeft, capRight)
    }
    else if (self.type == PType.ROOK) {
        if (self.pinned && (self.pinDirection == Direction.DIAGONALLEFT || self.pinDirection == Direction.DIAGONALRIGHT)) {
            return plm
        }
        else {
            calcRook(self, plm, board)
        }
    }
    else if (self.type == PType.QUEEN) {
        calcBishop(self, plm, board)
        calcRook(self, plm, board)
    }
    else if (self.type == PType.BISHOP) {
        if (self.pinned && (self.pinDirection == Direction.HORIZONTAL || self.pinDirection == Direction.VERTICAL)) {
            return plm
        }
        else {
            calcBishop(self, plm, board)
        }
    }
    else if (self.type == PType.KNIGHT) {
        if (self.pinned) {
            return plm
        }
        else {
            calcKnight(self, plm, board)
        }
    }
    else if (self.type == PType.KING) {
        calcKing(self, plm, board)
    }

    if (!ignoreCheck && !self.type == PType.KING) {
        if (board.checks[board.turn.value]) {
            checkStop = []
            for (const move of plm) {
                x = move.x + move.dx
                y = move.y + move.dy
                for (const square of board.checkStopSquares) {
                    if (square[0] == x && square[1] == y) {
                        checkStop.push(move)
                    }
                }
                for (const checkingPiece of board.checkPieces) {
                    if (checkingPiece[0] == x && checkingPiece[1] == y) {
                        checkStop.push(move)
                    }
                }
            }
            return checkStop
        }
        else {
            return plm
        }
    }
    else {
        return plm
    }
}
// TODO: fix en passant
function calcPawn(self, plm, board, capLeft, capRight) {
    m = self.color == Color.WHITE ? 1 : -1

    // Captures
    if (self.x > 0) {
        if (board.grid[self.x - 1][self.y + m] != 0 && board.grid[self.x - 1][self.y + m].color != self.color) {
            if ((!self.pinned) || self.pinDirection == Direction.DIAGONALLEFT) {
                var move = new Move(self.x, self.y, -1, m)
                move.isCapture = true
                move.captureType = board.grid[self.x - 1][self.y + m].type
                plm.push(move)
            }
        }
    }
    if (self.x < 7) {
        if (board.grid[self.x + 1][self.y + m] != 0 && board.grid[self.x + 1][self.y + m].color != self.color) {
            if ((!self.pinned) || self.pinDirection == Direction.DIAGONALRIGHT) {
                plm.push(new Move(self.x, self.y, 1, m, isCapture=true, captureType=board.grid[self.x + 1][self.y + m].type))
            }
        }
    }

    if (board.grid[self.x][self.y + m] == 0) {
        if (self.y == (self.color == Color.WHITE ? 6 : 1)) {
            if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.QUEEN))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.KNIGHT))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.ROOK))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.BISHOP))
            }
        }
        else {
            console.log("testabf")
            console.log(self.pinned)
            if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
                console.log("test123123")
                plm.push(new Move(self.x, self.y, 0, m))
            }
        }
    }
    // First new Move 2 spaces
    if (!self.hasMoved && board.grid[self.x][self.y + m] == 0 && board.grid[self.x][self.y + 2*m] == 0 && self.y == (self.color == Color.WHITE ? 1 : 6)) {
        if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
            var move = new Move(self.x, self.y, 0, 2*m)
            move.enpassantable = true
            plm.push(move)
        }
    }
    // En Passant
    if (self.y == 4 && board.moveList[board.moveList.length - 1].enpassantable) {
        if (self.x == 0 && board.moveList[-board.moveList.length - 1].x == 1) {
            var move = new Move(self.x, self.y, 1, m)
            move.isEnPassant = true
            plm.push()
        }
        else if (self.x == 7 && board.moveList[board.moveList.length - 1].x == 6) {
            var move = new Move(self.x, self.y, -1, m)
            move.isEnPassant = true
            plm.push(move)
        }
        else if (board.moveList[board.moveList.length - 1].x == self.x + 1) {
            var move = new Move(self.x, self.y, 1, m)
            move.isEnPassant = true
            plm.push(move)
        }
        else if (board.moveList[board.moveList.length - 1].x == self.x - 1) {
            var move = new Move(self.x, self.y, -1, m)
            move.isEnPassant = true
            plm.push(move)
        }
    }
}

function calcRook(self, plm, board) {
    var n = 7 - self.x
    var e = 7 - self.y
    var s = self.x
    var w = self.y

    var hor = true
    var ver = true
    if (self.pinned) {
        if (self.pinDirection == Direction.VERTICAL) {
            hor = false
        }
        else if (self.pinDirection == Direction.HORIZONTAL) {
            ver = false
        }
    }

    if (hor) {
        for (var x = 1; x < n + 1; x++) {
            if (board.grid[self.x + x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, x, 0))
            }
            else if (board.grid[self.x + x][self.y].color != self.color) {
                var move = new Move(self.x, self.y, x, 0)
                move.isCapture = true
                move.captureType = captureType=board.grid[self.x + x][self.y].type
                plm.push(move)
                break
            }
            else {
                break
            }
        }
        for (var x = 1; x < s + 1; x++) {
            if (board.grid[self.x - x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, -x, 0))
            }
            else if (board.grid[self.x - x][self.y].color != self.color) {
                var move = new Move(self.x, self.y, -x, 0)
                move.isCapture = true
                move.captureType=board.grid[self.x - x][self.y].type
                plm.push(move)
                break
            }
            else {
                break
            }
        }
    }
    if (ver) {
        for (var x = 1; x < e + 1; x++) {
            if (board.grid[self.x][self.y + x] == 0) {
                plm.push(new Move(self.x, self.y, 0, x))
            }
            else if (board.grid[self.x][self.y + x].color != self.color) {
                var move = new Move(self.x, self.y, 0, x)
                move.isCapture = true
                move.captureType=board.grid[self.x][self.y + x].type
                plm.push(move)
                break
            }
            else {
                break
            }
        }
        for (var x = 1; x < w + 1; x++) {
            if (board.grid[self.x][self.y - x] == 0) {
                plm.push(new Move(self.x, self.y, 0, -x))
            }
            else if (board.grid[self.x][self.y - x].color != self.color) {
                var move = new Move(self.x, self.y, 0, -x)
                move.captureType=board.grid[self.x][self.y - x].type
                plm.push(move)
                break
            }
            else {
                break
            }
        }
    }
}

function calcBishop(self, plm, board) {
    var right = true
    var left = true
    if (self.pinned) {
        if (self.pinDirection == Direction.DIAGONALRIGHT){
            left = false
        }
        else if (self.pinDirection == Direction.DIAGONALLEFT){
            right = false
        }
    }
    if (right) {
        for (var x = 1; x < 8; x++) {
            if (self.x + x <= 7 && self.y + x <= 7){
                if (board.grid[self.x + x][self.y + x] == 0){
                    plm.push(new Move(self.x, self.y, x, x))
                }
                else if (board.grid[self.x + x][self.y + x].color != self.color){
                    var mode = new Move(self.x, self.y, x, x)
                    move.isCapture = true
                    move.captureType=board.grid[self.x + x][self.y + x].type
                    plm.push(move)
                    break
                }
                else {
                    break
                }
            }
        }
        for (var x = 1; x < 8; x++) {
            if (self.x - x >= 0 && self.y - x >= 0){
                if (board.grid[self.x - x][self.y - x] == 0){
                    plm.push(new Move(self.x, self.y, -x, -x))
                }
                else if (board.grid[self.x - x][self.y - x].color != self.color){
                    var move = new Move(self.x, self.y, -x, -x)
                    move.isCapture = true
                    move.captureType=board.grid[self.x - x][self.y - x].type
                    plm.push(move)
                    break
                }
                else{
                    break
                }
            }
        }
    }
    if (left){
        for (var x = 1; x < 8; x++) {
            if (self.x - x >= 0 && self.y + x <= 7){
                if (board.grid[self.x - x][self.y + x] == 0){
                    plm.push(new Move(self.x, self.y, -x, x))
                }
                else if (board.grid[self.x - x][self.y + x].color != self.color){
                    var move = new Move(self.x, self.y, -x, x)
                    move.isCapture = true
                    move.captureType=board.grid[self.x - x][self.y + x].type
                    plm.push(move)
                    break
                }
                else{
                    break
                }
            }
        }
        for (var x = 1; x < 8; x++) {
            if (self.x + x <= 7 && self.y - x >= 0){
                if (board.grid[self.x + x][self.y - x] == 0){
                    plm.push(new Move(self.x, self.y, x, -x))
                }
                else if (board.grid[self.x + x][self.y - x].color != self.color){
                    var move = new Move(self.x, self.y, x, -x)
                    move.isCapture = true
                    move.captureType=board.grid[self.x + x][self.y - x].type
                    plm.push(move)
                    break
                }
                else{
                    break
                }
            }
        }
    }
}

function calcKnight(self, plm, board) {
    if (self.x > 1) {
        if (self.y + 1 <= 7 && (board.grid[self.x - 2][self.y + 1] == 0 || board.grid[self.x - 2][self.y + 1].color != self.color)){
            plm.push(new Move(self.x, self.y, -2, 1))
        }
        if (self.y - 1 >= 0 && (board.grid[self.x - 2][self.y - 1] == 0 || board.grid[self.x - 2][self.y - 1].color != self.color)) {
            plm.push(new Move(self.x, self.y, -2, -1))
        }
    }
    if (self.x > 0) {
        if (self.y + 2 <= 7 && (board.grid[self.x - 1][self.y + 2] == 0 || board.grid[self.x - 1][self.y + 2].color != self.color)) {
            plm.push(new Move(self.x, self.y, -1, 2))
        }
        if (self.y - 2 >= 0 && (board.grid[self.x - 1][self.y - 2] == 0 || board.grid[self.x - 1][self.y - 2].color != self.color)) {
            plm.push(new Move(self.x, self.y, -1, -2))
        }
    }
    if (self.x < 6) {
        if (self.y + 1 <= 7 && (board.grid[self.x + 2][self.y + 1] == 0 || board.grid[self.x + 2][self.y + 1].color != self.color)) {
            plm.push(new Move(self.x, self.y, 2, 1))
        }
        if (self.y - 1 >= 0 && (board.grid[self.x + 2][self.y - 1] == 0 || board.grid[self.x + 2][self.y - 1].color != self.color)) {
            plm.push(new Move(self.x, self.y, 2, -1))
        }
    }
    if (self.x < 7) {
        if (self.y + 2 <= 7 && (board.grid[self.x + 1][self.y + 2] == 0 || board.grid[self.x + 1][self.y + 2].color != self.color)) {
            plm.push(new Move(self.x, self.y, 1, 2))
        }
        if (self.y - 2 >= 0 && (board.grid[self.x + 1][self.y - 2] == 0 || board.grid[self.x + 1][self.y - 2].color != self.color)) {
            plm.push(new Move(self.x, self.y, 1, -2))
        }
    }
}

function calcKing(self, plm, board) {
    // TODO) { make sure king doesnt walk into check
    var top1 = [[-1, 1], [0,1], [1,1]]
    var mid = [[-1, 0], [1,0]]
    var bottom = [[-1, -1], [0, -1], [1, -1]]
    if (self.y == 7) {
        top1 = []
    }
    else if (self.y == 0) {
        bottom = []
    }
    if (self.x == 0) {
        top1 = top1.slice(1)
        mid = mid.slice(1)
        bottom = bottom.slice(1)
    }
    else if (self.x == 7) {
        top1 = top1.slice(0, -1)
        mid = mid.slice(0, -1)
        bottom = bottom.slice(0, -1)
    }
    local = []
    for (const item of top1) { local.push(item) }
    for (const item of mid) { local.push(item) }
    for (const item of bottom) { local.push(item) }
    for (const move of local) {
        // TODO: add captures as separate category
        if (board.grid[self.x + move[0]][self.y + move[1]] == 0 || board.grid[self.x + move[0]][self.y + move[1]].color != self.color) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
    }

    // Castling
    if (!self.hasMoved) {
        // White
        if (self.color == Color.WHITE) {
            // Short
            maybeRook = board.grid[7][0]
            if (typeof(maybeRook) != "number") {
                if (maybeRook.type == PType.ROOK && maybeRook.hasMoved == false && maybeRook.color == self.color) {
                    if (board.grid[5][0] == 0 && board.grid[6][0] == 0) {
                        var move = new Move(self.x, self.y, 2, 0)
                        move.isCastleShort = true
                        plm.push(move)
                    }
                }

                // Long
                maybeRook = board.grid[0][0]
                if (maybeRook.type == PType.ROOK && maybeRook.hasMoved == false && maybeRook.color == self.color) {
                    if (board.grid[1][0] == 0 && board.grid[2][0] == 0 && board.grid[3][0] == 0) {
                        var move = new Move(self.x, self.y, -2, 0)
                        move.isCastleLong = true
                        plm.push(move)
                    }
                }
            }
        }

        // Black
        else if (self.color == Color.BLACK) {
            // Short
            maybeRook = board.grid[7][7]
            if (typeof(maybeRook) != "number") {
                if (maybeRook.type == PType.ROOK && maybeRook.hasMoved == false && maybeRook.color == self.color) {
                    if (board.grid[5][7] == 0 && board.grid[6][7] == 0) {
                        var move = new Move(self.x, self.y, 2, 0)
                        move.isCastleShort = true
                        plm.push(move)
                    }
                }

                // Long
                maybeRook = board.grid[0][7]
                if (maybeRook.type == PType.ROOK && maybeRook.hasMoved == false && maybeRook.color == self.color) {
                    if (board.grid[1][7] == 0 && board.grid[2][7] == 0 && board.grid[3][7] == 0) {
                        var move = new Move(self.x, self.y, -2, 0)
                        move.isCastleLong = true
                        plm.push(move)
                    }
                }
            }
        }
    }
}