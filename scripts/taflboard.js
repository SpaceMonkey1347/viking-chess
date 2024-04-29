// NOTE: Rule Flags, feel free to change

let king_center_passthrough_flag = true
const king_center_el = document.getElementById('king_center_passthrough_flag')
king_center_el.onclick = () => {
    king_center_passthrough_flag = king_center_el.checked
}

let enter_self_capture_flag = false
const enter_self_el = document.getElementById('enter_self_capture_flag')
enter_self_el.onclick = () => {
    enter_self_capture_flag = enter_self_el.checked
}

let tower_capture_flag = true
const tower_capture_el = document.getElementById('tower_capture_flag')
tower_capture_el.onclick = () => {
    tower_capture_flag = tower_capture_el.checked
}

// TODO: same as the capture rule in Go
let connected_capture_flag = false

// board element

const board_el = document.getElementById('tafl-board')

const moves_el = document.getElementById('moves')

// store user-selected piece
let selected_piece_el

// piece encoding

// empty
const e = 0
// attacker
const a = 1
// defender
const d = 2
// king
const k = 3

// gui element encoding

// move-dest
const m = 4
// ghost
const g = 5


// highlight move

// start
const s = 6
// finish
const f = 7

// piece/element encodings to corresponding css classes
const css_elements = {
    [e]: '',
    [a]: 'attacker',
    [d]: 'defender',
    [k]: 'king',
    [m]: 'move-dest',
    [g]: 'ghost',
    [s]: 'start-square',
    [f]: 'end-square',
}

const ghost_el = create_piece(g, 0, 0)

// internal board

let board = [
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
    [e, e, e, a, a, a, a, a, e, e, e]
]

const rows = 11
const cols = 11
const size = rows * cols - 1
// const center = encode_sqaure(Math.floor(rows/2), Math.floor(cols/2))
const center = Math.floor(rows * cols / 2)

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

// moves

const white = 1
const black = 0

let turn = white

let move_start = -1, move_end = -1

// const move_stack = []
// move stack
var move_stack = {
    moves: new Array(1000),
    count: 0,
    size: 0
}



// board helper functions

function encode_sqaure(row, col) {
    return row * rows + col
}

function decode_sqaure(square) {
    return [Math.floor(square / rows), square % cols]
}

function in_board(square) {
    return square >= 0 && square <= size
}

function get_piece(square) {
    if (!in_board(square)) return e
    const [row, col] = decode_sqaure(square)
    return board[row][col]
}

function is_adjacent(square, target) {
    if (!in_board(square) || !in_board(target)) return false
    const above = () => { return square - target == cols    && square - rows >=  0 }
    const left  = () => { return square - target == 1       && square % cols != 0 }
    const right = () => { return square - target == -1      && square % cols != cols - 1 }
    const below = () => { return square - target == -(cols) && square + rows <=  size }
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

// TODO: move_stack

// rows = ranks = ints, cols = files = chars

function encode_move(start_square, end_square) {
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row,   end_col]   = decode_sqaure(end_square)
    const start_file = String.fromCharCode(start_col + 'a'.charCodeAt(0))
    const end_file = String.fromCharCode(end_col + 'a'.charCodeAt(0))
    const start_rank = (start_row + 1).toString()
    const end_rank = (end_row + 1).toString()
    const encoded_start = start_file + start_rank
    const encoded_end = end_file + end_rank
    const move = encoded_start + encoded_end
    return move
}

function decode_move(move) {
    const chars = move.split('')
    const stack = []
    const moves = []
    let file_flag = true
    for (let i = 0; i < chars.length; i++) {
        if (file_flag) {
            const col = chars[i].charCodeAt(0) - 'a'.charCodeAt(0)
            if (col < 0 || col >= cols) return
            stack.push(col)
            file_flag = !file_flag
        } else {
            let row_str = ''
            let index = i
            while (index < chars.length && !isNaN(chars[index])) {
                row_str = row_str.concat(chars[i])
                index++
            }
            if (index != i) {
                i = index - 1
            }
            const row = parseInt(row_str) - 1;
            if (row < 0 || row >= cols) return
            stack.splice(stack.length - 1, 0, row)
            // stack[i-1] = encode_move(row, stack[i-1])
            moves.push(encode_sqaure(stack[i-1], stack[i]))
            file_flag = !file_flag
        }
    }
    return moves
}

