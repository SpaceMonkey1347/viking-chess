

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
const size = 80

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

const move_stack = []

function encode_sqaure(row, col) {
    return row * rows + col
}

function decode_sqaure(square) {
    return [Math.floor(square / rows), square % cols]
}

// legal moves for a piece
function legal_moves(square) {
    const moves = []
    const [row, col] = decode_sqaure(square)
    const cur_piece = board[row][col]
    if (cur_piece == e) return moves
    // vertical
    for (let i = row + 1; i < rows; i++) {
        const cur_square = encode_sqaure(i, col)
        if (is_legal_move(square, cur_square)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    for (let i = row - 1; i >= 0; i--) {
        const cur_square = encode_sqaure(i, col)
        if (is_legal_move(square, cur_square)) {
            moves.push(encode_sqaure(i, col))
        }
    }
    // horizontal
    for (let j = col + 1; j < cols; j++) {
        const cur_square = encode_sqaure(row, j)
        if (is_legal_move(square, cur_square)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    for (let j = col - 1; j >= 0; j--) {
        const cur_square = encode_sqaure(row, j)
        if (is_legal_move(square, cur_square)) {
            moves.push(encode_sqaure(row, j))
        }
    }
    return moves
}

function is_legal_move(start, end, debug = false) {

    const [start_row, start_col] = decode_sqaure(start)
    const [end_row, end_col] = decode_sqaure(end)
    const row_diff = end_row - start_row
    const col_diff = end_col - start_col

    // ensure start and end squares are different
    if (start == end) return false

    // ensure piece selected
    if (board[start_row][start_col] == e) return false

    // ensure orthaginal
    if (row_diff != 0 && col_diff != 0) return false

    // ensure only king can enter castles
    const piece = board[start_row][start_col]

    const enemies = []
    // ensure turn
    if (turn == white) {
        if (piece != a) {
            return
        }
        enemies.push(d)
        enemies.push(k)
    } else if (turn == black) {
        if (piece != d && piece != k) {
            return
        }
        enemies.push(a)
    }

    // ensure only king can enter a castle
    if (piece != k) {
        if (castles.includes(end)) return false
    }

    const dist = end - start
    // either 1 or -1, whether start comes before end square
    const dir = (row_diff + col_diff) / Math.abs(row_diff + col_diff)

    // increment for next orthoginal cell
    const next_cell = dist % rows == 0 ? rows : 1

    // for reference
    const adj_cell = next_cell == rows ? 1 : rows

    // touching edge of board logic
    const top_adj = (cell) => cell - rows < 0
    const left_adj = (cell) => cell % cols == 0
    const right_adj = (cell) => cell % cols == cols - 1
    const bottom_adj = (cell) => cell + rows > size
    const _9_o_clock = row_diff == 0 ?
        (cell) => bottom_adj(cell) :
        (cell) => left_adj(cell)
    const _3_o_clock = row_diff == 0 ?
        (cell) => top_adj(cell) :
        (cell) => right_adj(cell)
    const edge_adj = row_diff == 0 ?
        (cell) => top_adj(cell) || bottom_adj(cell) :
        (cell) => left_adj(cell) || right_adj(cell)

    // ensure start <= end
    const [start_i, end_i] = dir > 0 ? [start + next_cell, end] : [end, start]

    for (let i = start_i; i != start && i <= end_i; i += next_cell) {
        const [cur_row, cur_col] = decode_sqaure(i)
        // ensure path is clear
        if (board[cur_row][cur_col] != e) {
            return false
        }

        const _3_o_clock_cell = (!_3_o_clock(i)) ? i - adj_cell : false
        const _9_o_clock_cell = (!_9_o_clock(i)) ? i + adj_cell : false

        let left_piece
        let right_piece
        if (_3_o_clock_cell !== false && _9_o_clock_cell !== false) {
            const [l_adj_row, l_adj_col] = decode_sqaure(_3_o_clock_cell)
            left_piece = board[l_adj_row][l_adj_col]
            const [r_adj_row, r_adj_col] = decode_sqaure(_9_o_clock_cell)
            right_piece = board[r_adj_row][r_adj_col]
            if (debug) {
                // console.log('left:', left_piece)
                // console.log('right:', right_piece)
                // console.log(enemies.includes(left_piece) && enemies.includes(right_piece))
            }
            if (enemies.includes(left_piece) && enemies.includes(right_piece)) {
                if (i == end) {
                    return false
                }
            }
        }

        // left or top depending on direction
        if (debug) {
            // console.log(_3_o_clock_cell, _9_o_clock_cell)
            if (_3_o_clock(i)) {
                // console.log('edge on left')
            }
            if (_9_o_clock(i)) {
                // console.log('edge on right')
            }
        }

    }
    return true
}

function capture(square) {
    const [row, col] = decode_sqaure(square)
    const piece = board[row][col]
    const adj_squares = adjacent_squares(square)
    const enemy_pieces = []
    const ally_pieces = []
    if (piece == a) {
        enemy_pieces.push(d, k)
        ally_pieces.push(a)
    } else if (piece == d || piece == k) {
        enemy_pieces.push(a)
        ally_pieces.push(d, k)
    }
    // check if sorrounding eneimes are adjacent to other allies
    for (dir in adj_squares) {
        const cur_square = adj_squares[dir]
        const [cur_row, cur_col] = decode_sqaure(cur_square)
        const cur_piece = board[cur_row][cur_col]
        console.log(cur_piece)
        const cur_adj_squares = adjacent_squares(cur_square)

        if (!enemy_pieces.includes(cur_piece)) continue

        if (cur_adj_squares.left != undefined && cur_adj_squares.right != undefined) {
            const [left_row, left_col] = decode_sqaure(cur_adj_squares.left)
            const [right_row, right_col] = decode_sqaure(cur_adj_squares.right)
            const left_piece = board[left_row][left_col]
            const right_piece = board[right_row][right_col]
            if (ally_pieces.includes(left_piece) && ally_pieces.includes(right_piece)) {
                console.log(cur_square, ally_pieces, enemy_pieces)
                return cur_square
            }
        }
        if (cur_adj_squares.top != undefined && cur_adj_squares.bottom != undefined) {
            const [top_row, top_col] = decode_sqaure(cur_adj_squares.top)
            const [bottom_row, bottom_col] = decode_sqaure(cur_adj_squares.bottom)
            const top_piece = board[top_row][top_col]
            const bottom_piece = board[bottom_row][bottom_col]
            if (ally_pieces.includes(top_piece) && ally_pieces.includes(bottom_piece)) {
                console.log(cur_square, ally_pieces, enemy_pieces)
                return cur_square
            }
        }
    }
}

function is_win() {
    if (turn == white) {
        let black_has_legal_moves = false
        let king_captured = true

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {

                const piece = board[i][j]
                if (piece == a) continue
                const square = encode_sqaure(i,j)

                turn = black
                const legal = legal_moves(square)
                turn = white

                if (legal.length != 0) {
                    black_has_legal_moves = true
                }

                if (piece == k) {
                    king_captured = false
                }

            }
        }
        if (king_captured) return true
        if (!black_has_legal_moves) return true

    } else if (turn == black) {

        for (let i = 0; i < corners.length; i++) {
            const square = corners[i];
            const [row, col] = decode_sqaure(square)
            if (board[row][col] == k) {
                return true
            }
        }
        let white_has_legal_moves = false

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const piece = board[i][j]
                if (piece == d || piece == k) continue

                const square = encode_sqaure(i,j)
                turn = white
                const legal = legal_moves(square)
                turn = black

                if (legal.length != 0) {
                    white_has_legal_moves = true
                }
            }
        }
        if (!white_has_legal_moves) {
            return true
        }
    }
    return false
}

function in_board(square) {
    return square >= 0 && square < size
}

function touching_edge(square) {
    const top    = () => square - rows < 0
    const left   = () => square % cols == 0
    const right  = () => square % cols == cols - 1
    const bottom = () => square + rows > size
    return top() || left() || right() || bottom()
}

function is_adjacent(square, target) {
    if (!in_board(square) || !in_board(target)) return false
    const above = () => square - target == cols    && square - rows >  0
    const left  = () => square - target == 1       && square % cols != 0
    const right = () => square - target == -1      && square % cols != cols - 1
    const below = () => square - target == -(cols) && square + rows <  size
    // console.log(above(), left(), right(), below())
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
        if (in_board(q) && is_adjacent(square, q)) {
            valid[s] = q
        }
    }
    // console.log(valid)
    return valid
}

