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


    return (
        <div className={"board"}>
            {[0,1,2].map((row) => (
                <div className={"board-row"} key={row}>
                    {[0,1,2].map((col) => {
                        const index = row * 3 + col;
                        return <Square key={index} value={squares[index]} onSquareClick={()=>handelClick(index)}></Square>
                    })}
                </div>
            ))}
        </div>
    )
}

// 主输出
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
            <div>
                <h3>历史记录</h3>
                <ol>
                    {history.map((squares, move) => {
                        let description;
                        if (move > 0) {
                            description = `Go to move #${move}`;
                        } else {
                            description = 'Go to game start';
                        }
                        return (
                            <li key={move}>
                                <button onClick={() => setCurrentMove(move)}
                                        disabled={move === currentMove}>{description}</button>
                            </li>
                        )
                    })}
                </ol>
                <h3>获胜者 : {calculateWinner(currentSquares) ? calculateWinner(currentSquares) : '还未决出胜负'}</h3>
                <button onClick={() => {
                    setHistory([Array(9).fill(null)]);
                    setCurrentMove(0);
                }}>重新开始
                </button>
            </div>
        </div>
    )
}