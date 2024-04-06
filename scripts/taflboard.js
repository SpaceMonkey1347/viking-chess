
// only thing allowed to access the DOM
class TaflBoard {
    constructor(boardEl) {

        this.boardEl = boardEl

        this.rows = 11
        this.cols = 11

        this.position = [
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", ""],
        ]

        this.pieces = [
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null],
        ]
    }

    get_piece(row, col) {
        return this.pieces[row][col]
    }

    add_piece(symb, row, col) {
        if (row < 0 || row > this.rows) return
        if (col < 0 || col > this.cols) return
        const piece = document.createElement("div")
        piece.className = char_pieces[symb]
        piece.style.transform = `translate(${100 * col}%,${100 * row}%)`
        piece.row = row
        piece.col = col
        piece.symb = symb
        this.pieces[row][col] = piece
        this.appendChild(piece)
        if (symb == 'a' || symb == 'd' || symb == 'k') {
            piece.addEventListener("mousedown", placeMoveDests)
        }
        if (symb == 'm') {
            piece.addEventListener("mouseup", moveDestSelected)
        }
    }

    remove_piece(row, col) {
        if (this.pieces[row][col] == null) return
        this.pieces[row][col].remove()
        this.pieces[row][col] = null
    }

    move_piece(piece, row, col) {
        this.pieces[piece.row][piece.col] = null
        this.pieces[row][col] = piece
        piece.row = row
        piece.col = col
        piece.style.transform = `translate(${100 * col}%,${100 * row}%)`
    }

    clear() {
        for (let i = 0; i < this.pieces.length; i++) {
            for (let j = 0; j < this.pieces[i].length; j++) {
                this.remove_piece[i][j]
            }
        }
    }

    update_position() {
        for (let i = 0; i < this.position.length; i++) {
            for (let j = 0; j < this.position[i].length; j++) {
                if (this.pieces[i][j] == null) continue
                this.position[i][j] = this.pieces[i][j].symb
            }
        }
    }

}