function adjacent_pieces(square) {
    const squares = adjacent_squares(square)
    const pieces = []
    squares.forEach(s => {
        const [row, col] = decode_sqaure(s)
        pieces.push(board[row][col])
    });
    return pieces
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

function highlight_move() {
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const startEl = create_piece(b, start_row, start_col)
    const endEl = create_piece(f, end_row, end_col)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
    // console.log(start_row, start_col, end_row, end_col)
    boardEl.appendChild(startEl)
    boardEl.appendChild(endEl)
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

function click_move(event) {

    // prevent dragging images
    event.preventDefault()

    const cur_square = select_square(event)
    const [cur_row, cur_col] = decode_sqaure(cur_square)
    const cur_piece = board[cur_row][cur_col]

    // first select, draw legal moves and select piece element
    if (start_square == -1) {
        // if empty cell, do nothing
        if (cur_piece == e) return
        // select starting square
        start_square = cur_square
        // refresh legal moves
        remove_legal_moves()
        // select piece element
        selectedPiece = event.target
        draw_legal_moves(legal_moves(start_square))
        return
    }

    // double-click, refresh legal moves
    if (start_square == cur_square) {
        remove_legal_moves()
        draw_legal_moves(legal_moves(start_square))
        return
    }

    // on click-move/dif square clicked
    if (cur_square != start_square) {
        // piece selected
        if (cur_piece != e) {
            start_square = cur_square
            // refresh legal moves
            remove_legal_moves()
            // select piece element
            selectedPiece = event.target
            draw_legal_moves(legal_moves(start_square))
            return
        }
        // empty square, click-move
        end_square = cur_square
        // don't show legal moves
        remove_legal_moves()
        play_move(start_square, end_square)
    }

}

function drag_move(event) {

    // ensure move
    if (start_square == -1) return

    const cur_square = select_square(event)

    // drag, make move
    if (cur_square != start_square) {
        end_square = cur_square
        play_move(start_square, end_square)
        remove_legal_moves()
    }
}

function play_move(start, end) {
    if (is_legal_move(start, end, true)) {
        move_piece(selectedPiece)
        const captured = capture(end)
        if (captured) {
            remove_piece(captured)
        }
        remove_highlight_move()
        if (is_win()) {
            console.log("WIN!!!!")
        }
        highlight_move()
        if (turn) {
            turn = black
        } else {
            turn = white
        }
    }
    // reset selected squares
    start_square = -1
    end_square = -1
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

    boardEl.addEventListener('mousedown', click_move)

    boardEl.addEventListener('mouseup', drag_move)

    draw_board()
}

init_board()

