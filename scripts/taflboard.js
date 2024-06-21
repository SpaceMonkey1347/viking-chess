

// TODO: encapsulate board
// function tafl_board() {

// rule flags

const rule_flags = {
    king_enter_thrown: true,
    enter_trap: false,
    hostile_towers: true,
    // TODO: same as the capture rule in Go
    stalemate_capture_flag: false,
}

// piece encoding

// empty
const emp = 0
// attacker
const att = 2
// defender
const def = 1
// king
const kng = 3

const white_pieces = [att]

const black_pieces = [def, kng]

// internal board

let board = [
    emp, emp, emp, att, att, att, att, att, emp, emp, emp,
    emp, emp, emp, emp, emp, att, emp, emp, emp, emp, emp,
    emp, emp, emp, emp, emp, emp, emp, emp, emp, emp, emp,
    att, emp, emp, emp, emp, def, emp, emp, emp, emp, att,
    att, emp, emp, emp, def, def, def, emp, emp, emp, att,
    att, att, emp, def, def, kng, def, def, emp, att, att,
    att, emp, emp, emp, def, def, def, emp, emp, emp, att,
    att, emp, emp, emp, emp, def, emp, emp, emp, emp, att,
    emp, emp, emp, emp, emp, emp, emp, emp, emp, emp, emp,
    emp, emp, emp, emp, emp, att, emp, emp, emp, emp, emp,
    emp, emp, emp, att, att, att, att, att, emp, emp, emp,
]

const rows = 11
const cols = 11
const size = rows * cols - 1
// const center = encode_sqaure(Math.floor(rows/2), Math.floor(cols/2))
const thrown = Math.floor(rows * cols / 2)

const towers = [
    // corners
    encode_sqaure(0, 0),
    encode_sqaure(0, cols - 1),
    encode_sqaure(rows - 1, 0),
    encode_sqaure(rows - 1, cols - 1),
    // center
    thrown
]

const corners = [
    encode_sqaure(0, 0),
    encode_sqaure(0, cols - 1),
    encode_sqaure(rows - 1, 0),
    encode_sqaure(rows - 1, cols - 1),
]

// moves

const white = 1
const black = 0

/**
* which player's turn is it
* white || black
* @type Number
*/
let turn = white

// board helper functions

/**
* @param {number} row
* @param {number} col
* @returns {number} square
* @example
* var square = encode_square(row, col)
*/
function encode_sqaure(row, col) {
    return row * rows + col
}

/**
* @param {number} square
* @returns {[number, number]} row, col
* @example
* var [row, col] = decode_square(square)
*/
function decode_sqaure(square) {
    return [Math.floor(square / rows), square % cols]
}

// moves are encoded in arabic notation, ie: (c1d1, f3f6, c4a4...)
// rows = ranks = ints, cols = files = chars
function encode_move(start_square, end_square) {
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const start_file = String.fromCharCode(start_col + 'a'.charCodeAt(0))
    const end_file = String.fromCharCode(end_col + 'a'.charCodeAt(0))
    const start_rank = (start_row + 1).toString()
    const end_rank = (end_row + 1).toString()
    const encoded_start = start_file + start_rank
    const encoded_end = end_file + end_rank
    const move = encoded_start + encoded_end
    return move
}

/**
 * @param {string} move 
 * @returns {number[]} move_start, move_end
 */
function decode_move(move) {
    /** @param {string} char */
    const is_letter = (char) => char.match(/[a-z]/i);
    const squares = new Array(2)
    let count = -1

    for (let i = 0; i < move.length; i++) {
        if (is_letter(move.charAt(i))) {
            count++
            squares[count] = move.charCodeAt(i) - 'a'.charCodeAt(0)
        } else {
            let str_num = ''
            str_num += move.charAt(i)
            while (i < move.length && !isNaN(move.charAt(i + 1))) {
                i++
                str_num += move.charAt(i)
            }
            squares[count] += (parseInt(str_num) - 1) * cols
        }
    }
    return squares
}

/**
 * @param {number} square
 * @returns boolean
 */
function in_board(square) {
    return square >= 0 && square <= size
}

function is_adjacent(square, target) {
    if (!in_board(square) || !in_board(target)) { return false }
    const above = () => { return square - target == cols && square - rows >= 0 }
    const left = () => { return square - target == 1 && square % cols != 0 }
    const right = () => { return square - target == -1 && square % cols != cols - 1 }
    const below = () => { return square - target == -(cols) && square + rows <= size }
    return above() || left() || right() || below()
}

