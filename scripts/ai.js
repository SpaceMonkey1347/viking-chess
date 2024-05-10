
// // attacker
// const a = 1
// // defender
// const d = 2
// // king
// const k = 3
//
// const white = 0
// const black = 1
//
// const rows = 11
// const cols = 11
// const size = rows * cols - 1
//
// let tafl_board = new tafl_board
// tafl_board.init()



/*
Structure:

data
    .pieces
        "piece"... (board position)
            .moves
                "move"... (board position)
                    .captures
                        "capture"... (board position)
    captures
        "capture"... (board position)
            pieces
                "piece"... (board position)
*/


function move_cache(side) {
    side = side ? side : turn
    const ally_pieces = side == white ? [a] : [d, k]
    const data = {}

    // init piece data
    data.pieces = {}
    // init capture data
    data.captures = {}

    // loop through board
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // loop through current player's pieces
            if (ally_pieces.includes(board[row][col])) {

                const piece_pos = encode_sqaure(row, col)
                const piece_moves = piece_legal_moves(piece_pos)
                const piece_moves_len = piece_moves.length


                // add piece position
                data.pieces[piece_pos] = {}

                if (piece_moves_len == 0) { continue }

                // init piece moves
                data.pieces[piece_pos].moves = {}

                // loop through piece's moves
                for (let i = 0; i < piece_moves_len; i++) {
                    const move = piece_moves[i]
                    const captures = get_captures(piece_moves[i], side)

                    // add move to piece's moves
                    data.pieces[piece_pos].moves[move] = {}

                    const captures_len = captures.length
                    if (captures_len > 0) {
                        // add piece move and captures to moves
                        data.pieces[piece_pos].moves[move].captures = captures

                        // add capture to moves.captures
                        for (let cap_index = 0; cap_index < captures_len; cap_index++) {
                            const capture = captures[cap_index]
                            if (!data.captures[capture]) {
                                // add capturable piece to captures
                                data.captures[capture] = {}
                                data.captures[capture].pieces = []
                            }
                            data.captures[capture].pieces.push(piece_pos)
                        }
                    }
                }
            }
        }
    }
    return data
}

function eval_move() {

}

function min_max() {


}
