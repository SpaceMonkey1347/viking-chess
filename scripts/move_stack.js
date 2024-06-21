
const moves_table_el = document.getElementById('moves-tbl')

// move stack
const move_stack = {
    moves: new Array(1000),
    count: 0,
    size: 0,
}

// move stack

function push_move(move, captures, turn, board) {

    move_stack.moves[move_stack.count] = {
        move: move,
        captures: JSON.parse(JSON.stringify(captures)),
        turn: turn,
        board: JSON.parse(JSON.stringify(board)),
    }
    move_stack.count++
    move_stack.size++

    push_move_table(move)
}

function undo_move() {
    if (move_stack.count < 2) { return }
    move_stack.count--
    board = JSON.parse(JSON.stringify(move_stack.moves[move_stack.count - 1].board))
    turn = move_stack.moves[move_stack.count - 1].turn

    draw_board()
    draw_highlight_move(move_stack.moves[move_stack.count - 1].move)
    draw_highlight_capture(move_stack.moves[move_stack.count - 1].captures)
}

function redo_move() {
    if (move_stack.count > move_stack.size - 1) { return }
    board = JSON.parse(JSON.stringify(move_stack.moves[move_stack.count].board))
    turn = move_stack.moves[move_stack.count].turn
    move_stack.count++

    draw_board()
    draw_highlight_move(move_stack.moves[move_stack.count - 1].move)
    draw_highlight_capture(move_stack.moves[move_stack.count - 1].captures)
}

function first_move() {
    move_stack.count = 1
    board = JSON.parse(JSON.stringify(move_stack.moves[move_stack.count - 1].board))
    turn = move_stack.moves[move_stack.count - 1].turn

    draw_board()
    // draw_highlight_move(move_stack.moves[move_stack.count - 1].move)
    // draw_highlight_capture(move_stack.moves[move_stack.count - 1].captures)
}

function last_move() {
    move_stack.count = move_stack.size

    board = JSON.parse(JSON.stringify(move_stack.moves[move_stack.count - 1].board))
    turn = move_stack.moves[move_stack.count - 1].turn

    draw_board()
    draw_highlight_move(move_stack.moves[move_stack.count - 1].move)
    draw_highlight_capture(move_stack.moves[move_stack.count - 1].captures)
}
function next_move() {
}
function prev_move() {
}
function goto_move(move) {

}

// show move in move history
function push_move_table(move) {
    if (!moves_table_el) { return }
    // skip inital position
    if (move_stack.size == 1) { return }
    // add move to table
    const tbody = moves_table_el.getElementsByTagName('tbody')[0]
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
