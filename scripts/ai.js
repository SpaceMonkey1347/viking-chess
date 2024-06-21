
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
function score_position(board_ref=board, debug_flag=false) {
    let score = 0
    let white_count = 0
    let black_count = 0
    // let white_moves = 0
    // let black_moves = 0
    // let king_moves = 0
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = board[square]
            // skip empty squares
            if (piece == emp) { continue }

            // increment sides

            if (piece == kng) {
                black_count++
                // king_moves += piece_valid_move_count(square, black, board_ref)
            } else if (piece == att) {
                white_count++
                // white_moves += piece_valid_move_count(square, white, board_ref)
            } else if (piece == def) {
                black_count++
                // black_moves += piece_valid_move_count(square, black, board_ref)
            }
        }
    }
    score += white_count * 5000
    score += black_count * -5000
    // score += white_moves * 5
    // score += black_moves * -5
    // score += king_moves * -10
    if (debug_flag) {
        // console.log('score', score, 'white_count', white_count, 'black_count', black_count, 'white_moves', white_moves, 'black_moves', black_moves, 'king_moves', king_moves)
        console.log('score_position()', 'score', score, 'white_count', white_count, 'black_count', black_count)
    }
    return score
}

let plies_completed = 0
let white_moves_completed = 0
let black_moves_completed = 0
let moves_pruned = 0
let white_moves_pruned = 0
let black_moves_pruned = 0

function best_move(board_ref=board, side=black) {
    let best_move

    if (side == black) {
        const moves = legal_moves(black, board_ref)
        let best_score = Infinity
        best_move = moves[0]
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            const last_move = ai_make_move(start_square, end_square)
            const val = minimax(board_ref, 2, true, -Infinity, Infinity)

            // console.log('best_move()', 'best_score', best_score, 'cur_score', val, 'initial_score', score_position(board_ref, true))
            // console.log(move)
            // console.table(emoji_board(board_ref))

            ai_unmake_move(last_move, board_ref)
            if (val < best_score) {
                best_score = val
                best_move = move
            }
        }
    } else {
        const moves = legal_moves(white, board_ref)
        let best_score = -Infinity
        best_move = moves[0]
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            const last_move = ai_make_move(start_square, end_square)
            const val = minimax(board_ref, 2, false, -Infinity, Infinity)

            // console.log('best_move()', 'best_score', best_score, 'cur_score', val, 'initial_score', score_position(board_ref, true))
            // console.log(move)
            // emoji_board(board_ref)

            ai_unmake_move(last_move, board_ref)
            if (val < best_score) {
                best_score = val
                best_move = move
            }
        }
    }
    return best_move
}

/**
 * @param {number[]} board_ref 
 * @param {number} depth 
 * @param {boolean} maximizing 
 * @param {number} alpha 
 * @param {number} beta 
 */
function minimax2(board_ref, depth, maximizing, alpha, beta) {
    const side = Number(maximizing)
    const win = check_win(side, board_ref)
    if (depth == 0 || win) {
        if (win) { return Infinity * ((Number(maximizing) * 2) - 1) }
        return score_position(board_ref)
    }
    const moves = legal_moves(side, board_ref)
    plies_completed++
    if (maximizing) {
        let max_eval = -Infinity
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, false, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            // max_eval = Math.max(max_eval, val)
            if (val > max_eval) {
                max_eval = val
            }
            // pruning
            alpha = Math.max(alpha, val)
            if (beta <= alpha) { 
                moves_pruned++
                white_moves_pruned++
                break
            }
        }
        white_moves_completed++
        return max_eval
        
    } else {
        let min_eval = Infinity
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, true, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            // min_eval = Math.min(min_eval, val)
            if (val < min_eval) {
                min_eval = val
            }
            // pruning
            beta = Math.min(beta, val)
            if (beta <= alpha) {
                moves_pruned++
                black_moves_pruned++
                break
            }
        }
        black_moves_completed++
        return min_eval
    }
}

/**
 * @param {number[]} board_ref 
 * @param {number} depth 
 * @param {boolean} maximizing 
 * @param {number} alpha 
 * @param {number} beta 
 */
function minimax(board_ref, depth, maximizing, alpha, beta) {
    const side = Number(maximizing)
    const win = check_win(side, board_ref)
    if (depth == 0 || win) {
        if (win) { return Infinity * ((Number(maximizing) * 2) - 1) }
        return score_position(board_ref)
    }
    const moves = legal_moves(side, board_ref)
    plies_completed++
    if (maximizing) {
        let max_eval = -Infinity
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, false, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            // max_eval = Math.max(max_eval, val)
            if (val > max_eval) {
                max_eval = val
            }
            // pruning
            alpha = Math.max(alpha, val)
            if (beta <= alpha) { 
                moves_pruned++
                white_moves_pruned++
                break
            }
        }
        white_moves_completed++
        return max_eval
        
    } else {
        let min_eval = Infinity
        for (const move of moves) {
            const [start_square, end_square] = decode_move(move)
            // the meat
            const l_move = ai_make_move(start_square, end_square, board_ref)
            const val = minimax(board_ref, depth - 1, true, alpha, beta)
            ai_unmake_move(l_move, board_ref)
            // min_eval = Math.min(min_eval, val)
            if (val < min_eval) {
                min_eval = val
            }
            // pruning
            beta = Math.min(beta, val)
            if (beta <= alpha) {
                moves_pruned++
                black_moves_pruned++
                break
            }
        }
        black_moves_completed++
        return min_eval
    }
}

