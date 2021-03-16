function generateMoves(piece, board) {
    var plm = []
    console.log("teststart")
    calcRook(piece, plm, board)
    console.log("testend")

    print(plm)
    return plm
}

function calcRook(piece, plm, board) {
    var self = piece
    var n = 7 - self.x
    var e = 7 - self.y
    var s = self.x
    var w = self.y

    console.log(s)
    console.log(n)

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

    console.log("test1")

    if (hor) {
        for (x = 1; x < n + 1; x++) {
            if (board.grid[self.x + x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, x, 0))
            }
            else if (board.grid[self.x + x][self.y].color != self.color) {
                plm.push(new Move(self.x, self.y, x, 0, isCapture=true, captureType=board.grid[self.x + x][self.y].type))
                break
            }
            else {
                break
            }
        }
        for (x = 1; x < s + 1; x++) {
            if (board.grid[self.x - x][self.y] == 0) {
                plm.push(new Move(self.x, self.y, -x, 0))
            }
            else if (board.grid[self.x - x][self.y].color != self.color) {
                plm.push(new Move(self.x, self.y, -x, 0, isCapture=true, captureType=board.grid[self.x - x][self.y].type))
                break
            }
            else {
                break
            }
        }
    }
    console.log("test2")
    if (ver) {
        for (x = 1; x < e + 1; x++) {
            if (board.grid[self.x][self.y + x] == 0) {
                plm.push(new Move(self.x, self.y, 0, x))
            }
            else if (board.grid[self.x][self.y + x].color != self.color) {
                plm.push(new Move(self.x, self.y, 0, x, isCapture=true, captureType=board.grid[self.x][self.y + x].type))
                break
            }
            else {
                break
            }
        }
        for (x = 1; x < w + 1; y++) {
            if (board.grid[self.x][self.y - x] == 0) {
                plm.push(new Move(self.x, self.y, 0, -x))
            }
            else if (board.grid[self.x][self.y - x].color != self.color) {
                plm.push(new Move(self.x, self.y, 0, -x, isCapture=true, captureType=board.grid[self.x][self.y - x].type))
                break
            }
            else {
                break
            }
        }
    }
    console.log("test3")
}