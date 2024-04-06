
const char_pieces = {
    'a': 'attacker',
    'd': 'defender',
    'k': 'king',
    'm': 'move-dest',
    'g': 'ghost',
}

const starting_position = [
    ["",  "",  "",  "a", "a", "a", "a", "a", "",  "",  "" ],
    ["",  "",  "",  "",  "",  "a", "",  "",  "",  "",  "" ],
    ["",  "",  "",  "",  "",  "",  "",  "",  "",  "",  "" ],
    ["a", "",  "",  "",  "",  "d", "",  "",  "",  "",  "a"],
    ["a", "",  "",  "",  "d", "d", "d", "",  "",  "",  "a"],
    ["a", "a", "",  "d", "d", "k", "d", "d", "",  "a", "a"],
    ["a", "",  "",  "",  "d", "d", "d", "",  "",  "",  "a"],
    ["a", "",  "",  "",  "",  "d", "",  "",  "",  "",  "a"],
    ["",  "",  "",  "",  "",  "",  "",  "",  "",  "",  "" ],
    ["",  "",  "",  "",  "",  "a", "",  "",  "",  "",  "" ],
    ["",  "",  "",  "a", "a", "a", "a", "a", "",  "",  "" ],
]



const move_dests = []
let isAttackerTurn = true
let selectedEl

let move_stack = []

const boardEl = document.getElementById("tafl-board")

boardEl.addEventListener("mouseup", (e) => {
    if (e.target != selectedEl && e.target.className != "move-dest") {
        clearMoveDests()
    }
})


function removePiece(piece, board = boardEl) {
    const row = piece.row
    const col = piece.col
    board.position[row][col] = ""
    piece.remove()
}


function setBoard(position, board = boardEl) {
    board.clear_pieces()
    for (let i = 0; i < position.length; i++) {
        for (let j = 0; j < position[i].length; j++) {
            board.add_piece(position[i][j], i, j)
        }
    }
}

setBoard(starting_position)

function placeMoveDests(event) {
    selectedEl = event.currentTarget
    const board = boardEl.position
    const current_row = event.currentTarget.row
    const current_col = event.currentTarget.col

    // remove previous move destinations
    clearMoveDests()

    // place new move destinations
    for (let i = current_row+1; i < board.length; i++) {
        if (board[i][current_col] != '') break
        if (isAttackerTurn && isCornerOrCenter(i,current_col)) break
        move_dests.push(createPiece('m', i, current_col))
    }
    for (let i = current_row-1; i >= 0; i--) {
        if (board[i][current_col] != '') break
        if (isAttackerTurn && isCornerOrCenter(i,current_col)) break
        move_dests.push(createPiece('m', i, current_col))
    }
    for (let i = current_col+1; i < board[current_row].length; i++) {
        if (board[current_row][i] != '') break
        if (isAttackerTurn && isCornerOrCenter(current_row,i)) break
        move_dests.push(createPiece('m', current_row, i))
    }
    for (let i = current_col-1; i >= 0; i--) {
        if (board[current_row][i] != '') break
        if (isAttackerTurn && isCornerOrCenter(current_row,i)) break
        move_dests.push(createPiece('m', current_row, i))
    }

}

function moveDestSelected(e) {
    const init_row = selectedEl.row
    const init_col = selectedEl.col
    const dest_row = e.currentTarget.row
    const dest_col = e.currentTarget.col


    // console.log(taflBoardEl.position[init_row][init_col])
    // console.log(taflBoardEl.position[dest_row][dest_col])

    selectedEl.row = dest_row
    selectedEl.col = dest_col
    selectedEl.style.transform = e.currentTarget.style.transform

    clearMoveDests()
    boardEl.position[init_row][init_col] = ""
    boardEl.position[dest_row][dest_col] = selectedEl.className.charAt(0)
}

function clearMoveDests() {
    for (let i = move_dests.length - 1; i >= 0; i--) {
        boardEl.position[move_dests[i].row][move_dests[i].col] = ""
        move_dests[i].remove()
        move_dests.pop()
    }
}

function isCapture(e) {
    const rows = 11
    const cols = 11
    const current_row = e.currentTarget.row
    const current_col = e.currentTarget.col

    if (current_row + 2 < rows) {
        // if (taflBoardEl.position[current_row + 2][current_col])
    }
}

function isEnemyPiece(row, col) {
    const enemies = isAttackerTurn ? ["d","k"] : ["a"]
    return (enemies.includes(boardEl.position[row][col]))
}

function isCornerOrCenter(row, col) {
    const corners = [[0,0],[0,11],[5,5],[11,0],[11,11]]
    for (let i = 0; i < corners.length; i++) {
        if (row === corners[i][0] && col === corners[i][1]) return true
    }
    return false
}

function main() {
    initBoard()
    // setBoard(starting_position)
}

main()