/**
 * @param {number[]} board_ref 
 * @param {object} move 
 */
function ai_unmake_move(move, board_ref) {
    board_ref[move.start] = move.piece
    board_ref[move.end] = emp

    for (const p in move.captures) {
        board_ref[move.captures[p].square] = move.captures[p].piece
    }
}

/**
 * @param {number} start_square 
 * @param {number} end_square 
 * @param {number[]} [board_ref=board]
 */
function ai_make_move(start_square, end_square, board_ref=board) {
    const move = {start: start_square, end: end_square}

    const piece = board_ref[start_square]
    move.piece = piece

    board_ref[end_square] = piece
    board_ref[start_square] = emp

    const captures = get_captures(end_square)
    move.captures = {}
    for (const p in captures) {
        move.captures[p] = {}
        move.captures[p].square = captures[p]
        move.captures[p].piece = board_ref[captures[p]]
        board_ref[captures[p]] = emp
    }
    return move
}
/**
 * @param {number[]} board_ref 
 * @returns void
 * @description prints board to console using emoji
 */
function emoji_board(board_ref) {
    const new_board = new Array(rows)
    const emoji_map = {
        [emp]: '🟧',
        [att]: '⚪',
        [def]: '🔴',
        [kng]: '👑',
    }
    for (let row = 0; row < rows; row++) {
        new_board[row] = new Array(cols)
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = emoji_map[board_ref[square]]
            new_board[row][col] = piece
        }
    }
    console.table(new_board)
}

function get_game_state(board_ref, side) {
    const state = {
        white: {
            piece_count: 0,
            pieces: [],
        },
        black: {
            piece_count: 0,
            pieces: [],
            king: {
                square: null,
                moves: [],
            },
        },
        board: {
            squares: [],
        },
        turn: side,
    }

    for (const square in board_ref) {
        const piece = board_ref[square]
        const piece_side = piece == att ? "white" : "black"
        const side_pieces = state[piece_side].pieces
        side_pieces.push({
            square: square,
        })
    }

    return state
}

function get_square_state(square) {
    const square_state = {
        piece: emp,
        piece_id: null,
        white_trap: false,
        black_trap: false,
    }
}

// piece interaction definitions
// hostile: 
// treat: can capture next move

/**
 * @param {number[]} [board_ref=board] 
 * @param {number} side 
 */
function game_state_init(board_ref = board, side = turn) {

    const piece_state = {
        piece: emp,
        square: null,
        row: null,
        col: null,
        index: null,
        moves: {
            row: new Array(rows).fill(true),
            col: new Array(cols).fill(true),
        },
        // index or square?
        nearest_pieces: {
            top: null,
            left: null,
            right: null,
            bottom: null,
        },
        // nearest_allies: {
        //     top: null,
        //     left: null,
        //     right: null,
        //     bottom: null,
        // },
    }

    const square_state = {
        // piece_state.piece
        piece: emp,
        // state[side]
        piece_side: null,
        // state[side].pieces[index]
        piece_index: null,
        white_hostile: false,
        black_hostile: false,
    }

    const board_state = new Array(size).fill(square_state)

    const state = {
        // side
        white: {
            // amount of pieces
            piece_count: 0,
            // amount of moves
            move_total: 0,
            // moves that have captures
            treat_move_total: 0,
            // captures in moves
            treat_capture_total: 0,
            // pieces: new Array(24).fill(piece_state),
            pieces: [],
        },
        black: {
            piece_count: 0,
            move_total: 0,
            treat_move_total: 0,
            treat_capture_total: 0,
            // pieces: new Array(13).fill(piece_state),
            pieces: [],
        },
        boad: board_state,
        turn: side,
    }

    for (let square = 0; square < size; square++) {

        // TODO: hostile (adjacent to capturable enemies) and treats
        // pieces that can access a given board square in board object

        const piece = board_ref[square]
        const side = piece == att ? white : black
        const side_key = side == white ? "white" : "black"
        const moves = piece_legal_moves(square)
        const moves_len = moves.length

        // all threats of piece
        const treats = {}
        let treats_move_len = 0
        let treats_capture_len = 0
        for (const move of moves) {
            const move_captures = get_captures(move, side, board_ref)
            const move_captures_len = move_captures.length
            if (move_captures_len > 0) {
                treats[move] = move_captures
                treats_capture_len += move_captures_len
                treats_move_len++
            }

        }

        // update state

        // state.board[square].piece = piece

        if (piece == emp) { continue }

        // state[side_key].piece_count++
        // state[side_key].move_total += moves_len
        // state[side_key].treat_move_total += treats_capture_len
        // state[side_key].treat_capture_total += treats_move_len

        // (state[side_key].pieces).push({
        //     piece: piece,
        //     square: square,
        //     index: state[side_key].length,
        // })


        // state[side_key][square] = {
        //     piece: piece,
        //     moves_len: moves_len,
        //     treats_move_len: treats_move_len,
        //     treats_capture_len: treats_capture_len,
        //     neighbours: neighbours,
        //     moves: moves,
        //     treats: treats,
        // }

    }
    return state
}

function game_state_make_move(start_square, end_square, captures, state) {
    state.turn ^= state.turn
    return state
}

function game_state_unmake_move(start_square, end_square, captures, state) {
    state.turn ^= state.turn
    return state
}