// let test_move = [10, 2]
// let test_alg = encode_move(test_move[0], test_move[1])
// let test_reverse = decode_move(test_alg)
// console.log('test move', test_move, decode_sqaure(test_move[0]), decode_sqaure(test_move[1]))
// console.log('algebraic', test_alg) 
// console.log('reversed', test_reverse)

function push_move(move) {
    move_stack.moves[move_stack.count] = {
        move: move,
        position: {
            board: JSON.parse(JSON.stringify(board)),
            turn: turn,
        }
    }
    move_stack.count++
    move_stack.size++

    // add move to table
    const tbody = moves_el.getElementsByTagName('tbody')[0]
    if (turn == white) {
        const new_row = document.createElement('tr')
        new_row.innerHTML = `<td>${Math.ceil(move_stack.count / 2)}</td><td>${move}</td>`
        tbody.appendChild(new_row)
    } else {
        const move_rows = tbody.getElementsByTagName('tr')
        const last_row = move_rows[move_rows.length - 1]
        const new_move = document.createElement('td')
        new_move.innerHTML = move
        last_row.appendChild(new_move)
    }
}

function undo_move() {
    if (move_stack.count < 1) return
    move_stack.count--
    board = move_stack.moves[move_stack.count].position.board
    turn = move_stack.moves[move_stack.count].position.turn
    console.table(move_stack.moves[move_stack.count].position.board)
    console.log(move_stack.moves[move_stack.count].position.turn)
    draw_board()
}

function first_move() {

}
function last_move() {
}
function next_move() {
}
function prev_move() {
}
function goto_move(move) {

}

// game logic

function legal_move(start_square, end_square) {

    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const row_diff = end_row - start_row
    const col_diff = end_col - start_col
    const piece = board[start_row][start_col]
    const enemy_pieces = turn == white ? [d, k] : [a]

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

        if (vertical_self_capture(end_square, enemy_pieces)) {
            return false
        }

        for (let left = start_square - 1; left >= end_square; left--) {
            if (path_obstructed(left)) return false
        }
        for (let right = start_square + 1; right <= end_square; right++) {
            if (path_obstructed(right)) return false
        }
    } else if (col_diff == 0) {

        if (horizontal_self_capture(end_square, enemy_pieces)) {
            return false
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
        let in_tower = square == center
        if (king_center_passthrough_flag) {
            in_tower &= get_piece(start_square) != k
        }
        const is_empty = board[row][col] != e
        return (in_tower || is_empty)
    }

}

function horizontal_self_capture(square, enemy_pieces) {
    if (enter_self_capture_flag) return false
    if (get_piece(square) == k) return false
    const piece_left  = is_adjacent(square, square - 1) ? get_piece(square - 1) : e
    const piece_right = is_adjacent(square, square + 1) ? get_piece(square + 1) : e
    if (enemy_pieces.includes(piece_left) && enemy_pieces.includes(piece_right)) return true
    return false
}

function vertical_self_capture(square, enemy_pieces) {
    if (enter_self_capture_flag) return false
    if (get_piece(square) == k) return false
    const piece_up   = is_adjacent(square, square - cols) ? get_piece(square - cols) : e
    const piece_down = is_adjacent(square, square + cols) ? get_piece(square + cols) : e
    if (enemy_pieces.includes(piece_up) && enemy_pieces.includes(piece_down)) return true
    return false
}

