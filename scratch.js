function calcCheckDefenseSquares(self, board) {
        var test = []
        var checks = []
        var next = Color[Object.keys(Color)[this.board.turn.value + 1 < Object.keys(Color).length ? this.board.turn.value + 1 : 0]]
        if (!self.board.checks[next.value]) {
            for (const piece of self.board.pieces) {
                if (piece.color == next) {
                    pieceMoves =  piece.generatePseudoLegalMoves(self.board, ignoreCheck=true)
                    for (const move of pieceMoves) {
                        if (move.isCapture && move.captureType == PType.KING) {
                            checks.push(move)
                        }
                    }
                }
            }
            if (len(checks) > 0) {
                self.board.checks[self.board.turn.value] = true
            }
            for (const a of range(len(checks))) {
                move = checks[a]
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
                        for (var z = 1; z < abs(move.dx); z++) {
                            test[a].push([move.x - z, move.y - z])
                        }
                    }
                    else if (move.dx > 0 && move.dy < 0) {
                        // Down Right
                        for (var z = 1; z < abs(move.dx); z++) {
                            test[a].push([move.x + z, move.y - z])
                        }
                    }
                    else if (move.dx < 0 && move.dy > 0) {
                        // Up Left
                        for (var z = 1; z < abs(move.dx); z++) {
                            test[a].push([move.x - z, move.y + z])
                        }
                    }
                }
                else if (move.dx != 0) {
                    // Horizontal) {
                    //print("horizontal")
                    var m = move.dx < 0 ? -1 : 1
                    for (const z of range(1, abs(move.dx))) {
                        test[a].push([move.x + (m * z), move.y])
                    }
                }
                else if (move.dy != 0) {
                    // Vertical
                    //print("vertical")
                    var m = move.dx < 0 ? -1 : 1
                    for (const z of range(1, abs(move.dy))) {
                        test[a].push([move.x, move.y + (m * z)])
                    }
                }
            }
            if (checks.length > 1) {
                return []
            }
            else {
                var defenseSquares= []
                for (const x of test) {
                    for (const move of x) {
                        defenseSquares.push(move)
                    }
                self.board.checkPieces = checks
                return defenseSquares
                }
            }
        }
        else {
            return []
        }
}