function calcBishopPin(self, pinnedSquares, board) {
    for (var x = 1; x<8; x++) {
        if (self.x + x <= 7 && self.y + x <= 7) {
            if (board.grid[self.x + x][self.y + x] != 0 && board.grid[self.x + x][self.y + x].color != self.color && (board.grid[self.x + x][self.y + x].type == PType.QUEEN or board.grid[self.x + x][self.y + x].type == PType.BISHOP)) {
                var counter0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x + z][self.y + z] != 0) {
                        counter += 1
                        if (board.grid[self.x + z][self.y + z].color == self.color) {
                            temp.append(board.grid[self.x + z][self.y + z])
                        }
                    }
                }
                if (counter == 1 && len(temp) > 0) {
                    temp[0].pinned = True
                    temp[0].pinDirection = Direction.DIAGONALRIGHT
                    pinnedSquares.append([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x - x >= 0 && self.y - x >= 0) {
            if (board.grid[self.x - x][self.y - x] != 0 && board.grid[self.x - x][self.y - x].color != self.color && (board.grid[self.x - x][self.y - x].type == PType.QUEEN or board.grid[self.x - x][self.y - x].type == PType.BISHOP)) {
                var counter0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x - z][self.y - z] != 0) {
                        counter += 1
                        if (board.grid[self.x - z][self.y - z].color == self.color) {
                            temp.append(board.grid[self.x - z][self.y - z])
                        }
                    }
                }
                if (counter == 1 && len(temp) > 0) {
                    temp[0].pinned = True
                    temp[0].pinDirection = Direction.DIAGONALRIGHT
                    pinnedSquares.append([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x - x >= 0 && self.y + x <= 7) {
            if (board.grid[self.x - x][self.y + x] != 0 && board.grid[self.x - x][self.y + x].color != self.color && (board.grid[self.x - x][self.y + x].type == PType.QUEEN or board.grid[self.x - x][self.y + x].type == PType.BISHOP)) {
                var counter0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x - z][self.y + z] != 0) {
                        counter += 1
                        if (board.grid[self.x - z][self.y + z].color == self.color) {
                            temp.append(board.grid[self.x - z][self.y + z])
                        }
                    }
                }
                if (counter == 1 && len(temp) > 0) {
                    temp[0].pinned = True
                    temp[0].pinDirection = Direction.DIAGONALLEFT
                    pinnedSquares.append([temp[0].x, temp[0].y])
                }
            }
        }
    }
    for (var x = 1; x<8; x++) {
        if (self.x + x <= 7 && self.y - x >= 0) {
            if (board.grid[self.x + x][self.y - x] != 0 && board.grid[self.x + x][self.y - x].color != self.color && (board.grid[self.x + x][self.y - x].type == PType.QUEEN or board.grid[self.x + x][self.y - x].type == PType.BISHOP)) {
                var counter0
                var temp = []
                for (var z = 1; z < x; z++) {
                    if (board.grid[self.x + z][self.y - z] != 0) {
                        counter += 1
                        if (board.grid[self.x + z][self.y - z].color == self.color) {
                            temp.append(board.grid[self.x + z][self.y - z])
                        }
                    }
                }
                if (counter == 1 && len(temp) > 0) {
                    temp[0].pinned = True
                    temp[0].pinDirection = Direction.DIAGONALLEFT
                    pinnedSquares.append([temp[0].x, temp[0].y])

                }
            }
        }
    }
}