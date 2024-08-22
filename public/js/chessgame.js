const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let draggerPiece = null;
let sourceSquare = null;
let playerRole = null;
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + colIndex) % 2 == 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = colIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerHTML = getPieceUnicode(square.type, square.color);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggerPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: colIndex }
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", () => {
                    draggerPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggerPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole === 'b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped")
    }
};
const handleMove = (source,target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion:"q"
    }
    socket.emit("move",move)
}
const getPieceUnicode = (type,color) => {
    const pieces = {
        p: { w: "♙", b: "♟︎" },
        r: { w: "♖", b: "♜" },
        n: { w: "♘", b: "♞" },
        b: { w: "♗", b: "♝" },
        q: { w: "♕", b: "♛" },
        k: { w: "♔", b: "♚" },
    };
    return pieces[type][color];
}
socket.on("playerRole",function(role){
    playerRole=role
    renderBoard();
});
socket.on("spectatorRole",function(){
    playerRole=null,
    renderBoard();
});
socket.on("broadState",function(fen){
    chess.load(fen);
    renderBoard();
})
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})
renderBoard();