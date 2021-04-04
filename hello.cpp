#include <cstdint>
#include <string.h>
#include <iostream>
int moves = 0;
int arr[64 * 6];
int controlMoves = 0;
int controlArr[64 * 6];
int testArr[128];

int checkingPieces = 0;
int checkingPieceToCapture[2] = {0,0};
int checkStopMoves = 0;
int checkStop[64 * 6];

char *outputBuffer;

// TODO: Fix castling
// TODO: Fix pins
// TODO: Fix illegal king moves
// TODO: Fix check stop

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
// Bit 6: isPinned

// Board 2 (info board)
// Bit 0: hasMoved
// Bit 1: isPinned
// Bit 2-3: pinDirection

constexpr std::uint_fast8_t mask0{ 0b0000'0001 }; // represents bit 0
constexpr std::uint_fast8_t mask1{ 0b0000'0010 }; // represents bit 1
constexpr std::uint_fast8_t mask2{ 0b0000'0100 }; // represents bit 2 
constexpr std::uint_fast8_t mask3{ 0b0000'1000 }; // represents bit 3
constexpr std::uint_fast8_t mask4{ 0b0001'0000 }; // represents bit 4
constexpr std::uint_fast8_t mask5{ 0b0010'0000 }; // represents bit 5
constexpr std::uint_fast8_t mask6{ 0b0100'0000 }; // represents bit 6
constexpr std::uint_fast8_t mask7{ 0b1000'0000 }; // represents bit 7

constexpr std::uint_fast8_t pieceMask{ 0b0001'1100 }; // represents piece type mask
constexpr std::uint_fast8_t pinDirMask{ 0b1100'0000 }; // represents nothing lol

constexpr std::uint_fast8_t prevXMask{ 0b0000'0111 }; // represents previous move x mask
constexpr std::uint_fast8_t prevYMask{ 0b0011'1000 }; // represents previous move y mask

int previousMoveFlags = 0b000000000000;
// Bit 0-2: x
// Bit 3-5: y
// Bit 6: capture
// Bit 7: en passantable
// Bit 8: castle short
// Bit 9: castle long
// Bit 10-14: capture data

int localCounter = 0;
int oldMoveCount = 0;

int board1[8][8] = {
    {9, 21, 0, 0, 0, 0, 23, 11},
    {13, 21, 0, 0, 0, 0, 23, 15},
    {17, 21, 0, 0, 0, 0, 23, 19},
    {1, 21, 0, 0, 0, 0, 23, 3},
    {5, 21, 0, 0, 0, 0, 23, 7},
    {17, 21, 0, 0, 0, 0, 23, 19},
    {13, 21, 0, 0, 0, 0, 23, 15},
    {9, 21, 0, 0, 0, 0, 23, 11}
};

int board[8][8] = {
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {5, 0, 0, 0, 0, 0, 0, 11},
    {0, 0, 0, 0, 0, 0, 0, 0},
    {0, 9, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0, 0}
};


int offsets[8] = {0,0,0,0,0,0,0,0};

bool checks[2] = {false, false};

enum Direction {
    HORIZONTAL= 0,
    VERTICAL= 64,
    DIAGONALRIGHT= 128,
    DIAGONALLEFT= 192
};

enum PType {
    QUEEN= 0,
    KING= 4,
    ROOK= 8,
    KNIGHT= 12,
    BISHOP= 16,
    PAWN= 20
};

struct Piece {
    int type = 0;
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
    void addMove(int x, int y, int dx, int dy, int isCapture=0, int specialFlag=0) { 
        arr[moves * 6] = x;
        arr[moves * 6 + 1] = y;
        arr[moves * 6 + 2] = dx;
        arr[moves * 6 + 3] = dy;
        arr[moves * 6 + 4] = isCapture;
        arr[moves * 6 + 5] = specialFlag;
        moves++;
    }
    void addCheckstopMove(int x, int y) { 
        checkStop[checkStopMoves * 2] = x;
        checkStop[checkStopMoves * 2 + 1] = y;
        checkStopMoves++;
    }
    int getMoveAmount() {
        return moves;
    }
    int* getData() {
        return &(arr[0]);
    }

    int* getControlData() {
        return &(controlArr[0]);
    }

    int* getTest() {
        return &(checkStop[0]);
    }

    void calcRook(int p, int px, int py, int sx=0, int sy=0, bool control=false, bool doSkip=false) {
        int n = 7 - px;
        int e = 7 - py;
        int s = px;
        int w = py;

        bool hor = true;
        bool ver = true;
        if (p & mask6) {
            return;
            /*if (self.pinDirection == VERTICAL) {
                hor = false;
            }
            else if (self.pinDirection == HORIZONTAL) {
                ver = false;
            }*/
        }

        if (hor) {
            for (int x = 1; x < n + 1; x++) {
                if (doSkip) {
                    if (px + x == sx && py == sy) {
                        continue;
                    }
                }
                if (board[px + x][py] == 0) {
                    addMove(px, py, x, 0);
                    //plm.push(new Move(px, py, x, 0));
                }
                else if ((board[px + x][py] & mask1) != (p & mask1) || control) {
                    //int move = new Move(px, py, x, 0);
                    //move.isCapture = true;
                    //move.captureType = captureType=board[px + x][py].type;
                    //plm.push(move);
                    addMove(px, py, x, 0, 1);
                    break;
                }
                else {
                    break;
                }
            }
            for (int x = 1; x < s + 1; x++) {
                if (doSkip) {
                    if (px - x == sx && py == sy) {
                        continue;
                    }
                }
                if (board[px - x][py] == 0) {
                    addMove(px, py, -x, 0);
                    //plm.push(new Move(px, py, -x, 0));
                }
                else if ((board[px - x][py] & mask1) != (p & mask1) || control) {
                    //int move = new Move(px, py, -x, 0);
                    //move.isCapture = true;
                    //move.captureType=board[px - x][py].type;
                    //plm.push(move);
                    addMove(px, py, -x, 0, 1);
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
                    if (px == sx && py + x == sy) {
                        continue;
                    }
                }
                if (board[px][py + x] == 0) {
                    //plm.push(new Move(px, py, 0, x));
                    addMove(px, py, 0, x);
                }
                else if ((board[px][py + x] & mask1) != (p & mask1) || control) {
                    //int move = new Move(px, py, 0, x);
                    //move.isCapture = true;
                    //move.captureType=board[px][py + x].type;
                    //plm.push(move);
                    addMove(px, py, 0, x, 1);
                    break;
                }
                else {
                    break;
                }
            }
            for (int x = 1; x < w + 1; x++) {
                if (doSkip) {
                    if (px == sx && py - x == sy) {
                        continue;
                    }
                }
                if (board[px][py - x] == 0) {
                    //plm.push(new Move(px, py, 0, -x));
                    addMove(px, py, 0, -x);
                }
                else if ((board[px][py - x] & mask1) != (p & mask1) || control) {
                    //int move = new Move(px, py, 0, -x);
                    //move.isCapture = true;
                    //move.captureType=board[px][py - x].type;
                    //plm.push(move);
                    addMove(px, py, 0, -x, 1);
                    break;
                }
                else {
                    break;
                }
            }
        }
    }

    void calcBishop(int p, int px, int py, int sx=0, int sy=0, bool control=false, bool doSkip=false) {
        bool right = true;
        bool left = true;
        if (p & mask6) {
            return;
            /*
            if (self.pinDirection == DIAGONALRIGHT){
                left = false;
            }
            else if (self.pinDirection == DIAGONALLEFT){
                right = false;
            }*/
        }
        if (right) {
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (px + x == sx && py + x == sy) {
                        continue;
                    }
                }
                if (px + x <= 7 && py + x <= 7){
                    if (board[px + x][py + x] == 0){
                        addMove(px, py, x, x);
                        //plm.push(new Move(px, py, x, x))
                    }
                    else if ((board[px + x][py + x] & mask1) != (p & mask1) || control){
                        //var move = new Move(px, py, x, x)
                        //move.isCapture = true
                        //move.captureType=board[px + x][py + x].type
                        //plm.push(move)
                        addMove(px, py, x, x, 1);
                        break;
                    }
                    else {
                        break;
                    }
                }
            }
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (px - x == sx && py - x == sy) {
                        continue;
                    }
                }
                if (px - x >= 0 && py - x >= 0){
                    if (board[px - x][py - x] == 0){
                        //plm.push(new Move(px, py, -x, -x))
                        addMove(px, py, -x, -x);
                    }
                    else if ((board[px - x][py - x] & mask1) != (p & mask1) || control){
                        //var move = new Move(px, py, -x, -x)
                        //move.isCapture = true
                        //move.captureType=board[px - x][py - x].type
                        //plm.push(move)
                        addMove(px, py, -x, -x, 1);
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
                    if (px - x == sx && py + x == sy) {
                        continue;
                    }
                }
                if (px - x >= 0 && py + x <= 7){
                    if (board[px - x][py + x] == 0){
                        //plm.push(new Move(px, py, -x, x))
                        addMove(px, py, -x, x);
                    }
                    else if ((board[px - x][py + x] & mask1) != (p & mask1) || control){
                        //var move = new Move(px, py, -x, x)
                        //move.isCapture = true
                        //move.captureType=board[px - x][py + x].type
                        //plm.push(move)
                        addMove(px, py, -x, x, 1);
                        break;
                    }
                    else{
                        break;
                    }
                }
            }
            for (int x = 1; x < 8; x++) {
                if (doSkip) {
                    if (px + x == sx && py - x == sy) {
                        continue;
                    }
                }
                if (px + x <= 7 && py - x >= 0){
                    if (board[px + x][py - x] == 0){
                        //plm.push(new Move(px, py, x, -x))
                        addMove(px, py, x, -x);
                    }
                    else if ((board[px + x][py - x] & mask1) != (p & mask1) || control){
                        //var move = new Move(px, py, x, -x)
                        //move.isCapture = true
                        //move.captureType=board[px + x][py - x].type
                        //plm.push(move)
                        addMove(px, py, x, -x, 1);
                        break;
                    }
                    else{
                        break;
                    }
                }
            }
        }
    }

    void calcKnight(int p, int px, int py, bool control=false) {
        if (px > 1) {
            if (py + 1 <= 7 && (board[px - 2][py + 1] == 0 || (board[px - 2][py + 1] & mask1) != (p & mask1))){
                addMove(px, py, -2, 1, board[px - 2][px + 1] & mask0);
            }
            if (py - 1 >= 0 && (board[px - 2][py - 1] == 0 || (board[px - 2][py - 1] & mask1) != (p & mask1))) {
                addMove(px, py, -2, -1, board[px - 2][px - 1] & mask0);
            }
        }
        if (px > 0) {
            if (py + 2 <= 7 && (board[px - 1][py + 2] == 0 || (board[px - 1][py + 2] & mask1) != (p & mask1))) {
                addMove(px, py, -1, 2, board[px - 1][px + 2] & mask0);
            }
            if (py - 2 >= 0 && (board[px - 1][py - 2] == 0 || (board[px - 1][py - 2] & mask1) != (p & mask1))) {
                addMove(px, py, -1, -2, board[px - 1][px - 2] & mask0);
            }
        }
        if (px < 6) {
            if (py + 1 <= 7 && (board[px + 2][py + 1] == 0 || (board[px + 2][py + 1] & mask1) != (p & mask1))) {
                addMove(px, py, 2, 1, board[px + 2][px + 1] & mask0);
            }
            if (py - 1 >= 0 && (board[px + 2][py - 1] == 0 || (board[px + 2][py - 1] & mask1) != (p & mask1))) {
                addMove(px, py, 2, -1, board[px + 2][px - 1] & mask0);
            }
        }
        if (px < 7) {
            if (py + 2 <= 7 && (board[px + 1][py + 2] == 0 || (board[px + 1][py + 2] & mask1) != (p & mask1))) {
                addMove(px, py, 1, 2, board[px + 1][px + 2] & mask0);
            }
            if (py - 2 >= 0 && (board[px + 1][py - 2] == 0 || (board[px + 1][py - 2] & mask1) != (p & mask1))) {
                addMove(px, py, 1, -2, board[px + 1][px - 2] & mask0);
            }
        }
    }

    void calcKing(int p, int px, int py, bool control=false) {
        if (py != 7) {
            if (7 > px > 0) {
                //board[px - 1][py + 1] == 0 || (board[px - 1][py + 1] & mask1) != (p & mask1) || control
                if (board[px - 1][py + 1] == 0) {
                    addMove(px, py, -1, 1);
                }
                else if ((board[px - 1][py + 1] & mask1) != (p & mask1)) {
                    addMove(px, py, -1, 1);
                }
                if (board[px][py + 1] == 0) {
                    addMove(px, py, 0, 1);
                }
                else if ((board[px][py + 1] & mask1) != (p & mask1)) {
                    addMove(px, py, 0, 1);
                }
                if (board[px + 1][py + 1] == 0) {
                    addMove(px, py, +1, 1);
                }
                else if ((board[px + 1][py + 1] & mask1) != (p & mask1)) {
                    addMove(px, py, +1, 1);
                }
            }
            else if (px == 0) {
                if (board[px + 1][py + 1] == 0) {
                    addMove(px, py, 1, 1);
                }
                else if ((board[px + 1][py + 1] & mask1) != (p & mask1)) {
                    addMove(px, py, 1, 1);
                }
            }
            else if (px == 7) {
                if (board[px - 1][py + 1] == 0) {
                    addMove(px, py, -1, 1);
                }
                else if ((board[px - 1][py + 1] & mask1) != (p & mask1)) {
                    addMove(px, py, -1, 1);
                }
            }
        }
        if (py != 0) {
            if (7 > px > 0) {
                if (board[px - 1][py - 1] == 0) {
                    addMove(px, py, -1, -1);
                }
                else if ((board[px - 1][py - 1] & mask1) != (p & mask1)) {
                    addMove(px, py, -1, -1);
                }
                if (board[px][py - 1] == 0) {
                    addMove(px, py, 0, -1);
                }
                else if ((board[px][py - 1] & mask1) != (p & mask1)) {
                    addMove(px, py, 0, -1);
                }
                if (board[px + 1][py - 1] == 0) {
                    addMove(px, py, 1, -1);
                }
                else if ((board[px + 1][py - 1] & mask1) != (p & mask1)) {
                    addMove(px, py, 1, -1);
                }
            }
            else if (px == 0) {
                if (board[px + 1][py - 1] == 0) {
                    addMove(px, py, 1, -1);
                }
                else if ((board[px + 1][py - 1] & mask1) != (p & mask1)) {
                    addMove(px, py, 1, -1);
                }
            }
            else if (px == 7) {
                if (board[px - 1][py - 1] == 0) { 
                    addMove(px, py, -1, -1);
                }
                else if ((board[px - 1][py - 1] & mask1) != (p & mask1)) {
                    addMove(px, py, -1, -1);
                }
            }
        }
        if (7 > px > 0) {
            if (board[px - 1][py] == 0) {
                addMove(px, py, -1, 0);
            } 
            else if ((board[px - 1][py] & mask1) != (p & mask1)) {
                addMove(px, py, -1, 0);
            }
            if (board[px][py] == 0) {
                addMove(px, py, 0, 0);
            } 
            else if ((board[px][py] & mask1) != (p & mask1)) {
                addMove(px, py, 0, 0);
            }
            if(board[px + 1][py] == 0) {
                addMove(px, py, 1, 0);
            }
            else if ((board[px + 1][py] & mask1) != (p & mask1)) {
                addMove(px, py, 1, 0);
            }
        }
        else if (px == 0) {
            if (board[px + 1][py] == 0){
                addMove(px, py, +1, 0);
            }
            else if ((board[px + 1][py] & mask1) != (p & mask1)) {
                addMove(px, py, +1, 0);
            }
        }
        else if (px == 7) {
            if (board[px - 1][py] == 0) {
                addMove(px, py, -1, 0);
            }
            else if ((board[px - 1][py] & mask1) != (p & mask1)) {
                addMove(px, py, -1, 0);
            }
        }

        // Castling
        if (!(p & mask5) && !checks[(p & mask1)]) {
            // White
            if ((p & mask1) == 0) {
                // Short
                int maybeRook = board[7][0];
                if (maybeRook & mask0) {
                    if ((maybeRook & pieceMask) == ROOK && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == (p & mask1)) {
                        if (board[5][0] == 0 && board[6][0] == 0) {
                            addMove(px, py, 2, 0, 0, 1);
                        }
                    }
                }

                // Long
                maybeRook = board[0][0];
                if (maybeRook & mask0) {
                    if ((maybeRook & pieceMask) == ROOK && (maybeRook & mask5) == 0 && (maybeRook & mask1)  == (p & mask1)) {
                        if (board[1][0] == 0 && board[2][0] == 0 && board[3][0] == 0) {
                            addMove(px, py, -2, 0, 0, 1);
                        }
                    }
                }
            }

            // Black
            if ((p & mask1) == 2) {
                // Short
                int maybeRook = board[7][7];
                if (maybeRook & mask0) {
                    if ((maybeRook & pieceMask) == ROOK && (maybeRook & mask5) == 0 && (maybeRook & mask1) == (p & mask1)) {
                        if (board[5][7] == 0 && board[6][7] == 0) {
                            addMove(px, py, 2, 0, 0, 1);
                        }
                    }
                }

                // Long
                maybeRook = board[0][7];
                if (maybeRook & mask0) {
                    if ((maybeRook & pieceMask) == ROOK && (maybeRook & mask5) == 0 && (maybeRook & mask1) == (p & mask1)) {
                        if (board[1][7] == 0 && board[2][7] == 0 && board[3][7] == 0) {
                            addMove(px, py, -2, 0, 0, 1);
                        }
                    }
                }
            }
        }
    }

    void calcPawn(int p, int px, int py, bool capleft=true, bool capright=true, bool control=false) {
        int m = (p & mask1) == 0 ? 1 : -1;

        // Captures
        if (px > 0) {
            if ((board[px - 1][py + m] != 0 && (board[px - 1][py + m] & mask1) != (p & mask1) && capleft || control) && capleft) {
                if ((!(p & mask6))/* || self.pinDirection == DIAGONALLEFT*/) {
                    addMove(px, py, -1, m, 1);
                    //var move = new Move(px, py, -1, m)
                    //move.isCapture = true
                    //move.captureType = board[px - 1][py + m].type
                    //plm.push(move)
                }
            }
        }
        if (px < 7) {
            if ((board[px + 1][py + m] != 0 && (board[px + 1][py + m] & mask1) != (p & mask1) || control) && capright) {
                if ((!(p & mask6))/* || self.pinDirection == DIAGONALRIGHT*/) {
                    addMove(px, py, 1, m, 1);
                    //var move = new Move(px, py, 1, m)
                    //move.isCapture = true
                    //move.captureType = captureType=board[px + 1][py + m].type
                    //plm.push(move)
                }
            }
        }
        if (board[px][py + m] == 0 && !control) {
            if (py == ((p & mask1) == 0 ? 6 : 1)) {
                if ((!(p & mask6))/* || self.pinDirection == VERTICAL*/) {
                    addMove(px, py, 0, m, 0, 1);
                    //addMove(px, py, -1, m, 0, 0);
                    //addMove(px, py, -1, m, 0, 1);
                    //addMove(px, py, -1, m, 0, 2);
                    //addMove(px, py, -1, m, 0, 3);
                    //plm.push(new Move(px, py, 0, m, isPromotion=true, promoteTo=QUEEN))
                    //plm.push(new Move(px, py, 0, m, isPromotion=true, promoteTo=KNIGHT))
                    //plm.push(new Move(px, py, 0, m, isPromotion=true, promoteTo=ROOK))
                    //plm.push(new Move(px, py, 0, m, isPromotion=true, promoteTo=BISHOP))
                }
            }
            else {
                if ((!(p & mask6))/* || self.pinDirection == VERTICAL*/) {
                    addMove(px, py, 0, m);
                }
            }
        }
        // First new Move 2 spaces
        if (!(p & mask5) && board[px][py + m] == 0 && board[px][py + 2*m] == 0 && py == ((p & mask1) == 0 ? 1 : 6) && !control) {
            if ((!(p & mask6))/* || self.pinDirection == VERTICAL*/) {
                addMove(px, py, 0, 2*m, 0);
            }
        }
        // En Passant
        if ((py == 4 || py == 3) && (previousMoveFlags & mask7) && !control) {
            if (px == 0 && (previousMoveFlags & prevXMask) == 1) {
                addMove(px, py, 1, m);
            }
            else if (px == 7 && (previousMoveFlags & prevXMask) == 6) {
                addMove(px, py, -1, m);
            }
            else if ((previousMoveFlags & prevXMask) == px + 1) {
                addMove(px, py, 1, m);
            }
            else if ((previousMoveFlags & prevXMask) == px - 1) {
                addMove(px, py, -1, m);
            }
        }
    }

    int* generateMoves(int px, int py, bool ignoreCheck=false, bool control=false) {
        // MARK: genMoves
        if (!control) {
            moves = 0;
        }
        int p = board[px][py];
        if ((p & pieceMask) == PAWN) {
            bool capLeft = true;
            bool capRight = true;
            if (p & mask6) {
                /*
                if (self.pinDirection == DIAGONALRIGHT) {
                    capRight = false;
                }
                if (self.pinDirection == DIAGONALLEFT) {
                    capLeft = false;
                }*/
            }
            calcPawn(p, px, py, capLeft, capRight, control);
        }
        else if ((p & pieceMask) == ROOK) {
            if ((p & mask6) /*&& (self.pinDirection == DIAGONALLEFT || self.pinDirection == DIAGONALRIGHT)*/) {
                return &(arr[0]);
            }
            else {
                calcRook(p, px, py, control);
            }
        }
        else if ((p & pieceMask) == QUEEN) {
            calcBishop(p, px, py, control);
            calcRook(p, px, py, control);
        }
        else if ((p & pieceMask) == BISHOP) {
            if ((p & mask6) /*&& (self.pinDirection == HORIZONTAL || self.pinDirection == VERTICAL)*/) {
                return &(arr[0]);
            }
            else {
                calcBishop(p, px, py, control);
            }
        }
        else if ((p & pieceMask) == KNIGHT) {
            if (p & mask6) {
                return &(arr[0]);
            }
            else {
                calcKnight(p, px, py, control);
            }
        }
        else if ((p & pieceMask) == KING) {
            calcKing(p, px, py);
            for (int i = 0; i < moves; i++) {
                int x = arr[i*6] + arr[i*6 + 2];
                int y = arr[i*6+1] + arr[i*6+3];
                int special = arr[i*6+5];
                bool check = false;
                if (true) {
                    for (int c = 0; c < controlMoves; c++) {
                        if (x == (controlArr[c*6] + controlArr[c*6 + 2]) && y == (controlArr[c*6 + 1] + controlArr[c*6 + 3])) {
                            check = true;
                            break;
                        } 
                    }
                    if (!check && special) {
                        if (arr[i*6 + 2] == 2) {
                            for (int c = 0; c < controlMoves; c++) {
                                if (x-1 == (controlArr[c*6] + controlArr[c*6 + 2]) && y == (controlArr[c*6 + 1] + controlArr[c*6 + 3])) {
                                    check = true;
                                    break;
                                }
                            }
                        }
                        else if (arr[i*6 + 3] == -2) {
                            for (int c = 0; c < controlMoves; c++) {
                                if (x+1 == (controlArr[c*6] + controlArr[c*6 + 2]) && y == (controlArr[c*6 + 1] + controlArr[c*6 + 3])) {
                                    check = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (check) {
                        for (int x = 0; x < 6; x++) {
                            arr[i * 6 + x] = 0;
                        }
                    }
                }
            }
        }
        // TODO: fix this up
        if (true) { //!ignoreCheck && !((p & pieceMask) == KING)
            if (true) { //checks[(p & mask1) >> 1]
                for (int i = 0; i < moves; i++) {
                    int x = arr[i*6] + arr[i*6+2];
                    int y = arr[i*6+1] + arr[i*6+3];
                    bool isAllowed = true;
                    if (checkingPieceToCapture[0] == x && checkingPieceToCapture[1] == y) {
                        isAllowed = true;
                    }
                    else {
                        for (int c = 0; c < checkStopMoves; c++) {
                            if (checkStop[c*2] == x && checkStop[c*2+1] == y) {
                                isAllowed = true;
                                break;
                            }
                        }
                    }
                    if (!isAllowed) {
                        for (int x = 0; x < 6; x++) {
                            arr[i * 6 + x] = 0;
                        }
                    }
                }
            }
        }
        return &(arr[0]);
    }

    void createPiece(int p, int px, int py) {
        board[px][py] = p;
    }

    int* getBoardOffset() {
        return &(board[0][0]);
    }

    int performMove(int oldX, int oldY, int newX, int newY, bool special=false) {
        // MARK: performMove
        int returnValue = board[newX][newY];
        board[newX][newY] = board[oldX][oldY];
        if (previousMoveFlags & mask7) {
            if (board[oldX][oldY] & mask1) { // Black en passant
                board[newX][newY + 1] = 0;
            }
            else { // White en passant
                board[newX][newY - 1] = 0;
            }
        }
        if (special) {
            if ((board[oldX][oldY] & pieceMask) == KING) {
                if (newX - oldX == 2) {
                    board[7][oldY] = 0;
                    board[5][oldY] |= (1u << 0); // Set occupied flag
                    board[5][oldY] |= board[oldX][oldY] & mask1; // Set color flag
                    board[5][oldY] |= ROOK;
                }
                else if (newX - oldX == -2) {
                    board[0][oldY] = 0;
                    board[3][oldY] |= (1u << 0); // Set occupied flag
                    board[3][oldY] |= board[oldX][oldY] & mask1; // Set color flag
                    board[3][oldY] |= ROOK;
                }
            }
        }
        previousMoveFlags = 0;
        previousMoveFlags |= newX;
        previousMoveFlags |= newY << 3;
        if ((board[oldX][oldY] & pieceMask) == PAWN && (oldY-newY == 2 || oldY-newY==-2)) {
            previousMoveFlags |= (1u << 7); // Set special flag
        }
        else {
            previousMoveFlags &= (1u << 7); // Clear special flag
        }
        board[newX][newY] |= (1u << 5); // Set hasMoved flag
        board[oldX][oldY] = 0;
        return returnValue;
    }

    int promoteMove(int oldX, int oldY, int newX, int newY, int promotionType) {
        int returnValue = board[newX][newY];
        board[newX][newY] = board[oldX][oldY] - (board[oldX][oldY] & pieceMask) + promotionType;
        previousMoveFlags = 0;
        previousMoveFlags |= newX;
        previousMoveFlags |= newY << 3;
        board[oldX][oldY] = 0;
        return returnValue;
    }

    void writeRow(int rowNumber, int data1, int data2, int data3, int data4, int data5, int data6, int data7, int data8) {
        board[rowNumber][0] = data1;
        board[rowNumber][1] = data2;
        board[rowNumber][2] = data3;
        board[rowNumber][3] = data4;
        board[rowNumber][4] = data5;
        board[rowNumber][5] = data6;
        board[rowNumber][6] = data7;
        board[rowNumber][7] = data8;
    }

    int calcControl(int color) {
        localCounter = 0;
        moves = 0;
        controlMoves = 0;
        for (int x = 0; x < 8; x++) {
            for (int y = 0; y < 8; y++) {
                if ((board[x][y] & mask0) && ((board[x][y] & mask1) >> 1) == color) {
                    oldMoveCount = moves;
                    generateMoves(x, y, false, true);
                    localCounter += (moves - oldMoveCount);
                }
            }
        }
        for (int i = 0; i < localCounter * 6; i++) {
            controlArr[i] = arr[i];
        }
        controlMoves = localCounter;
        return controlMoves;
    }
    int calcCheckDefenseSquares(int color) {
        // MARK: checkDefense
        localCounter = 0;
        moves = 0;
        checkStopMoves = 0;
        checkingPieces = 0;
        int checkCounter = 0;
        int moveX = 0;
        int moveY = 0;
        int x = 0;
        int y = 0;
        int dx = 0;
        int dy = 0;
        if (!checks[color]) {
            for (int x = 0; x < 8; x++) {
                for (int y = 0; y < 8; y++) {
                    if ((board[x][y] & mask0) && ((board[x][y] & mask1) >> 1) == color) {
                        oldMoveCount = moves;
                        generateMoves(x, y, true);
                        localCounter += (moves - oldMoveCount);
                        for (int i = 0; i < localCounter; i++) {
                            moveX = arr[i*6] + arr[i*6+2];
                            moveY = arr[i*6+1] + arr[i*6+3];
                            if ((board[moveX][moveY] & pieceMask) == KING) {
                                x = arr[i * 6 + 0];
                                y = arr[i * 6 + 1];
                                dx = arr[i * 6 + 2];
                                dy = arr[i * 6 + 3];
                                checkingPieceToCapture[0] = x;
                                checkingPieceToCapture[1] = y;
                                checkingPieces++;
                            }
                            if (checkingPieces > 1) {
                                return 0;
                            }
                        }
                    }
                }
            }            
            if (checkingPieces == 1) {
                checks[color] = true;
                if (dx != 0 && dy != 0) {
                    // Diagonal
                    if (dx > 0 && dy > 0) {
                        // Up Right
                        for (int z = 1; z < dx; z++) {
                            addCheckstopMove(x + z, y + z);
                        }
                    }
                    else if (dx < 0 && dy < 0) {
                        // Down Left
                        for (int z = 1; z < abs(dx); z++) {
                            addCheckstopMove(x - z, y - z);
                        }
                    }
                    else if (dx > 0 && dy < 0) {
                        // Down Right
                        for (int z = 1; z < abs(dx); z++) {
                            addCheckstopMove(x + z, y - z);
                        }
                    }
                    else if (dx < 0 && dy > 0) {
                        // Up Left
                        for (int z = 1; z < abs(dx); z++) {
                            addCheckstopMove(x - z, y + z);
                        }
                    }
                }
                else if (dx != 0) {
                    // Horizontal:
                    //print("horizontal")
                    int m = dx < 0 ? -1 : 1;
                    for (int z = 1; z < abs(dx); z++) {
                        addCheckstopMove(x + (m * z), y);
                    }
                }
                else if (dy != 0) {
                    // Vertical
                    //print("vertical")
                    int m = dy < 0 ? -1 : 1;
                    for (int z = 1; z < abs(dy); z++) {
                        addCheckstopMove(x, y + (m * z));
                    }
                }
                return checkStopMoves;
            }
            else {
                return 0;
            }
        }
        else {
            return 0;
        }
    }
}