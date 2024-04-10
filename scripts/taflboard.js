

const boardEl = document.getElementById('tafl-board')
let selectedPiece

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
const b = 6
const f = 7

// piece/element encodings to corresponding css classes
const string_elements = {
    [e]: '',
    [a]: 'attacker',
    [d]: 'defender',
    [k]: 'king',
    [m]: 'move-dest',
    [g]: 'ghost',
    [b]: 'start-square',
    [f]: 'end-square',
}


// side to move
const white = 1
const black = 0

let turn = white

const rows = 11
const cols = 11

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

const castles = [
    // corners
    encode_sqaure(0,0),
    encode_sqaure(0, cols-1),
    encode_sqaure(rows-1, 0),
    encode_sqaure(rows-1, cols-1),
    // center
    encode_sqaure(Math.floor(rows/2), Math.floor(cols/2))
]

const corners = [
    encode_sqaure(0,0),
    encode_sqaure(0, cols-1),
    encode_sqaure(rows-1, 0),
    encode_sqaure(rows-1, cols-1),
]

// store selected square
let start_square = -1, end_square = -1
let start_piece, end_piece

const move_stack = []

function encode_sqaure(row, col) {
    return row * rows + col
}

function decode_sqaure(square) {
    return [Math.floor(square / rows),square % cols]
}

// legal moves for a piece
function legal_moves() {
    const moves = []
    // ensure move
    if (start_square == -1) return moves

    const [row, col] = decode_sqaure(start_square)
    const cur_piece = board[row][col]
    if (cur_piece == e) return moves
    // vertical
    for (let i = row + 1; i < rows; i++) {
        const piece = board[i][col]
        const sqaure = encode_sqaure(i, col)
        if (piece != e) break
        if (cur_piece != k && castles.includes(sqaure)) break
        moves.push(encode_sqaure(i, col))
    }
    for (let i = row - 1; i >= 0; i--) {
        const piece = board[i][col]
        const sqaure = encode_sqaure(i, col)
        if (piece != e) break
        if (cur_piece != k && castles.includes(sqaure)) break
        moves.push(encode_sqaure(i, col))
    }
    // horizontal
    for (let j = col + 1; j < cols; j++) {
        const piece = board[row][j]
        const sqaure = encode_sqaure(row, j)
        if (piece != e) break
        if (cur_piece != k && castles.includes(sqaure)) break
        moves.push(encode_sqaure(row, j))
    }
    for (let j = col - 1; j >= 0; j--) {
        const piece = board[row][j]
        const sqaure = encode_sqaure(row, j)
        if (piece != e) break
        if (cur_piece != k && castles.includes(sqaure)) break
        moves.push(encode_sqaure(row, j))
    }
    return moves
}

function is_legal_move() {

    // ensure move
    if (start_square == -1 || end_square == -1) return false

    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const row_dist = end_row - start_row
    const col_dist = end_col - start_col

    // ensure start and end squares are different
    if (start_square == end_square) return false

    // ensure piece selected
    if (board[start_row][start_col] == e) return false

    // ensure orthaginal
    if (row_dist != 0 && col_dist != 0) return false

    // ensure only king can enter castles
    const piece = board[start_row][start_col]
    if (piece != k) {
        if (castles.includes(end_square)) return false
    }


    const dist = end_square - start_square 
    // either 1 or -1, whether start comes before end square
    const dir = (row_dist + col_dist) / Math.abs(row_dist + col_dist)

    // increment for next orthoginal cell
    const next_cell = dist % rows == 0 ? rows : 1
    // ensure start <= end
    const [start, end] = dir > 0 ? [start_square + next_cell, end_square] : [end_square, start_square]

    // ensure path is clear
    for (let i = start; i != start_square && i <= end; i+=next_cell) {
        const [cur_row, cur_col] = decode_sqaure(i)
        if (board[cur_row][cur_col] != e) return false
    }
    return true
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
    pieceEl.className = string_elements[piece]
    pieceEl.style.transform = `translate(${100 * col}%,${100 * row}%)`
    return pieceEl
}

function move_piece(elem) {
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    elem.style.transform = `translate(${100 * end_col}%,${100 * end_row}%)`
    const piece = board[start_row][start_col]
    board[start_row][start_col] = e
    board[end_row][end_col] = piece
}

function highlight_move() {
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const startEl = create_piece(b, start_row, start_col)
    const endEl = create_piece(f, end_row, end_col)
    // console.log(start_row, start_col, end_row, end_col)
    boardEl.appendChild(startEl)
    boardEl.appendChild(endEl)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
}

function remove_highlight_move() {
    const elems = boardEl.querySelectorAll(`.${string_elements[b]}, .${string_elements[f]}`)
    elems.forEach(element => {
        element.remove()
    });
    
}

function draw_legal_moves(moves) {
    for (let i = 0; i < moves.length; i++) {
        const [row, col] = decode_sqaure(moves[i])
        const elem = document.createElement('div')
        elem.className = string_elements[m]
        elem.style.transform = `translate(${100 * col}%,${100 * row}%)`
        boardEl.appendChild(elem)
    }
}

function remove_legal_moves() {
    const elems = boardEl.querySelectorAll(`.${string_elements[m]}`)
    elems.forEach(element => {
        element.remove()
    });
}

// event listeners

function mouse_down(event) {

    // prevent dragging images
    event.preventDefault()

    const cur_square = select_square(event)
    const [cur_row, cur_col] = decode_sqaure(cur_square)
    const cur_piece = board[cur_row][cur_col]

    // first select, draw legal moves
    if (start_square == -1) {
        // if empty cell, do nothing
        if (cur_piece == e) return
        // select starting square
        start_square = cur_square
        // refresh legal moves
        remove_legal_moves()
        // select piece element
        selectedPiece = event.target
        draw_legal_moves(legal_moves())
        return
    }

    // double-click, refresh legal moves
    if (start_square == cur_square) {
        remove_legal_moves()
        draw_legal_moves(legal_moves())
        return
    }

    // on click-move/dif square clicked
    if (cur_square != start_square) {
        // piece selected
        if (board[cur_row][cur_col] != e) {
            start_square = cur_square
            // refresh legal moves
            remove_legal_moves()
            // select piece element
            selectedPiece = event.target
            draw_legal_moves(legal_moves())
            return
        }
        // empty square, click-move
        end_square = cur_square
        // don't show legal moves
        remove_legal_moves()
        // play move
        if (is_legal_move()) {
            move_piece(selectedPiece)
            remove_highlight_move()
            highlight_move()
        }
        start_square = -1
        end_square = -1
    }

}

function mouse_up(event) {

    const cur_square = select_square(event)

    // drag, make move
    if (cur_square != start_square) {
        // play move
        end_square = cur_square
        if (is_legal_move()) {
            move_piece(selectedPiece)
            remove_highlight_move()
            highlight_move()
        }
        start_square = -1
        end_square = -1
        remove_legal_moves()
    }
}

function select_square(event) {
    const rect = event.currentTarget.getBoundingClientRect()
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

// initialize board

function init_board() {

    boardEl.addEventListener('mousedown', mouse_down)

    boardEl.addEventListener('mouseup', mouse_up)

    draw_board()
}

init_board()

