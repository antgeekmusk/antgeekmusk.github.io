import React, { useState } from "react";
import './TicTacToe.css'

// 定义单元格 props
type SquareProps = {

    value: string | null;
    onSquareClick: () => void;
}
// 定义Board props
type BoardProps = {
    isNext: boolean
    squares: (string | null)[];
    onPlay: (squares:(string | null)[]) => void;
}
// 单元格
function Square({value,onSquareClick}: SquareProps){
    return (
        <button className={"square"} onClick={onSquareClick}>{value}</button>
    )
}

// 游戏面板
function Board({isNext,squares,onPlay}:BoardProps){
    const handelClick = (i:number) => {
        if(squares[i] || calculateWinner(squares)){
            return;
        }
        const nextSquares = squares.slice();
        if(isNext){
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }
        onPlay(nextSquares)

    }

    const calculateWinner = (squares:(string | null)[]) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }
    return (
        <div className={"board"}>
            <div className={"board-row"}>
                <Square value={squares[0]} onSquareClick={()=>handelClick(0)}></Square>
                <Square value={squares[1]} onSquareClick={()=>handelClick(1)}></Square>
                <Square value={squares[2]} onSquareClick={()=>handelClick(2)}></Square>
            </div>
            <div className={"board-row"}>
                <Square value={squares[3]} onSquareClick={()=>handelClick(3)}></Square>
                <Square value={squares[4]} onSquareClick={()=>handelClick(4)}></Square>
                <Square value={squares[5]} onSquareClick={()=>handelClick(5)}></Square>
            </div>
            <div className={"board-row"}>
                <Square value={squares[6]} onSquareClick={()=>handelClick(6)}></Square>
                <Square value={squares[7]} onSquareClick={()=>handelClick(7)}></Square>
                <Square value={squares[8]} onSquareClick={()=>handelClick(8)}></Square>
            </div>
        </div>
    )
}

export default function TicTacToe(){
    const [history,setHistory] = useState<(string | null)[][]>([Array(9).fill(null)]);
    const [currentMove,setCurrentMove] = useState(0);
    const isNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
    const handlePlay = (nextSquares:(string | null)[]) => {
        const netxHistory = [...history.slice(0,currentMove + 1),nextSquares];
        setHistory(netxHistory);
        setCurrentMove(netxHistory.length - 1);
    }
    return (

        <div className={"container"}>
            <Board isNext={isNext} squares={currentSquares} onPlay={handlePlay}></Board>
        </div>
    )
}