emcc -Os -s STANDALONE_WASM -s EXPORTED_FUNCTIONS="['_addMove', '_getMoveAmount', '_getData', '_getBoardOffset', '_writeRow', '_generateMoves', '_performMove']" -Wl,--no-entry "hello.cpp" -o "caesar.wasm"