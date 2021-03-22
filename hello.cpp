#include <cstdint>
int moves = 0;
int *arr;
int test[8];

// Bit 0: isOccupied
// Bit 1: color
// Bit 2-4: type:
// 000: queen
// 001: king
// 010: rook
// 011: knight
// 100: bishop
// 101: pawn
// 110: unused
// 111: unused
// Bit 5: hasMoved

constexpr std::uint_fast8_t mask0{ 0b0000'0001 }; // represents bit 0
constexpr std::uint_fast8_t mask1{ 0b0000'0010 }; // represents bit 1
constexpr std::uint_fast8_t mask2{ 0b0000'0100 }; // represents bit 2 
constexpr std::uint_fast8_t mask3{ 0b0000'1000 }; // represents bit 3
constexpr std::uint_fast8_t mask4{ 0b0001'0000 }; // represents bit 4
constexpr std::uint_fast8_t mask5{ 0b0010'0000 }; // represents bit 5
constexpr std::uint_fast8_t mask6{ 0b0100'0000 }; // represents bit 6
constexpr std::uint_fast8_t mask7{ 0b1000'0000 }; // represents bit 7

int board[8][8] = {
    {0,0,0,0b0000'1111,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0,0,0,0,0},
    {0,0,0,0b0000'1111,0,0,0,0}
};

bool checks[2] = {false, false};

enum Direction {
    HORIZONTAL= 0,
    VERTICAL= 1,
    DIAGONALRIGHT= 2,
    DIAGONALLEFT= 3
};

struct Piece {
    int x = 4;
    int y = 4;
    int color = 0;
    bool pinned = false;
    enum Direction pinDirection = HORIZONTAL;
    bool hasMoved = false;
};

struct Piece testPiece;

typedef long int i32;
extern "C" {
    void addMove(int x, int y, int dx, int dy, int isCapture=0) { 
        arr[moves * 5] = x;
        arr[moves * 5 + 1] = y;
        arr[moves * 5 + 2] = dx;
        arr[moves * 5 + 3] = dy;
        arr[moves * 5 + 4] = isCapture;
        moves++;
    }
    int getMoveAmount() {
        return moves;
    }
    int* getData() {
        return &(arr[0]);
    }

    int* generatePiece(int x, int y, int color, bool pinned, enum Direction pinDirection = HORIZONTAL) {
        testPiece.x = x;
        testPiece.y = y;
        testPiece.color = color;
        testPiece.pinned = pinned;
        return &(testPiece.x);
    }

    void calcRook(Piece self, int skipSquare[], bool doSkip=false, bool control=false) {
        int n = 7 - self.x;
        int e = 7 - self.y;
        int s = self.x;
        int w = self.y;

        bool hor = true;
        bool ver = true;
        if (self.pinned) {
            if (self.pinDirection == VERTICAL) {
                hor = false;
            }
            else if (self.pinDirection == HORIZONTAL) {
                ver = false;
            }
        }

        if (hor) {
            for (int x = 1; x < n + 1; x++) {
                if (doSkip) {
                    if (self.x + x == skipSquare[0] && self.y == skipSquare[1]) {
                        continue;
                    }
                }
                if (board[self.x + x][self.y] == 0) {
                    addMove(self.x, self.y, x, 0);
                    //plm.push(new Move(self.x, self.y, x, 0));
                }
                else if ((board[self.x + x][self.y] & mask1) != self.color || control) {
                    //int move = new Move(self.x, self.y, x, 0);
                    //move.isCapture = true;
                    //move.captureType = captureType=board[self.x + x][self.y].type;
                    //plm.push(move);
                    addMove(self.x, self.y, x, 0, 1);
                    break;
                }
                else {
                    break;
                }
            }
            for (int x = 1; x < s + 1; x++) {
                if (doSkip) {
                    if (self.x - x == skipSquare[0] && self.y == skipSquare[1]) {
                        continue;
                    }
                }
                if (board[self.x - x][self.y] == 0) {
                    addMove(self.x, self.y, -x, 0);
                    //plm.push(new Move(self.x, self.y, -x, 0));
                }
                else if ((board[self.x - x][self.y] & mask1) != self.color || control) {
                    //int move = new Move(self.x, self.y, -x, 0);
                    //move.isCapture = true;
                    //move.captureType=board[self.x - x][self.y].type;
                    //plm.push(move);
                    addMove(self.x, self.y, -x, 0, 1);
                    break;
                }
                else {
                    break;
                }
            }
        }
        if (ver) {
            for (int x = 1; x < e + 1; x++) {
                if (doSkip) {
                    if (self.x == skipSquare[0] && self.y + x == skipSquare[1]) {
                        continue;
                    }
                }
                if (board[self.x][self.y + x] == 0) {
                    //plm.push(new Move(self.x, self.y, 0, x));
                    addMove(self.x, self.y, 0, x);
                }
                else if ((board[self.x][self.y + x] & mask1) != self.color || control) {
                    //int move = new Move(self.x, self.y, 0, x);
                    //move.isCapture = true;
                    //move.captureType=board[self.x][self.y + x].type;
                    //plm.push(move);
                    addMove(self.x, self.y, 0, x, 1);
                    break;
                }
                else {
                    break;
                }
            }
            for (int x = 1; x < w + 1; x++) {
                if (doSkip) {
                    if (self.x == skipSquare[0] && self.y - x == skipSquare[1]) {
                        continue;
                    }
                }
                if (board[self.x][self.y - x] == 0) {
                    //plm.push(new Move(self.x, self.y, 0, -x));
                    addMove(self.x, self.y, 0, -x);
                }
                else if ((board[self.x][self.y - x] & mask1) != self.color || control) {
                    //int move = new Move(self.x, self.y, 0, -x);
                    //move.isCapture = true;
                    //move.captureType=board[self.x][self.y - x].type;
                    //plm.push(move);
                    addMove(self.x, self.y, 0, -x, 1);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }

    void calcBishop(Piece self, int skipSquare[], bool doSkip=false, bool control=false) {
        bool right = true;
        bool left = true;
        if (self.pinned) {
            if (self.pinDirection == DIAGONALRIGHT){
                left = false;
            }
            else if (self.pinDirection == DIAGONALLEFT){
                right = false;
            }
        }
        if (right) {
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (self.x + x == skipSquare[0] && self.y + x == skipSquare[1]) {
                        continue;
                    }
                }
                if (self.x + x <= 7 && self.y + x <= 7){
                    if (board[self.x + x][self.y + x] == 0){
                        addMove(self.x, self.y, x, x);
                        //plm.push(new Move(self.x, self.y, x, x))
                    }
                    else if ((board[self.x + x][self.y + x] & mask1) != self.color || control){
                        //var move = new Move(self.x, self.y, x, x)
                        //move.isCapture = true
                        //move.captureType=board[self.x + x][self.y + x].type
                        //plm.push(move)
                        addMove(self.x, self.y, x, x, 1);
                        break;
                    }
                    else {
                        break;
                    }
                }
            }
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (self.x - x == skipSquare[0] && self.y - x == skipSquare[1]) {
                        continue;
                    }
                }
                if (self.x - x >= 0 && self.y - x >= 0){
                    if (board[self.x - x][self.y - x] == 0){
                        //plm.push(new Move(self.x, self.y, -x, -x))
                        addMove(self.x, self.y, -x, -x);
                    }
                    else if ((board[self.x - x][self.y - x] & mask1) != self.color || control){
                        //var move = new Move(self.x, self.y, -x, -x)
                        //move.isCapture = true
                        //move.captureType=board[self.x - x][self.y - x].type
                        //plm.push(move)
                        addMove(self.x, self.y, -x, -x, 1);
                        break;
                    }
                    else{
                        break;
                    }
                }
            }
        }
        if (left){
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (self.x - x == skipSquare[0] && self.y + x == skipSquare[1]) {
                        continue;
                    }
                }
                if (self.x - x >= 0 && self.y + x <= 7){
                    if (board[self.x - x][self.y + x] == 0){
                        //plm.push(new Move(self.x, self.y, -x, x))
                        addMove(self.x, self.y, -x, x);
                    }
                    else if ((board[self.x - x][self.y + x] & mask1) != self.color || control){
                        //var move = new Move(self.x, self.y, -x, x)
                        //move.isCapture = true
                        //move.captureType=board[self.x - x][self.y + x].type
                        //plm.push(move)
                        addMove(self.x, self.y, -x, x, 1);
                        break;
                    }
                    else{
                        break;
                    }
                }
            }
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (self.x + x == skipSquare[0] && self.y - x == skipSquare[1]) {
                        continue;
                    }
                }
                if (self.x + x <= 7 && self.y - x >= 0){
                    if (board[self.x + x][self.y - x] == 0){
                        //plm.push(new Move(self.x, self.y, x, -x))
                        addMove(self.x, self.y, x, -x);
                    }
                    else if ((board[self.x + x][self.y - x] & mask1) != self.color || control){
                        //var move = new Move(self.x, self.y, x, -x)
                        //move.isCapture = true
                        //move.captureType=board[self.x + x][self.y - x].type
                        //plm.push(move)
                        addMove(self.x, self.y, x, -x, 1);
                        break;
                    }
                    else{
                        break;
                    }
                }
            }
        }
    }

    void calcKnight(Piece self, bool control=false) {
        if (self.x > 1) {
            if (self.y + 1 <= 7 && (board[self.x - 2][self.y + 1] == 0 || (board[self.x - 2][self.y + 1] & mask1) != self.color)){
                addMove(self.x, self.y, -2, 1, board[self.x - 2][self.x + 1] & mask0);
            }
            if (self.y - 1 >= 0 && (board[self.x - 2][self.y - 1] == 0 || (board[self.x - 2][self.y - 1] & mask1) != self.color)) {
                addMove(self.x, self.y, -2, -1, board[self.x - 2][self.x - 1] & mask0);
            }
        }
        if (self.x > 0) {
            if (self.y + 2 <= 7 && (board[self.x - 1][self.y + 2] == 0 || (board[self.x - 1][self.y + 2] & mask1) != self.color)) {
                addMove(self.x, self.y, -1, 2, board[self.x - 1][self.x + 2] & mask0);
            }
            if (self.y - 2 >= 0 && (board[self.x - 1][self.y - 2] == 0 || (board[self.x - 1][self.y - 2] & mask1) != self.color)) {
                addMove(self.x, self.y, -1, -2, board[self.x - 1][self.x - 2] & mask0);
            }
        }
        if (self.x < 6) {
            if (self.y + 1 <= 7 && (board[self.x + 2][self.y + 1] == 0 || (board[self.x + 2][self.y + 1] & mask1) != self.color)) {
                addMove(self.x, self.y, 2, 1, board[self.x + 2][self.x + 1] & mask0);
            }
            if (self.y - 1 >= 0 && (board[self.x + 2][self.y - 1] == 0 || (board[self.x + 2][self.y - 1] & mask1) != self.color)) {
                addMove(self.x, self.y, 2, -1, board[self.x + 2][self.x - 1] & mask0);
            }
        }
        if (self.x < 7) {
            if (self.y + 2 <= 7 && (board[self.x + 1][self.y + 2] == 0 || (board[self.x + 1][self.y + 2] & mask1) != self.color)) {
                addMove(self.x, self.y, 1, 2, board[self.x + 1][self.x + 2] & mask0);
            }
            if (self.y - 2 >= 0 && (board[self.x + 1][self.y - 2] == 0 || (board[self.x + 1][self.y - 2] & mask1) != self.color)) {
                addMove(self.x, self.y, 1, -2, board[self.x + 1][self.x - 2] & mask0);
            }
        }
    }

    void calcKing(Piece self, bool control=false) {
        if (self.y != 7) {
            if (7 > self.x > 0) {
                if ((board[self.x - 1][self.y + 1] & mask1) != self.color) {
                    addMove(self.x, self.y, -1, 1);
                }
                if ((board[self.x][self.y + 1] & mask1) != self.color) {
                    addMove(self.x, self.y, 0, 1);
                }
                if ((board[self.x + 1][self.y + 1] & mask1) != self.color) {
                    addMove(self.x, self.y, +1, 1);
                }
            }
            else if (self.x == 0) {
                if ((board[self.x + 1][self.y + 1] & mask1) != self.color) {
                    addMove(self.x, self.y, +1, 1);
                }
            }
            else if (self.x == 7) {
                if ((board[self.x - 1][self.y + 1] & mask1) != self.color) {
                    addMove(self.x, self.y, -1, 1);
                }
            }
        }
        if (self.y != 0) {
            if (7 > self.x > 0) {
                if ((board[self.x - 1][self.y - 1] & mask1) != self.color) {
                    addMove(self.x, self.y, -1, -1);
                }
                if ((board[self.x][self.y - 1] & mask1) != self.color) {
                    addMove(self.x, self.y, 0, -1);
                }
                if ((board[self.x + 1][self.y - 1] & mask1) != self.color) {
                    addMove(self.x, self.y, +1, -1);
                }
            }
            else if (self.x == 0) {
                if ((board[self.x + 1][self.y - 1] & mask1) != self.color) {
                    addMove(self.x, self.y, +1, -1);
                }
            }
            else if (self.x == 7) {
                if ((board[self.x - 1][self.y - 1] & mask1) != self.color) {
                    addMove(self.x, self.y, -1, -1);
                }
            }
        }
        if (7 > self.x > 0) {
            if ((board[self.x - 1][self.y] & mask1) != self.color) {
                addMove(self.x, self.y, -1, 0);
            }
            if ((board[self.x][self.y] & mask1) != self.color) {
                addMove(self.x, self.y, 0, 0);
            }
            if ((board[self.x + 1][self.y] & mask1) != self.color) {
                addMove(self.x, self.y, +1, 0);
            }
        }
        else if (self.x == 0) {
            if ((board[self.x + 1][self.y] & mask1) != self.color) {
                addMove(self.x, self.y, +1, 0);
            }
        }
        else if (self.x == 7) {
            if ((board[self.x - 1][self.y] & mask1) != self.color) {
                addMove(self.x, self.y, -1, 0);
            }
        }

        // Castling
        if (!self.hasMoved && !checks[self.color] && false) {
            // White
            if (self.color == 0) {
                // Short
                int maybeRook = board[7][0];
                if (maybeRook & mask0) {
                    if ((maybeRook & mask2 & mask3 & mask4 == 2) && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == self.color) {
                        if (board[5][0] == 0 && board[6][0] == 0) {
                            addMove(self.x, self.y, 2, 0, 1);
                            //var move = new Move(self.x, self.y, 2, 0)
                            //move.isCastleShort = true
                            //plm.push(move)
                        }
                    }

                    // Long
                    int maybeRook = board[0][0];
                    if ((maybeRook & mask2 & mask3 & mask4 == 2) && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == self.color) {
                        if (board[1][0] == 0 && board[2][0] == 0 && board[3][0] == 0) {
                            addMove(self.x, self.y, -2, 0, 1);
                            //var move = new Move(self.x, self.y, -2, 0)
                            //move.isCastleLong = true
                            //plm.push(move)
                        }
                    }
                }
            }

            // Black
            else if (self.color == 1) {
                // Short
                int maybeRook = board[7][7];
                if (maybeRook & mask0) {
                    if ((maybeRook & mask2 & mask3 & mask4 == 2) && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == self.color) {
                        if (board[5][7] == 0 && board[6][7] == 0) {
                            addMove(self.x, self.y, 2, 0, 1);
                            //var move = new Move(self.x, self.y, 2, 0)
                            //move.isCastleShort = true
                            //plm.push(move)
                        }
                    }

                    // Long
                    int maybeRook = board[0][7];
                    if ((maybeRook & mask2 & mask3 & mask4 == 2) && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == self.color) {
                        if (board[1][7] == 0 && board[2][7] == 0 && board[3][7] == 0) {
                            addMove(self.x, self.y, -2, 0, 1);
                            //var move = new Move(self.x, self.y, -2, 0)
                            //move.isCastleLong = true
                            //plm.push(move)
                        }
                    }
                }
            }
        }
    }

    void calcPawn(Piece self, bool capleft=true, bool capright=true, bool control=false) {
        int m = self.color == 0 ? 1 : -1;

        // Captures
        if (self.x > 0) {
            if ((board[self.x - 1][self.y + m] != 0 && (board[self.x - 1][self.y + m] & mask1) != self.color && capleft || control) && capleft) {
                if ((!self.pinned) || self.pinDirection == DIAGONALLEFT) {
                    addMove(self.x, self.y, -1, m, 1);
                    //var move = new Move(self.x, self.y, -1, m)
                    //move.isCapture = true
                    //move.captureType = board[self.x - 1][self.y + m].type
                    //plm.push(move)
                }
            }
        }
        if (self.x < 7) {
            if ((board[self.x + 1][self.y + m] != 0 && (board[self.x + 1][self.y + m] & mask1) != self.color || control) && capright) {
                if ((!self.pinned) || self.pinDirection == DIAGONALRIGHT) {
                    addMove(self.x, self.y, 1, m, 1);
                    //var move = new Move(self.x, self.y, 1, m)
                    //move.isCapture = true
                    //move.captureType = captureType=board[self.x + 1][self.y + m].type
                    //plm.push(move)
                }
            }
        }
        if (board[self.x][self.y + m] == 0 && !control) {
            if (self.y == (self.color == 0 ? 6 : 1)) {
                if ((!self.pinned) || self.pinDirection == VERTICAL) {
                    addMove(self.x, self.y, 0, m, 1);
                    //plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.QUEEN))
                    //plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.KNIGHT))
                    //plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.ROOK))
                    //plm.push(new Move(self.x, self.y, 0, m, isPromotion=true, promoteTo=PType.BISHOP))
                }
            }
            else {
                if ((!self.pinned) || self.pinDirection == VERTICAL) {
                    addMove(self.x, self.y, 0, m, 0);
                    //plm.push(new Move(self.x, self.y, 0, m))
                }
            }
        }
        // First new Move 2 spaces
        if (!self.hasMoved && board[self.x][self.y + m] == 0 && board[self.x][self.y + 2*m] == 0 && self.y == (self.color == 0 ? 1 : 6) && !control) {
            if ((!self.pinned) || self.pinDirection == VERTICAL) {
                addMove(self.x, self.y, 0, 2*m, 0);
                //var move = new Move(self.x, self.y, 0, 2*m)
                //move.enpassantable = true
                //plm.push(move)
            }
        }
        // En Passant
        // TODO: this ^
        /*
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
        }*/
    }

    void reset() {
        for (int x = 0; x < 100000; x++) {
            calcPawn(testPiece, {});
        }
        moves = 0;
    }
}