
// event listeners

let mouse_is_down = false

function click_move(event) {

    mouse_is_down = true

    // prevent dragging images
    event.preventDefault()

    const cur_square = select_square(event)

    const cur_piece = board[cur_square]

    const ally_pieces = turn == white ? [a] : [d, k]

    if (ally_pieces.includes(cur_piece)) {
        draw_ghost(event, cur_piece)
    }

    // first select, draw legal moves and select piece element
    if (move_start == -1) {
        // if empty cell, do nothing
        if (cur_piece == e) { return }
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
    if (move_start == -1) { return }

    const cur_square = select_square(event)

    // drag, make move
    if (cur_square != move_start) {
        move_end = cur_square
        play_move(move_start, move_end)
        remove_legal_moves()
    }
}

function mouse_move(event) {

    if (!mouse_is_down) { return }

    const cur_piece = board[move_start]

    const allowed = turn == white ? [a] : [d, k]

    if (!allowed.includes(cur_piece)) { return }

    selected_piece_el.style.opacity = "0.7"
    move_ghost(event)
}

function doc_mouse_up() {
    mouse_is_down = false
    hide_ghost()
}

// playing move logic

function play_move(start_square, end_square) {

    if (turn == black) { return }

    if (legal_move(start_square, end_square)) {

        // first move
        if (move_stack.size == 0) push_move(encode_move(move_start, move_end))

        render_move(start_square, end_square)
        make_move(start_square, end_square)

        // console.log(turn)
        if (is_win(turn, board)) {
            alert("You Win!")
        }
        turn ^= 1
        push_move(encode_move(move_start, move_end))

        console.time("ai move")

        const ai_move = best_move()
        move_start = ai_move[0]
        move_end = ai_move[1]
        selected_piece_el = piece_from_square(ai_move[0])
        render_move(ai_move[0], ai_move[1])
        make_move(ai_move[0], ai_move[1])
        turn ^= 1
        push_move(encode_move(ai_move[0], ai_move[1]))
        console.log('moves evaluated', move_counter, white_moves, black_moves, moves_pruned)

        console.timeEnd("ai move")

    }
    // reset selected squares
    move_start = -1
    move_end = -1
}

function render_move(start_square, end_square) {

    move_piece(selected_piece_el)
    // remove_highlight_move() and remove_highlight_caputure()
    remove_all([s, f])
    remove_all(c)

    last_captures = get_captures(end_square)
    for (const piece in last_captures) {
        remove_piece(last_captures[piece])
    }
    draw_highlight_move()
    draw_highlight_capture(last_captures)
}

function make_move(valid_start_square, valid_end_square, board_ref=board) {

    const piece = board_ref[valid_start_square]
    board_ref[valid_end_square] = piece
    board_ref[valid_start_square] = e

    const captures = get_captures(valid_end_square)

    for (const p in captures) {
        board_ref[captures[p]] = e
    }

}

// initialize everything

function init() {

    board_el.addEventListener('mousedown', click_move)

    board_el.addEventListener('mouseup', drag_move)

    board_el.addEventListener('mousemove', mouse_move)

    document.addEventListener('mouseup', doc_mouse_up)

    document.querySelectorAll('.rule-btn').forEach(btn => { btn.onclick = (event) => {
        rule_flags[event.currentTarget.id] = event.currentTarget.checked
    }})

    draw_board()
}

init()


