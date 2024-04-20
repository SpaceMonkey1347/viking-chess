const boardEl = document.getElementById('tafl-board')
let selectedPiece

// piece encoding

// empty
const e = 0
// attacker
const d = 1
// defender
const a = 2
// king
const k = 3

// gui element encoding

// move-dest
const m = 4
// ghost
const g = 5

// highlight move
const b = 6
const f = 7

// piece/element encodings to corresponding css classes
const css_elements = {
    [e]: '',
    [d]: 'attacker',
    [a]: 'defender',
    [k]: 'king',
    [m]: 'move-dest',
    [g]: 'ghost',
    [b]: 'start-square',
    [f]: 'end-square',
}

const GhostEl = create_piece(g, 0, 0)

// side to move
const white = 1
const black = 0

let turn = white

const rows = 11
const cols = 11

const size = rows * cols - 1

// internal board

const board = [
    [e, e, e, a, a, a, a, a, e, e, e],
    [e, e, e, e, e, a, e, e, e, e, e],
    [e, e, e, e, e, e, e, e, e, e, e],
    [a, e, e, e, e, d, e, e, e, e, a],
    [a, e, e, e, d, d, d, e, e, e, a],
    [a, a, e, d, d, k, d, d, e, a, a],
    [a, e, e, e, d, d, d, e, e, e, a],
    [a, e, e, e, e, d, e, e, e, e, a],
    [e, e, e, e, e, e, e, e, e, e, e],
    [e, e, e, e, e, a, e, e, e, e, e],
    [e, e, e, a, a, a, a, a, e, e, e],
]


const center = encode_sqaure(Math.floor(rows/2), Math.floor(cols/2))

const towers = [
    // corners
    encode_sqaure(0,0),
    encode_sqaure(0, cols-1),
    encode_sqaure(rows-1, 0),
    encode_sqaure(rows-1, cols-1),
    // center
    center
]

const corners = [
    encode_sqaure(0,0),
    encode_sqaure(0, cols-1),
    encode_sqaure(rows-1, 0),
    encode_sqaure(rows-1, cols-1),
]

// store selected square
let move_start = -1, move_end = -1

const move_stack = []

// board helper functions

function encode_sqaure(row, col) {
    return row * rows + col
}

function decode_sqaure(square) {
    return [Math.floor(square / rows), square % cols]
}

function in_board(square) {
    return square >= 0 && square < size
}

function get_piece(square) {
    if (!in_board(square)) return e
    const [row, col] = decode_sqaure(square)
    return board[row][col]
}

function is_adjacent(square, target) {
    if (!in_board(square) || !in_board(target)) return false
    const above = () => { return square - target == cols    && square - rows >  0 }
    const left  = () => { return square - target == 1       && square % cols != 0 }
    const right = () => { return square - target == -1      && square % cols != cols - 1 }
    const below = () => { return square - target == -(cols) && square + rows <  size }
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
    for (s in adjacent) {
        const q = adjacent[s]
        if (is_adjacent(square, q)) {
            valid[s] = q
        }
    }
    return valid
}

// game logic