function adjacent_squares(square) {
    const valid = {}
    const adjacent = {
        top: square - rows,
        left: square - 1,
        right: square + 1,
        bottom: square + rows,
    }
    for (const dir in adjacent) {
        const candidate = adjacent[dir]
        if (is_adjacent(square, candidate)) {
            valid[dir] = candidate
        }
    }
    return valid
}

function adjacent_pieces(square, board_ref) {
    const adj_squares = adjacent_squares(square)
    const adj_pieces = {}
    for (const dir in adj_squares) {
        adj_pieces[dir] = board_ref[adj_squares[dir]]
    }
    return adj_pieces
}

// game logic


/** TODO: rewrite this
 * legal moves for a piece
 * @param {number} square
 * @returns {number[]} moves
 */
function piece_legal_moves(square, board_ref = board) {
    const moves = []
    const [row, col] = decode_sqaure(square)
    const cur_piece = board[square]
    if (cur_piece == emp) { return moves }
    // horizontal
    for (let j = col + 1; j < cols; j++) {
        const cur_square = encode_sqaure(row, j)
        const prev_square = encode_sqaure(row, j - 1)
        if (board_ref[cur_square] != emp) { break }
        if (validate_move(prev_square, cur_square, board_ref, cur_piece)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    for (let j = col - 1; j >= 0; j--) {
        const cur_square = encode_sqaure(row, j)
        const prev_square = encode_sqaure(row, j + 1)
        if (board_ref[cur_square] != emp) { break }
        if (validate_move(prev_square, cur_square, board_ref, cur_piece)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    // vertical
    for (let i = row + 1; i < rows; i++) {
        const cur_square = encode_sqaure(i, col)
        const prev_square = encode_sqaure(i - 1, col)
        if (board_ref[cur_square] != emp) { break }
        if (validate_move(prev_square, cur_square, board_ref, cur_piece)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    for (let i = row - 1; i >= 0; i--) {
        const cur_square = encode_sqaure(i, col)
        const prev_square = encode_sqaure(i + 1, col)
        if (board_ref[cur_square] != emp) { break }
        if (validate_move(prev_square, cur_square, board_ref, cur_piece)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    return moves
}

/** 
 * @param {number} target_square 
 * @param {number} piece 
 * @param {number[]} [board_ref=board] 
 */
function is_path_obstructed(target_square, piece, board_ref = board) {
    let in_tower = target_square == thrown
    if (rule_flags.king_enter_thrown) {
        in_tower = in_tower && piece != kng
    }
    const is_empty = board_ref[target_square] != emp
    return (in_tower || is_empty)
}

/**
 * @param {number} square 
 * @param {number[]} enemy_pieces 
 * @param {number} dir_incr 
 * @param {number[]} board_ref 
 */
function is_self_capture(square, enemy_pieces, dir_incr, board_ref) {
    if (rule_flags.enter_hostile_flag) { return false }
    if (board_ref[square] == kng) { return false }
    const piece_before = is_adjacent(square, square - dir_incr) ? board_ref[square - dir_incr] : emp
    const piece_after = is_adjacent(square, square + dir_incr) ? board_ref[square + dir_incr] : emp
    const block_before = (enemy_pieces.includes(piece_before) || towers.includes(square - dir_incr))
    const block_after = (enemy_pieces.includes(piece_after) || towers.includes(square + dir_incr))
    if (block_before && block_after) { return true }
    return false
}


/**
 * is move legal
 * @param {number} start_square
 * @param {number} end_square
 * @param {number|null} piece_override
*/
function validate_move(start_square, end_square, board_ref = board, piece_override = null) {

    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const row_diff = end_row - start_row
    const col_diff = end_col - start_col
    const piece = piece_override ? piece_override : board_ref[start_square]
    const side = piece == att ? white : black
    const enemy_pieces = side == white ? black_pieces : white_pieces
    const diff = end_square - start_square

    // ensure move
    if (start_square == end_square) { return false }

    // ensure turn
    if (enemy_pieces.includes(piece)) { return false }

    // ensure piece
    if (piece == emp) { return false }

    // ensure orthaginal
    if (row_diff != 0 && col_diff != 0) { return false }

    // ensure only king can enter a tower
    if (towers.includes(end_square) && piece != kng) { return false }

    // calc directional increment for move
    // first () part gives sign +1 or -1
    // second () part gives either 1 or cols
    const incr = ((diff >> 31) * 2 + 1) * (Number(!(diff % cols)) * (cols - 1) + 1)

    const adj_incr = Math.abs(incr % cols) * 10 + 1

    if (piece != kng && is_self_capture(end_square, enemy_pieces, adj_incr, board_ref)) { return false }

    for (let cur_square = start_square + incr; cur_square != end_square + incr; cur_square += incr) {
        if (is_path_obstructed(cur_square, piece, board_ref)) { return false }
    }

    return true
}

function get_captures(end_square, side = turn, board_ref = board) {
    const captures = []
    const ally_pieces = side == white ? white_pieces : black_pieces
    const adj_squares = adjacent_squares(end_square)

    // return adjacent square in a direction
    const step = (square, dir) => {
        let next_square
        switch (dir) {
            case 'top':
                next_square = square - rows
                break;
            case 'left':
                next_square = square - 1
                break;
            case 'right':
                next_square = square + 1
                break;
            case 'bottom':
                next_square = square + rows
                break;
            default:
                console.warn('invalid direction', dir)
                break;
        }
        if (is_adjacent(square, next_square)) { return next_square }
    }

    check_adj_squares:
    for (const dir in adj_squares) {
        const cur_square = adj_squares[dir]
        const cur_piece = board_ref[cur_square]
        // skip empty
        if (!cur_piece) continue
        // skip adjacent allies
        if (ally_pieces.includes(cur_piece)) continue
        if (cur_piece == kng) {
            // check king capture
            const kings_neighbours = adjacent_squares(cur_square)
            for (const square in kings_neighbours) {
                if (board_ref[kings_neighbours[square]] != att) {
                    continue check_adj_squares
                }
            }
            captures.push(cur_square)
            continue
        }
        // take another step
        const next_square = step(cur_square, dir)
        const next_piece = board_ref[next_square]
        if (rule_flags.hostile_tower_flag) {
            if (corners.includes(next_square)) {
                captures.push(cur_square)
                continue
            }
        }
        // add piece to captures if next piece is yours
        if (ally_pieces.includes(next_piece)) {
            captures.push(cur_square)
        }
    }

    return captures
}

/**
 * @param {number} side 
 * @param {number[]} board_ref 
 */
function check_win(side, board_ref) {
    // win condition flags
    let stalemate_flag = true
    let king_captured_flag = true
    side = Number(side)
    const enemy_pieces = side == white ? black_pieces : white_pieces
    if (side == black) {
        king_captured_flag = false
        // check if king castled
        for (let i = 0; i < corners.length; i++) {
            const piece = board_ref[corners[i]]
            if (piece == kng) {
                return true
            }
        }
    }
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = board_ref[square]
            if (side == white) {
                // is king on board
                if (piece == kng) {
                    king_captured_flag = false
                }
            }
            // check opponent's legal moves
            if (enemy_pieces.includes(piece) && stalemate_flag) {
                const square = encode_sqaure(row, col)
                const valid_moves = piece_legal_moves(square, board_ref)
                if (valid_moves.length > 0) {
                    stalemate_flag = false
                }
            }
            // break early if flags are tripped
            if ((side == black || !king_captured_flag) && !stalemate_flag) {
                break
            }
        }
    }
    if (king_captured_flag) { return true }
    if (stalemate_flag) { return true }
    return false
}

/**
 * @param {number} valid_start_square 
 * @param {number} valid_end_square 
 * @param {number[]} [board_ref=board] 
 */
function make_move(valid_start_square, valid_end_square, board_ref = board) {

    const piece = board_ref[valid_start_square]
    board_ref[valid_end_square] = piece
    board_ref[valid_start_square] = emp

    const captures = get_captures(valid_end_square)

    for (const p in captures) {
        board_ref[captures[p]] = emp
    }

    return captures
}

/**
 * player's legal moves in algebraic notation
 */
function legal_moves(side = turn, board_ref = board) {
    const ally_pieces = side == white ? white_pieces : black_pieces
    const moves = []
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            if (!ally_pieces.includes(board_ref[square])) { continue }
            const piece_moves = piece_legal_moves(square, board_ref)
            for (const move in piece_moves) {
                moves.push(encode_move(square, piece_moves[move]))
            }
        }
    }
    return moves
}

