
// event listeners

let mouse_is_down = false

// keep track of current move for event listeners
const no_square = -1
let move_start = no_square, move_end = no_square

// on mouse down
function click_move(event) {

    // prevent dragging
    event.preventDefault()

    const cur_square = select_square(event)

    const cur_piece = board[cur_square]

    const allowed_pieces = turn == white ? white_pieces : black_pieces

    if (!allowed_pieces.includes(cur_piece)) { return }

    mouse_is_down = true

    draw_ghost(event, cur_piece)

    // first select, draw legal moves and select piece element
    if (move_start == no_square) {
        // if empty cell, do nothing
        if (cur_piece == emp) { return }
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
        if (cur_piece != emp) {
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

        // reset selected squares
        move_start = no_square
        move_end = no_square
    }

}

// on mouse up
function drag_move(event) {

    mouse_is_down = false

    if (selected_piece_el) {
        hide_ghost()
    }

    // ensure move
    if (move_start == no_square) { return }

    const cur_square = select_square(event)

    // drag, make move
    if (cur_square != move_start) {
        move_end = cur_square
        play_move(move_start, move_end)
        remove_legal_moves()

        // reset selected squares
        move_start = no_square
        move_end = no_square
    }

}

// cancel move on mouse up outside board
function doc_mouse_up() {
    mouse_is_down = false
    hide_ghost()
}

// on mouse move
function mouse_move(event) {

    if (!mouse_is_down) { return }

    const cur_piece = board[move_start]

    const allowed = turn == white ? white_pieces : black_pieces

    if (!allowed.includes(cur_piece)) { return }

    selected_piece_el.style.opacity = "0.7"
    move_ghost(event)
}

// playing move logic

function play_move(start_square, end_square) {

    if (validate_move(start_square, end_square)) {

        // first move
        if (move_stack.size == 0) push_move(encode_move(start_square, end_square), [], turn, board)

        // NOTE: HUMAN MOVE

        let captures = make_move(start_square, end_square)

        render_move(start_square, end_square, captures)

        push_move(encode_move(start_square, end_square), captures, turn, board)

        if (check_win(turn, board)) {
            alert("You win!")
        }

        turn ^= 1

        // NOTE: AI MOVE

        // setTimeout(() => {
        //     console.time("ai move")
        //
        //     const ai_move_squares = decode_move(best_move())
        //     captures = make_move(ai_move_squares[0], ai_move_squares[1])
        //
        //     render_move(ai_move_squares[0], ai_move_squares[1], captures)
        //
        //     push_move(encode_move(ai_move_squares[0], ai_move_squares[1]), captures, turn, board)
        //
        //     if (is_win(turn, board)) {
        //         alert("You win!")
        //     }
        //
        //     turn ^= 1
        //
        //     console.timeEnd("ai move")
        //     console.log('plies', plies_completed, 'white', white_moves_completed, 'pruned', white_moves_pruned, 'black', black_moves_completed, 'pruned', black_moves_pruned)
        // }, 1);


    }
}

// play against ai on the console
function no_render_play_move(move) {
    const [start_square, end_square] = decode_move(move)

    if (!validate_move(start_square, end_square)) { return }

    make_move(start_square, end_square)

    emoji_board(board)

    if (check_win(turn, board)) {
        console.log("You Win!")
    }

    console.time("ai move")

    // const ai_move = best_move(board, 2, black, -Infinity, Infinity)
    const ai_move = best_move()
    const ai_move_squares = decode_move(ai_move)
    make_move(ai_move_squares[0], ai_move_squares[1])

    console.timeEnd("ai move")
    console.log('plies', plies_completed, 'white', white_moves_completed, 'pruned', white_moves_pruned, 'black', black_moves_completed, 'pruned', black_moves_pruned)

    emoji_board(board)

}

// initialize everything

function init() {

    if (!board_el) { console.error("board_el is not defined") }

    board_el.addEventListener('mousedown', click_move)

    board_el.addEventListener('mouseup', drag_move)

    board_el.addEventListener('mousemove', mouse_move)

    document.addEventListener('mouseup', doc_mouse_up)

    document.querySelectorAll('.rule-btn').forEach(btn => {
        btn.onclick = (event) => {
            rule_flags[event.currentTarget.id] = event.currentTarget.checked
            console.log(rule_flags, rule_flags[event.currentTarget.id])
        }
    })

    draw_board()
}

init()

