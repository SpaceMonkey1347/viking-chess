

function rank_moves(side, board_ref) {
    const moves = legal_moves(side, board_ref)
    const pieces = Object.keys(moves.pieces)
    // console.log(pieces)
    for (const piece in moves.pieces) {
    }
}

/**
 * @param {number} side
 * @param {number[]} board_ref
 * @returns {number} score
 * @description
 * moves scores are calculated by summing the following:
 * win = infinity points
 * ally piece = +5000 points
 * enemy piece = -5000 points
 * possible capture = +1000 points
 * possible captured = -1000 points
 * king moves = 300 points each (-300 for white)
 * king distance from center = 1000 points per square
 * ally moves = +200 points each
 * enemy moves = -200 points each
 */
function score_position(side, board_ref) {
    let score = 0
    let white_count = 0
    let black_count = 0
    let white_moves = 0
    let black_moves = 0
    let king_moves = 0
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = board[square]
            // skip empty squares
            if (piece == e) { continue }

            const moves_len = piece_legal_moves(square, side, board_ref).length

            // increment sides

            if (piece == k) {
                black_count++
                black_moves += moves_len
                king_moves++
                continue
            } else if (piece == a) {
                white_count++
                white_moves += moves_len
            } else if (piece == d) {
                black_count++
                black_moves += moves_len
            }
        }
    }
    score += white_count * 5000
    score += black_count * -5000
    score += white_moves * 5
    score += black_moves * -5
    score += king_moves * -10
    return score
}


function best_move(board_ref=board, depth=2, side=black, alpha=-Infinity, beta=Infinity) {
    const moves = legal_moves_obj(side, board_ref)
    let best_move
    let best_score = side == white ? -Infinity : Infinity
    // console.log('side', side, 'bestscore', best_score)
    // const board_copy = JSON.parse(JSON.stringify(board_ref))
    for (const piece in moves.pieces) {
        for (const move in moves.pieces[piece].moves) {
            const cur_move = moves.pieces[piece].moves[move]

            const last_move = ai_make_move(Number(piece), cur_move, board_ref)
            // console.table(emoji_table(board_ref))
            const cur_score = minimax(board_ref, depth, Boolean(side), alpha, beta)
            ai_unmake_move(last_move, board_ref)
            // console.log(last_move, cur_score)

            // console.log('before', best_score, cur_score)
            best_score = side == white ? Math.max(cur_score, best_score) : Math.min(cur_score, best_score)
            // console.log('after max/min', best_score, cur_score)
            if (best_score == cur_score) {
                best_move = [Number(piece), cur_move]
                // console.log('new best move', best_move)
            }
        }
    }

    return best_move

}

function emoji_board(board_ref) {
    const new_board = new Array(rows)
    const emoji_map = {
        '0': '🟧',
        '1': '⚪',
        '2': '🔴',
        '3': '👑',
    }
    for (let row = 0; row < rows; row++) {
        new_board[row] = new Array(cols)
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = emoji_map[board_ref[square]]
            new_board[row][col] = piece
        }
    }
    return new_board
}

function ai_unmake_move(move, board_ref) {
    board_ref[move.start] = move.piece
    board_ref[move.end] = e

    for (const p in move.captures) {
        board_ref[move.captures[p].square] = move.captures[p].piece
    }
}

function ai_make_move(start_square, end_square, board_ref) {
    let move = {start: start_square, end: end_square}

    const piece = board_ref[start_square]
    move.piece = piece

    board_ref[end_square] = piece
    board_ref[start_square] = e

    const captures = get_captures(end_square)
    move.captures = {}
    for (const p in captures) {
        move.captures[p] = {}
        move.captures[p].square = captures[p]
        move.captures[p].piece = board_ref[captures[p]]
        board_ref[captures[p]] = e
    }
    return move
}


