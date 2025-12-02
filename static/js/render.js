
// rendering logic for the board

// board element

const board_el = document.getElementById('tafl-board')

// store user-selected piece

let selected_piece_el

// decoration element encoding

// ghost, ie: dragged piece
const gst = 5
// move-destinations
const mvd = 4

// highlight move

// start
const srt = 6
// finish
const fin = 7
// capture
const cap = 8


// piece/element encodings to corresponding css classes
const css_elements = {
    [emp]: '',
    // white piece
    [att]: 'attacker',
    // black piece
    [def]: 'defender',
    // black's king
    [kng]: 'king',
    // piece player is dragging
    [gst]: 'ghost',
    // legal moves
    [mvd]: 'move-dest',
    // previous move start square
    [srt]: 'start-square',
    // previous move end square
    [fin]: 'end-square',
    // previous move captures
    [cap]: 'capture-square',
}

const css_pieces = {
    [att]: 'attacker',
    [def]: 'defender',
    [kng]: 'king',
}

const css_legal_move = {
    [mvd]: 'move-dest',
}

const css_move_highlights = {
    [srt]: 'start-square',
    [fin]: 'end-square',
    [cap]: 'capture-square',
}


let ghost_el = create_element(gst, 0, 0)

function draw_board() {
    if (!board_el) { return }
    board_el.innerHTML = ''
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const square = encode_sqaure(row, col)
            const piece = board[square]
            // skip empty
            if (piece == emp) continue
            // add to board
            const pieceEl = create_element(piece, row, col)
            board_el.appendChild(pieceEl)
        }
    }
}

function create_element(piece, row, col) {
    const pieceEl = document.createElement('div')
    pieceEl.className = css_elements[piece]
    pieceEl.style.transform = `translate(${100 * col}%,${100 * row}%)`
    return pieceEl
}

// NOTE: old attempt to optimize rendering board, made things hard to manage
// function move_piece(elem) {
//     if (elem == board_el) {
//         console.warn("failed to move piece")
//         return
//     }
//     const [end_row, end_col] = decode_sqaure(move_end)
//     elem.style.transform = `translate(${100 * end_col}%,${100 * end_row}%)`
// }

// function piece_from_square(square) {
//     const rect = board_el.getBoundingClientRect()
//     const board_height = rect.height
//     const board_width = rect.width
//     const cell_height = board_height / rows
//     const cell_width = board_width / cols
//     const x0 = rect.left
//     const y0 = rect.top
//     const [row, col] = decode_sqaure(square)
//     const x_pos = col * cell_width + col/2 + x0
//     const y_pos = row * cell_height + row/2 + y0
//     const piece_el = document.elementFromPoint(x_pos, y_pos)
//     return piece_el
// }

// function remove_piece(square) {
//     const rect = board_el.getBoundingClientRect()
//     const board_height = rect.height
//     const board_width = rect.width
//     const cell_height = board_height / rows
//     const cell_width = board_width / cols
//     const x0 = rect.left
//     const y0 = rect.top
//     const [row, col] = decode_sqaure(square)
//     const x_pos = col * cell_width + col/2 + x0
//     const y_pos = row * cell_height + row/2 + y0
//     const piece_el = document.elementFromPoint(x_pos, y_pos)
//     if (piece_el == board_el) {
//         console.warn("failed to remove piece")
//         return
//     }
//     piece_el.remove()
// }

function draw_highlight_capture(captures) {
    for (const square in captures) {
        const [row, col] = decode_sqaure(captures[square])
        const capture_el = create_element(cap, row, col)
        board_el.appendChild(capture_el)
    }
}

function draw_highlight_move(move) {
    const [start_square, end_square] = decode_move(move)
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const startEl = create_element(srt, start_row, start_col)
    const endEl = create_element(fin, end_row, end_col)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
    board_el.appendChild(startEl)
    board_el.appendChild(endEl)
}

function draw_move_highlights(move, captures) {
    const [start_square, end_square] = decode_move(move)
    const [start_row, start_col] = decode_sqaure(start_square)
    const [end_row, end_col] = decode_sqaure(end_square)
    const startEl = create_element(srt, start_row, start_col)
    const endEl = create_element(fin, end_row, end_col)
    // prevent from being event.target
    startEl.style.pointerEvents = "none"
    endEl.style.pointerEvents = "none"
    board_el.appendChild(startEl)
    board_el.appendChild(endEl)
    for (const square in captures) {
        const [row, col] = decode_sqaure(captures[square])
        const capture_el = create_element(cap, row, col)
        board_el.appendChild(capture_el)
    }
}

// NOTE: was remove_all
function remove_move_highlights() {
    for (const css_class in css_move_highlights) {
        const elems = board_el.querySelectorAll(`.${css_move_highlights[css_class]}`)
        elems.forEach(element => {
            element.remove()
        });
    }
}

function draw_legal_moves(moves) {
    for (let i = 0; i < moves.length; i++) {
        const [row, col] = decode_sqaure(moves[i])
        const elem = document.createElement('div')
        elem.className = css_elements[mvd]
        elem.style.transform = `translate(${100 * col}%,${100 * row}%)`
        board_el.appendChild(elem)
    }
}

function remove_legal_moves() {
    const elems = board_el.querySelectorAll(`.${css_elements[mvd]}`)
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
    ghost_el = create_element(gst)
    ghost_el.style.pointerEvents = 'none'
    ghost_el.id = 'ghost'
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

function render_move(start_square, end_square, captures) {

    remove_move_highlights()

    draw_board()

    draw_highlight_move(encode_move(start_square, end_square))
    draw_highlight_capture(captures)
}

