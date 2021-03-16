var x = self.selected.x
var y = self.selected.y
succes = False
// Generate moves and check if clicked square is legal
for (const move of self.selected.generatePseudoLegalMoves(self.board)) {
    if (self.tp[0] == x + move.dx && 7 - self.tp[1] == y + move.dy) {
        if (move.isPromotion) {
            self.drawPromotionDialog = True
        }
        else {
            self.parent.board.performMove(move)
            self.selected = 0
            self.board.turn = Color(self.board.turn.value + 1 < len(Color) ? self.board.turn.value + 1 : 0)
        }
        succes = True
        break
    }
}
if (!succes) {
    self.selected = self.board.grid[self.tp[0]][7 - self.tp[1]]
    if (self.selected != 0 && self.selected.color != self.board.turn) {
        self.selected = 0
    }
}