function generateMoves1(self, board, ignoreCheck=false, control=false) {
    plm = []
    if (self.type == PType.PAWN) {
        var capLeft = true
        var capRight = true
        if (self.pinned) {
            if (self.pinDirection == Direction.DIAGONALRIGHT) {
                capRight = false
            }
            if (self.pinDirection == Direction.DIAGONALLEFT) {
                capLeft = false
            }
        }
        calcPawn(self, plm, board, capLeft, capRight, control)
    }
    else if (self.type == PType.ROOK) {
        if (self.pinned && (self.pinDirection == Direction.DIAGONALLEFT || self.pinDirection == Direction.DIAGONALRIGHT)) {
            return plm
        }
        else {
            calcRook(self, plm, board, control)
        }
    }
    else if (self.type == PType.QUEEN) {
        calcBishop(self, plm, board, control)
        calcRook(self, plm, board, control)
    }
    else if (self.type == PType.BISHOP) {
        if (self.pinned && (self.pinDirection == Direction.HORIZONTAL || self.pinDirection == Direction.VERTICAL)) {
            return plm
        }
        else {
            calcBishop(self, plm, board, control)
        }
    }
    else if (self.type == PType.KNIGHT) {
        if (self.pinned) {
            return plm
        }
        else {
            calcKnight(self, plm, board, control)
        }
    }
    else if (self.type == PType.KING) {
        var notChecked = []
        calcKing(self, notChecked, board)
        for (const move of notChecked) {
            var x = move.x + move.dx
            var y = move.y + move.dy
            var check = false
            if (true) {
            for (const controlled of board.controlled[board.turn == 0 ? 1 : 0]) {
                if (x == controlled.x + controlled.dx && y == controlled.y + controlled.dy) {
                    check = true
                    break
                } 
            }
            if (!check && move.isCastleShort) {
                for (const controlled of board.controlled[board.turn == 0 ? 1 : 0]) {
                    if (x-1 == controlled.x + controlled.dx && y == controlled.y + controlled.dy) {
                        check = true
                        break
                    } 
                }
            }
            if (!check && move.isCastleLong) {
                for (const controlled of board.controlled[board.turn == 0 ? 1 : 0]) {
                    if (x+1 == controlled.x + controlled.dx && y == controlled.y + controlled.dy) {
                        check = true
                        break
                    } 
                }
            }

            if (!check) {
                plm.push(move)
            }
        }
        }
    }
    if (!ignoreCheck && !(self.type == PType.KING)) {
        if (board.checks[board.turn]) {
            var checkStop = []
            for (const move of plm) {
                var x = move.x + move.dx
                var y = move.y + move.dy
                for (const square of board.checkStopSquares) {
                    if (square[0] == x && square[1] == y) {
                        checkStop.push(move)
                    }
                }
                for (const checkingPiece of board.checkPieces) {
                    if (checkingPiece.x == x && checkingPiece == y) {
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
// TODO: promotion
function calcPawn(self, plm, board, capleft, capright, control=false) {
    m = self.color == Color.WHITE ? 1 : -1

    // Captures
    if (self.x > 0) {
        if ((board.grid[self.x - 1][self.y + m] != 0 && board.grid[self.x - 1][self.y + m].color != self.color && capleft || control) && capleft) {
            if ((!self.pinned) || self.pinDirection == Direction.DIAGONALLEFT) {
                var move = new Move(self.x, self.y, -1, m)
                move.isCapture = true
                move.captureType = board.grid[self.x - 1][self.y + m].type
                plm.push(move)
            }
        }
    }
    if (self.x < 7) {
        if ((board.grid[self.x + 1][self.y + m] != 0 && board.grid[self.x + 1][self.y + m].color != self.color || control) && capright) {
            if ((!self.pinned) || self.pinDirection == Direction.DIAGONALRIGHT) {
                var move = new Move(self.x, self.y, 1, m)
                move.isCapture = true
                move.captureType = captureType=board.grid[self.x + 1][self.y + m].type
                plm.push(move)
            }
        }
    }
    if (board.grid[self.x][self.y + m] == 0 && !control) {
        if (self.y == (self.color == Color.WHITE ? 6 : 1)) {
            if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.QUEEN))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.KNIGHT))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.ROOK))
                plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.BISHOP))
            }
        }
        else {
            if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
                plm.push(new Move(self.x, self.y, 0, m))
            }
        }
    }
    // First new Move 2 spaces
    if (!self.hasMoved && board.grid[self.x][self.y + m] == 0 && board.grid[self.x][self.y + 2*m] == 0 && self.y == (self.color == Color.WHITE ? 1 : 6) && !control) {
        if ((!self.pinned) || self.pinDirection == Direction.VERTICAL) {
            var move = new Move(self.x, self.y, 0, 2*m)
            move.enpassantable = true
            plm.push(move)
        }
    }
    // En Passant
    if (self.y == 4 && board.moveList.length > 0 && board.moveList[board.moveList.length - 1].enpassantable && !control) {
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

function calcRook(self, plm, board, skipSquare=0, control=false) {
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
            if (skipSquare != 0) {
                if (self.x + x == skipSquare[0] && self.y == skipSquare[1]) {
                    continue
                }
            }
            if (board.grid[self.x + x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, x, 0))
            }
            else if (board.grid[self.x + x][self.y].color != self.color || control) {
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
            if (skipSquare != 0) {
                if (self.x - x == skipSquare[0] && self.y == skipSquare[1]) {
                    continue
                }
            }
            if (board.grid[self.x - x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, -x, 0))
            }
            else if (board.grid[self.x - x][self.y].color != self.color || control) {
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
            if (skipSquare != 0) {
                if (self.x == skipSquare[0] && self.y + x == skipSquare[1]) {
                    continue
                }
            }
            if (board.grid[self.x][self.y + x] == 0) {
                plm.push(new Move(self.x, self.y, 0, x))
            }
            else if (board.grid[self.x][self.y + x].color != self.color || control) {
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
            if (skipSquare != 0) {
                if (self.x == skipSquare[0] && self.y - x == skipSquare[1]) {
                    continue
                }
            }
            if (board.grid[self.x][self.y - x] == 0) {
                plm.push(new Move(self.x, self.y, 0, -x))
            }
            else if (board.grid[self.x][self.y - x].color != self.color || control) {
                var move = new Move(self.x, self.y, 0, -x)
                move.isCapture = true
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

function calcBishop(self, plm, board, skipSquare=0, control=false) {
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
            if (skipSquare != 0) {
                if (self.x + x == skipSquare[0] && self.y + x == skipSquare[1]) {
                    continue
                }
            }
            if (self.x + x <= 7 && self.y + x <= 7){
                if (board.grid[self.x + x][self.y + x] == 0){
                    plm.push(new Move(self.x, self.y, x, x))
                }
                else if (board.grid[self.x + x][self.y + x].color != self.color || control){
                    var move = new Move(self.x, self.y, x, x)
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
            if (skipSquare != 0) {
                if (self.x - x == skipSquare[0] && self.y - x == skipSquare[1]) {
                    continue
                }
            }
            if (self.x - x >= 0 && self.y - x >= 0){
                if (board.grid[self.x - x][self.y - x] == 0){
                    plm.push(new Move(self.x, self.y, -x, -x))
                }
                else if (board.grid[self.x - x][self.y - x].color != self.color || control){
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
            if (skipSquare != 0) {
                if (self.x - x == skipSquare[0] && self.y + x == skipSquare[1]) {
                    continue
                }
            }
            if (self.x - x >= 0 && self.y + x <= 7){
                if (board.grid[self.x - x][self.y + x] == 0){
                    plm.push(new Move(self.x, self.y, -x, x))
                }
                else if (board.grid[self.x - x][self.y + x].color != self.color || control){
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
            if (skipSquare != 0) {
                if (self.x + x == skipSquare[0] && self.y - x == skipSquare[1]) {
                    continue
                }
            }
            if (self.x + x <= 7 && self.y - x >= 0){
                if (board.grid[self.x + x][self.y - x] == 0){
                    plm.push(new Move(self.x, self.y, x, -x))
                }
                else if (board.grid[self.x + x][self.y - x].color != self.color || control){
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

function calcKnight(self, plm, board, control=false) {
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

function calcKing(self, plm, board, control=false) {
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
    //const local = top1.concat(mid).concat(bottom)
    for (const move of top1) {
        // TODO: add captures as separate category
        if (board.grid[self.x + move[0]][self.y + move[1]] == 0) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
        else if (board.grid[self.x + move[0]][self.y + move[1]].color != self.color) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
    }
    for (const move of mid) {
        // TODO: add captures as separate category
        if (board.grid[self.x + move[0]][self.y + move[1]] == 0) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
        else if (board.grid[self.x + move[0]][self.y + move[1]].color != self.color) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
    }
    for (const move of bottom) {
        // TODO: add captures as separate category
        if (board.grid[self.x + move[0]][self.y + move[1]] == 0 || board.grid[self.x + move[0]][self.y + move[1]].color != self.color) {
            plm.push(new Move(self.x, self.y, move[0], move[1]))
        }
    }

    // Castling
    if (!self.hasMoved && !board.checks[self.color] && false) {
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

function calcRookPin(self, pinnedSquares, board) {
    var n = 7 - self.x
    var e = 7 - self.y
    var s = self.x
    var w = self.y
    for (var x = 1; x<n+1; x++) {
        if (board.grid[self.x + x][self.y] != 0 && board.grid[self.x + x][self.y].color != self.color && (board.grid[self.x + x][self.y].type == PType.QUEEN||board.grid[self.x + x][self.y].type == PType.ROOK)) {
            var counter = 0
            var temp = []
            for (var z = 1; z < x; z++) {
                if (board.grid[self.x + z][self.y] != 0) {
                    counter += 1
                    if (board.grid[self.x + z][self.y].color == self.color) {
                        temp.push(board.grid[self.x + z][self.y])
                    }
                }
            }
            if (counter == 1 && temp.length > 0) {
                temp[0].pinned = true
                temp[0].pinDirection = Direction.HORIZONTAL
                pinnedSquares.push([temp[0].x, temp[0].y])
            }
        }
    }
    for (var x = 1; x<s+1; x++) {
        if (board.grid[self.x - x][self.y] != 0 && board.grid[self.x - x][self.y].color != self.color && (board.grid[self.x - x][self.y].type == PType.QUEEN||board.grid[self.x - x][self.y].type == PType.ROOK)) {
            var counter = 0
            var temp = []
            for (var z = 1; z < x; z++) {
                if (board.grid[self.x - z][self.y] != 0) {
                    counter += 1
                    if (board.grid[self.x - z][self.y].color == self.color) {
                        temp.push(board.grid[self.x - z][self.y])
                    }
                }
            }
            if (counter == 1 && temp.length > 0) {
                temp[0].pinned = true
                temp[0].pinDirection = Direction.HORIZONTAL
                pinnedSquares.push([temp[0].x, temp[0].y])
            }
        }
    }

    for (var y = 1; y < e+1; y++) {
        if (board.grid[self.x][self.y + y] != 0 && board.grid[self.x][self.y + y].color != self.color && (board.grid[self.x][self.y + y].type == PType.QUEEN||board.grid[self.x][self.y + y].type == PType.ROOK)) {
            var counter = 0
            var temp = []
            for (var z = 1; z < y; z++) {
                if (board.grid[self.x][self.y + z] != 0) {
                    counter += 1
                    if (board.grid[self.x][self.y + z].color == self.color) {
                        temp.push(board.grid[self.x][self.y + z])
                    }
                }
            }
            if (counter == 1 && temp.length > 0) {
                temp[0].pinned = true
                temp[0].pinDirection = Direction.VERTICAL
                pinnedSquares.push([temp[0].x, temp[0].y])
            }
        }
    }

    for (var y = 1; y < w+1; y++) {
        if (board.grid[self.x][self.y - y] != 0 && board.grid[self.x][self.y - y].color != self.color && (board.grid[self.x][self.y - y].type == PType.QUEEN||board.grid[self.x][self.y - y].type == PType.ROOK)) {
            var counter = 0
            var temp = []
            for (var z = 1; z<y; z++) {
                if (board.grid[self.x][self.y - z] != 0) {
                    counter += 1
                    if (board.grid[self.x][self.y - z].color == self.color) {
                        temp.push(board.grid[self.x][self.y - z])
                    }
                }
            }
            if (counter == 1 && temp.length > 0) {
                temp[0].pinned = true
                temp[0].pinDirection = Direction.VERTICAL
                pinnedSquares.push([temp[0].x, temp[0].y])
            }
        }
    }
}

function calcBishopPin(self, pinnedSquares, board) {
    for (var x = 1; x<8; x++) {
        if (self.x + x <= 7 && self.y + x <= 7) {
            if (board.grid[self.x + x][self.y + x] != 0 && board.grid[self.x + x][self.y + x].color != self.color && (board.grid[self.x + x][self.y + x].type == PType.QUEEN || board.grid[self.x + x][self.y + x].type == PType.BISHOP)) {
                var counter = 0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x + z][self.y + z] != 0) {
                        counter += 1
                        if (board.grid[self.x + z][self.y + z].color == self.color) {
                            temp.push(board.grid[self.x + z][self.y + z])
                        }
                    }
                }
                if (counter == 1 && temp.length > 0) {
                    temp[0].pinned = true
                    temp[0].pinDirection = Direction.DIAGONALRIGHT
                    pinnedSquares.push([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x - x >= 0 && self.y - x >= 0) {
            if (board.grid[self.x - x][self.y - x] != 0 && board.grid[self.x - x][self.y - x].color != self.color && (board.grid[self.x - x][self.y - x].type == PType.QUEEN || board.grid[self.x - x][self.y - x].type == PType.BISHOP)) {
                var counter = 0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x - z][self.y - z] != 0) {
                        counter += 1
                        if (board.grid[self.x - z][self.y - z].color == self.color) {
                            temp.push(board.grid[self.x - z][self.y - z])
                        }
                    }
                }
                if (counter == 1 && temp.length > 0) {
                    temp[0].pinned = true
                    temp[0].pinDirection = Direction.DIAGONALRIGHT
                    pinnedSquares.push([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x - x >= 0 && self.y + x <= 7) {
            if (board.grid[self.x - x][self.y + x] != 0 && board.grid[self.x - x][self.y + x].color != self.color && (board.grid[self.x - x][self.y + x].type == PType.QUEEN || board.grid[self.x - x][self.y + x].type == PType.BISHOP)) {
                var counter = 0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x - z][self.y + z] != 0) {
                        counter += 1
                        if (board.grid[self.x - z][self.y + z].color == self.color) {
                            temp.push(board.grid[self.x - z][self.y + z])
                        }
                    }
                }
                if (counter == 1 && temp.length > 0) {
                    temp[0].pinned = true
                    temp[0].pinDirection = Direction.DIAGONALLEFT
                    pinnedSquares.push([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x + x <= 7 && self.y - x >= 0) {
            if (board.grid[self.x + x][self.y - x] != 0 && board.grid[self.x + x][self.y - x].color != self.color && (board.grid[self.x + x][self.y - x].type == PType.QUEEN || board.grid[self.x + x][self.y - x].type == PType.BISHOP)) {
                var counter = 0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x + z][self.y - z] != 0) {
                        counter += 1
                        if (board.grid[self.x + z][self.y - z].color == self.color) {
                            temp.push(board.grid[self.x + z][self.y - z])
                        }
                    }
                }
                if (counter == 1 && temp.length > 0) {
                    temp[0].pinned = true
                    temp[0].pinDirection = Direction.DIAGONALLEFT
                    pinnedSquares.push([temp[0].x, temp[0].y])

                }
            }
        }
    }
}

function calcCheckDefenseSquares(board) {
    var test = []
    var checks = []
    board.checks = [false, false]
    var next = Color[Object.keys(Color)[this.board.turn + 1 < Object.keys(Color).length ? this.board.turn + 1 : 0]]
    if (!board.checks[next]) {
        for (const piece of board.pieces) {
            if (piece.color == next) {
                pieceMoves =  generateMoves(piece, board, ignoreCheck=true)
                for (const move of pieceMoves) {
                    if (move.isCapture && move.captureType == PType.KING) {
                        checks.push(move)
                    }
                }
            }
        }
        if (checks.length > 0) {
            board.checks[board.turn] = true
        }
        for (var a = 0; a < checks.length; a++) {
            var move = checks[a]
            test.push([])
            if (move.dx != 0 && move.dy != 0) {
                // Diagonal
                //print("diagonal")
                if (move.dx > 0 && move.dy > 0) {
                    // Up Right
                    for (var z = 1; z < move.dx; z++) {
                        test[a].push([move.x + z, move.y + z])
                    }
                }
                else if (move.dx < 0 && move.dy < 0) {
                    // Down Left
                    for (var z = 1; z < Math.abs(move.dx); z++) {
                        test[a].push([move.x - z, move.y - z])
                    }
                }
                else if (move.dx > 0 && move.dy < 0) {
                    // Down Right
                    for (var z = 1; z < Math.abs(move.dx); z++) {
                        test[a].push([move.x + z, move.y - z])
                    }
                }
                else if (move.dx < 0 && move.dy > 0) {
                    // Up Left
                    for (var z = 1; z < Math.abs(move.dx); z++) {
                        test[a].push([move.x - z, move.y + z])
                    }
                }
            }
            else if (move.dx != 0) {
                // Horizontal) {
                //print("horizontal")
                var m = move.dx < 0 ? -1 : 1
                for (var z = 1; z < Math.abs(move.dx); z++) {
                    test[a].push([move.x + (m * z), move.y])
                }
            }
            else if (move.dy != 0) {
                // Vertical
                //print("vertical")
                var m = move.dy < 0 ? -1 : 1
                for (var z = 1; z < Math.abs(move.dy); z++) {
                    test[a].push([move.x, move.y + (m * z)])
                }
            }
        }
        if (checks.length > 1) {
            return []
        }
        var defenseSquares= []
        for (const x of test) {
            for (const move of x) {
                defenseSquares.push(move)
            }
        }
        board.checkPieces = checks
        return defenseSquares
    }
    else {
        return []
    }
}

function calcControl(color, board) {
    var controlled = []
    for (const piece of board.pieces) {
        if (piece.color == color) {
            controlled = controlled.concat(generateMoves(piece, board, ignoreCheck=false, control=true))
        }
    }
    return controlled
}