function legal_moves(square) {
    const moves = []
    const [row, col] = decode_sqaure(square)
    const cur_piece = board[row][col]
    if (cur_piece == e) return moves
    // vertical
    for (let i = row + 1; i < rows; i++) {
        const cur_square = encode_sqaure(i, col)
        if (legal_move(square, cur_square)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    for (let i = row - 1; i >= 0; i--) {
        const cur_square = encode_sqaure(i, col)
        if (legal_move(square, cur_square)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    // horizontal
    for (let j = col + 1; j < cols; j++) {
        const cur_square = encode_sqaure(row, j)
        if (legal_move(square, cur_square)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    for (let j = col - 1; j >= 0; j--) {
        const cur_square = encode_sqaure(row, j)
        if (legal_move(square, cur_square)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    return moves
}

function legal_move(start_square, end_square) {

    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const row_diff = end_row - start_row
    const col_diff = end_col - start_col
    const piece = board[start_row][start_col]
    const enemy_pieces = turn == white ? [a, k] : [d]

    // ensure move
    if (start_square == end_square) return false

    // ensure turn
    if (enemy_pieces.includes(piece)) return false

    // ensure piece
    if (board[start_row][start_col] == e) {
        return false
    }

    // ensure orthaginal
    if (row_diff != 0 && col_diff != 0) {
        return false
    }

    // ensure only king can enter a castle
    if (towers.includes(end_square) && piece != k) {
        return false
    }

    if (row_diff == 0) {
        if (vertical_sandwich(end_square, enemy_pieces)) {
            if (piece != k) {
                return false
            }
        }
        for (let left = start_square - 1; left >= end_square; left--) {
            if (path_obstructed(left)) return false
        }
        for (let right = start_square + 1; right <= end_square; right++) {
            if (path_obstructed(right)) return false
        }
    } else if (col_diff == 0) {
        if (horizontal_sandwich(end_square, enemy_pieces)) {
            if (piece != k) {
                return false
            }
        }
        for (let up = start_square - cols; up >= end_square; up-=cols) {
            if (path_obstructed(up)) return false
        }
        for (let down = start_square + cols; down <= end_square; down+=cols) {
            if (path_obstructed(down)) return false
        }
        // not orthaginal
    } else return false

    return true

    function path_obstructed(square) {
        const [row, col] = decode_sqaure(square)
        const in_tower = (square == center)
        const is_empty = board[row][col] != e
        return (in_tower || is_empty)
    }

}

function vertical_sandwich(square, enemy_pieces) {
    const piece_up   = is_adjacent(square - cols, square) ? get_piece(square - cols) : e
    const piece_down = is_adjacent(square + cols, square) ? get_piece(square + cols) : e
    if (enemy_pieces.includes(piece_up) && enemy_pieces.includes(piece_down)) return true
    return false
}

function horizontal_sandwich(square, enemy_pieces) {
    const piece_left  = is_adjacent(square - 1, square) ? get_piece(square - 1) : e
    const piece_right = is_adjacent(square + 1, square) ? get_piece(square + 1) : e
    if (enemy_pieces.includes(piece_left) && enemy_pieces.includes(piece_right)) return true
    return false
}

function get_captures(end_square) {
    const captures = []
    const ally_pieces  = turn == white ? [d] : [a, k]
    const enemy_pieces = turn == white ? [a, k] : [d]
    const adj_squares = adjacent_squares(end_square)
    
    // return adjacent square in a direction
    const step = (square, dir) => {
        let next_square
        if      (dir == 'top')    next_square = square - rows
        else if (dir == 'left')   next_square = square - 1
        else if (dir == 'right')  next_square = square + 1
        else if (dir == 'bottom') next_square = square + rows
        if (is_adjacent(square, next_square)) return next_square
    }

    check_adj_squares:
    for (dir in adj_squares) {
        const cur_square = adj_squares[dir]
        const cur_piece = get_piece(cur_square)
        // skip empty
        if (!cur_piece) continue
        // skip ally
        if (!enemy_pieces.includes(cur_piece)) continue
        if (cur_piece == k) {
            // check king capture
            const kings_neighbours = adjacent_squares(cur_square)
            for (square in kings_neighbours) {
                if (get_piece(kings_neighbours[square]) != d) {
                    continue check_adj_squares
                }
            }
            captures.push(cur_square)
            continue
        }
        // take another step
        const next_square = step(cur_square, dir)
        const next_piece = get_piece(next_square)
        // add piece to captures if next piece is yours
        if (ally_pieces.includes(next_piece)) captures.push(cur_square)
    }

    return captures
}

function is_win(player) {

    // win condition flags
    let stalemate_flag = true
    let king_captured_flag = true

    const enemy_pieces = player == white ? [a, k] : [d] 

    if (player == black) {
        king_captured_flag = false
        // check if king castled
        for (let i = 0; i < corners.length; i++) {
            const piece = get_piece(corners[i])
            if (piece == k) {
                return true
            }
        }
    }

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const piece = board[row][col]

            if (player == white) {
                // is king on board
                if (piece == k) {
                    king_captured_flag = false
                }
            }

            // check opponent's legal moves
            if (enemy_pieces.includes(piece)) {
                turn = !turn
                const square = encode_sqaure(row,col)
                const legal = legal_moves(square)
                turn = !turn
                if (legal.length > 0) {
                    stalemate_flag = false
                }
            }

            // break early if flags are tripped
            if ((player == black || !king_captured_flag) && !stalemate_flag) {
                break
            }

        }
    }

    if (king_captured_flag) {
        console.log('king captured')
        return true
    }

    if (stalemate_flag) {
        return true
    }

    return false
}

// TODO: move_stack
function add_move(move) {
}
function undo_move() {
}
function first_move() {
}
function last_move() {
}
function next_move() {
}
function prev_move() {
}

// DOM manipulation

function draw_board() {
    boardEl.innerHTML = ''
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = board[row][col]
            // skip empty
            if (piece == e) continue
            // add to board
            const pieceEl = create_piece(piece, row, col)
            boardEl.appendChild(pieceEl)
        }
    }
}

function create_piece(piece, row, col) {
    const pieceEl = document.createElement('div')
    pieceEl.className = css_elements[piece]
    pieceEl.style.transform = `translate(${100 * col}%,${100 * row}%)`
    return pieceEl
}

function move_piece(elem) {
    const [start_row, start_col] = decode_sqaure(move_start)
    const [end_row, end_col] = decode_sqaure(move_end)
    elem.style.transform = `translate(${100 * end_col}%,${100 * end_row}%)`
    const piece = board[start_row][start_col]
    board[start_row][start_col] = e
    board[end_row][end_col] = piece
}

function piece_from_square(square) {
    const rect = boardEl.getBoundingClientRect()
    const board_height = rect.height
    const board_width = rect.width
    const cell_height = board_height / rows
    const cell_width = board_width / cols
    const x0 = rect.left
    const y0 = rect.top
    const [row, col] = decode_sqaure(square)
    const x_pos = col * cell_width + col/2 + x0
    const y_pos = row * cell_height + row/2 + y0
    const piece_el = document.elementFromPoint(x_pos, y_pos)
    return piece_el
}

function remove_piece(square) {
    const rect = boardEl.getBoundingClientRect()
    const board_height = rect.height
    const board_width = rect.width
    const cell_height = board_height / rows
    const cell_width = board_width / cols
    const x0 = rect.left
    const y0 = rect.top
    const [row, col] = decode_sqaure(square)
    const x_pos = col * cell_width + col/2 + x0
    const y_pos = row * cell_height + row/2 + y0
    const piece_el = document.elementFromPoint(x_pos, y_pos)
    piece_el.remove()
    board[row][col] = e
}

function draw_highlight_move() {
    const [start_row, start_col] = decode_sqaure(move_start)
    const [end_row, end_col] = decode_sqaure(move_end)
    const startEl = create_piece(b, start_row, start_col)
    const endEl = create_piece(f, end_row, end_col)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
    boardEl.appendChild(startEl)
    boardEl.appendChild(endEl)
}

function remove_highlight_move() {
    const elems = boardEl.querySelectorAll(`.${css_elements[b]}, .${css_elements[f]}`)
    elems.forEach(element => {
        element.remove()
    });
}

// TODO: low priority
function draw_highlight_capture() {
}
function remove_highlight_capture() {
}


function draw_legal_moves(moves) {
    for (let i = 0; i < moves.length; i++) {
        const [row, col] = decode_sqaure(moves[i])
        const elem = document.createElement('div')
        elem.className = css_elements[m]
        elem.style.transform = `translate(${100 * col}%,${100 * row}%)`
        boardEl.appendChild(elem)
    }
}

function remove_legal_moves() {
    const elems = boardEl.querySelectorAll(`.${css_elements[m]}`)
    elems.forEach(element => {
        element.remove()
    });
}

function select_square(event) {
    const rect = boardEl.getBoundingClientRect()
    const board_height = rect.height
    const board_width = rect.width
    const mouse_x = event.clientX - rect.left
    const mouse_y = event.clientY - rect.top
    const cell_width = board_width / cols
    const cell_height = board_height / rows
    const cell_row = Math.floor(mouse_y / cell_height)
    const cell_col = Math.floor(mouse_x / cell_width)
    return encode_sqaure(cell_row, cell_col)
}

function draw_ghost(event, piece) {
    GhostEl.style.pointerEvents = 'none'
    GhostEl.id = 'ghost'
    // GhostEl.style.display = 'none'
    GhostEl.className = css_elements[piece]
    const rect = event.currentTarget.getBoundingClientRect()
    const cell_width = rect.width / cols
    const cell_height = rect.height / rows
    const mouse_x = event.clientX - rect.left
    const mouse_y = event.clientY - rect.top
    const width_offset = cell_width / 2
    const height_offset = cell_height / 2
    GhostEl.style.transform = `translate(${mouse_x - width_offset}px,${mouse_y - height_offset}px)`
    boardEl.appendChild(GhostEl)
}

function move_ghost(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const cell_width = rect.width / cols
    const cell_height = rect.height / rows
    const mouse_x = event.clientX - rect.left
    const mouse_y = event.clientY - rect.top
    const width_offset = cell_width / 2
    const height_offset = cell_height / 2

    GhostEl.style.transform = `translate(${mouse_x - width_offset}px,${mouse_y - height_offset}px)`
}

function hide_ghost() {
    if (selectedPiece) {
        selectedPiece.style.opacity = "1"
    }
    GhostEl.remove()
}

// event listeners

let mouse_is_down = false

function click_move(event) {

    mouse_is_down = true

    // prevent dragging images
    event.preventDefault()

    const cur_square = select_square(event)
    const [cur_row, cur_col] = decode_sqaure(cur_square)
    const cur_piece = board[cur_row][cur_col]

    const ally_pieces = turn == white ? [d] : [a, k]

    if (ally_pieces.includes(cur_piece)) {
        draw_ghost(event, cur_piece)
    }

    // first select, draw legal moves and select piece element
    if (move_start == -1) {
        // if empty cell, do nothing
        if (cur_piece == e) return
        // select starting square
        move_start = cur_square
        // refresh legal moves
        remove_legal_moves()
        // select piece element
        selectedPiece = event.target
        draw_legal_moves(legal_moves(move_start))
        return
    }

    // double-click, refresh legal moves
    if (move_start == cur_square) {
        remove_legal_moves()
        draw_legal_moves(legal_moves(move_start))
        return
    }

    // on click-move/dif square clicked
    if (cur_square != move_start) {
        // piece selected
        if (cur_piece != e) {
            move_start = cur_square
            // refresh legal moves
            remove_legal_moves()
            // select piece element
            selectedPiece = event.target
            draw_legal_moves(legal_moves(move_start))
            return
        }
        // empty square, click-move
        move_end = cur_square
        // don't show legal moves
        remove_legal_moves()
        play_move(move_start, move_end)
    }

}

function drag_move(event) {

    mouse_is_down = false

    if (selectedPiece) {
        hide_ghost()
    }

    // ensure move
    if (move_start == -1) return

    const cur_square = select_square(event)

    // drag, make move
    if (cur_square != move_start) {
        move_end = cur_square
        play_move(move_start, move_end)
        remove_legal_moves()
    }
}

function mouse_move(event) {

    if (!mouse_is_down) return

    const cur_piece = get_piece(move_start)

    const allowed = turn == white ? [d] : [a, k]

    if (!allowed.includes(cur_piece)) return

    selectedPiece.style.opacity = "0.7"
    move_ghost(event)
}

function doc_mouse_up() {
    mouse_is_down = false
    hide_ghost()
}

function play_move(start_square, end_square, opt_event) {

    if (legal_move(start_square, end_square)) {

        move_start = start_square
        move_end = end_square

        // TODO: remove later
        if (opt_event) {
            selectedPiece = piece_from_square(move_start)
        }
        outputEl.innerHTML = `${start_square}, ${end_square}`

        move_piece(selectedPiece)
        const captured = get_captures(end_square)
        for (const piece in captured) {
            remove_piece(captured[piece])
        }
        remove_highlight_move()
        draw_highlight_move()
        if (is_win(turn)) {
            alert("You Win!")
        }
        if (turn) {
            turn = black
        } else {
            turn = white
        }
    }
    // reset selected squares
    move_start = -1
    move_end = -1
}

// initialize board

function init_board() {

    boardEl.addEventListener('mousedown', click_move)

    boardEl.addEventListener('mouseup', drag_move)

    boardEl.addEventListener('mousemove', mouse_move)

    document.addEventListener('mouseup', doc_mouse_up)

    draw_board()
}

init_board()

// temp multiplayer

const inputEl = document.querySelector("input")

inputEl.addEventListener("keydown", decode_move)
outputEl = document.querySelector("#move_output")

function decode_move(event) {
    if (event.key != "Enter") return
    let str = event.currentTarget.value
    event.currentTarget.value = ""
    let move = (str.split(','))
    for (str in move) {
        move[str] = move[str].replace(/\s/g, '');
        move[str] = Number(move[str])
    }
    if (move.length > 2) return
    play_move(move[0], move[1], event)
}

function encode_move(move) {
    outputEl.innerHTML = move
}