function piece_legal_moves(square) {
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


function get_captures(end_square) {
    const captures = []
    const ally_pieces  = turn == white ? [a] : [d, k]
    const enemy_pieces = turn == white ? [d, k] : [a]
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
                if (get_piece(kings_neighbours[square]) != a) {
                    continue check_adj_squares
                }
            }
            captures.push(cur_square)
            continue
        }
        // take another step
        const next_square = step(cur_square, dir)
        const next_piece = get_piece(next_square)
        if (tower_capture_flag) {
            if (towers.includes(next_square)) {
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

function is_win(player) {

    // win condition flags
    let stalemate_flag = true
    let king_captured_flag = true

    const enemy_pieces = player == white ? [d, k] : [a] 

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
                const legal = piece_legal_moves(square)
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
        return true
    }

    if (stalemate_flag) {
        return true
    }

    return false
}

// DOM manipulation

function draw_board() {
    board_el.innerHTML = ''
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = board[row][col]
            // skip empty
            if (piece == e) continue
            // add to board
            const pieceEl = create_piece(piece, row, col)
            board_el.appendChild(pieceEl)
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
    if (elem == board_el) {
        console.warn("failed to move piece")
        return
    }
    const [start_row, start_col] = decode_sqaure(move_start)
    const [end_row, end_col] = decode_sqaure(move_end)
    elem.style.transform = `translate(${100 * end_col}%,${100 * end_row}%)`
    const piece = board[start_row][start_col]
    board[start_row][start_col] = e
    board[end_row][end_col] = piece
}

function piece_from_square(square) {
    const rect = board_el.getBoundingClientRect()
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
    const rect = board_el.getBoundingClientRect()
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
    if (piece_el == board_el) {
        console.warn("failed to remove piece")
        return
    }
    piece_el.remove()
    board[row][col] = e
}

function draw_highlight_move() {
    const [start_row, start_col] = decode_sqaure(move_start)
    const [end_row, end_col] = decode_sqaure(move_end)
    const startEl = create_piece(s, start_row, start_col)
    const endEl = create_piece(f, end_row, end_col)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
    board_el.appendChild(startEl)
    board_el.appendChild(endEl)
}

function remove_highlight_move() {
    const elems = board_el.querySelectorAll(`.${css_elements[s]}, .${css_elements[f]}`)
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
        board_el.appendChild(elem)
    }
}

function remove_legal_moves() {
    const elems = board_el.querySelectorAll(`.${css_elements[m]}`)
    elems.forEach(element => {
        element.remove()
    });
}

function select_square(event) {
    const rect = board_el.getBoundingClientRect()
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
    ghost_el.style.pointerEvents = 'none'
    ghost_el.id = 'ghost'
    // GhostEl.style.display = 'none'
    ghost_el.className = css_elements[piece]
    const rect = event.currentTarget.getBoundingClientRect()
    const cell_width = rect.width / cols
    const cell_height = rect.height / rows
    const mouse_x = event.clientX - rect.left
    const mouse_y = event.clientY - rect.top
    const width_offset = cell_width / 2
    const height_offset = cell_height / 2
    ghost_el.style.transform = `translate(${mouse_x - width_offset}px,${mouse_y - height_offset}px)`
    board_el.appendChild(ghost_el)
}

function move_ghost(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const cell_width = rect.width / cols
    const cell_height = rect.height / rows
    const mouse_x = event.clientX - rect.left
    const mouse_y = event.clientY - rect.top
    const width_offset = cell_width / 2
    const height_offset = cell_height / 2

    ghost_el.style.transform = `translate(${mouse_x - width_offset}px,${mouse_y - height_offset}px)`
}

function hide_ghost() {
    if (selected_piece_el) {
        selected_piece_el.style.opacity = "1"
    }
    ghost_el.remove()
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

    const ally_pieces = turn == white ? [a] : [d, k]

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
        selected_piece_el = event.target
        draw_legal_moves(piece_legal_moves(move_start))
        return
    }

    // double-click, refresh legal moves
    if (move_start == cur_square) {
        remove_legal_moves()
        draw_legal_moves(piece_legal_moves(move_start))
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
            selected_piece_el = event.target
            draw_legal_moves(piece_legal_moves(move_start))
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

    if (selected_piece_el) {
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

    const allowed = turn == white ? [a] : [d, k]

    if (!allowed.includes(cur_piece)) return

    selected_piece_el.style.opacity = "0.7"
    move_ghost(event)
}

function doc_mouse_up() {
    mouse_is_down = false
    hide_ghost()
}

function play_move(start_square, end_square) {

    if (legal_move(start_square, end_square)) {

        move_start = start_square
        move_end = end_square

        move_piece(selected_piece_el)
        const captured = get_captures(end_square)
        for (const piece in captured) {
            remove_piece(captured[piece])
        }
        push_move(encode_move(move_start, move_end))
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

    board_el.addEventListener('mousedown', click_move)

    board_el.addEventListener('mouseup', drag_move)

    board_el.addEventListener('mousemove', mouse_move)

    document.addEventListener('mouseup', doc_mouse_up)

    draw_board()
}

init_board()