let move_counter = 0
let white_moves = 0
let black_moves = 0
let moves_pruned = 0
function minimax(board_ref, depth, maximizing, alpha, beta) {
    const win = is_win(Number(maximizing), board_ref)
    if (depth == 0 || win) {
        return score_position(maximizing, board_ref)
    }
    // move_counter++
    const moves = legal_moves(maximizing, board_ref)
    const moves_len = moves.length
    if (maximizing) {
        // white_moves++
        let max_eval = -Infinity
        for (let move_index = 0; move_index < moves_len; move_index++) {
            // const board_copy = JSON.parse(JSON.stringify(board_ref))
            const [start_square, end_square] = decode_move(moves[move_index])
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, false, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            max_eval = Math.max(max_eval, val)
            // pruning
            alpha = Math.max(alpha, val)
            if (beta <= alpha) { 
                // moves_pruned++
                break
            }
        }
        return max_eval
        
    } else {
        // black_moves++
        let min_eval = Infinity
        for (let move_index = 0; move_index < moves_len; move_index++) {
            // const board_copy = JSON.parse(JSON.stringify(board_ref))
            const [start_square, end_square] = decode_move(moves[move_index])
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, true, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            min_eval = Math.min(min_eval, val)
            // pruning
            beta = Math.min(beta, val)
            if (beta <= alpha) {
                // moves_pruned++
                break
            }
        }
        return min_eval
    }
}




/**
 * @param {number} side 
 * @param {Array<number>} [board_ref=board] 
 * @returns
 * cache
 *     .pieces
 *         ...[piece]: number
 *             .moves
 *                 ...[move]: number
 *                     .captures
 *                         ...[capture]: number
 *     .captures
 *         ...[capture]: number
 *             pieces
 *                 ...[piece]: number
 * @example
 * var cache = move_cache(side)
 * var enemy = 9
 * // see if piece at square 12 can capture enemy on square 9
 * if (cache.piece[12].moves[20].captures[enemy]) {
 *     console.log("enemy can be captured by piece at position 12")
 * }
 */
function move_cache(side=turn, board_ref=board) {
    const ally_pieces  = side == white ? [a] : [d, k]
    const enemy_pieces = side == white ? [d, k] : [a]
    const cache = {}

    // init piece data
    cache.pieces = {}
    // init capture data
    cache.captures = {}

    cache.ally_count = 0
    cache.ally_move_count = 0

    cache.enemy_count = 0
    cache.enemy_move_count = 0

    // loop through board
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)

            if (enemy_pieces.includes(board[square])) {
                cache.enemy_count += 1
                cache.enemy_move_count += piece_legal_moves(square, side^=1, board_ref).length
            }
            // loop through current player's pieces
            if (ally_pieces.includes(board[square])) {

                const piece_moves = piece_legal_moves(square, side, board_ref)
                const piece_moves_len = piece_moves.length

                cache.ally_move_count += piece_moves_len
                cache.ally_count += 1

                cache.pieces[square] = {}

                if (piece_moves_len == 0) { continue }

                // init piece moves
                cache.pieces[square].moves = {}

                // loop through piece's moves
                for (let i = 0; i < piece_moves_len; i++) {

                    const move = piece_moves[i]

                    // add move to piece's moves
                    cache.pieces[square].moves[move] = {}

                    // add captures
                    const captures = get_captures(piece_moves[i], side, board_ref)
                    const captures_len = captures.length
                    if (captures_len > 0) {
                        // add piece move and captures to moves
                        cache.pieces[square].moves[move].captures = captures

                        // add capture to moves.captures
                        for (let cap_index = 0; cap_index < captures_len; cap_index++) {
                            const capture = captures[cap_index]
                            if (!cache.captures[capture]) {
                                // init capturable piece to captures
                                cache.captures[capture] = {}
                                cache.captures[capture].pieces = []
                            }
                            // add captor to captures
                            cache.captures[capture].pieces.push(square)
                        }
                    }
                }

            }
        }
    }
    return cache
}
