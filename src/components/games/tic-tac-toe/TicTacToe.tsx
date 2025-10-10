import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Application, Container, FederatedPointerEvent, Graphics, Rectangle} from "pixi.js";
import "./TicTacToe.css";

type TSymbolType = 'X' | 'O';

interface GameState {
    squares: (TSymbolType | null)[];
    isXNext: boolean;
    winner: TSymbolType | null | 'draw in the game';
    isStarted: boolean;
    step: number;
}

function TicTacToe() {
    const BOARD_SIZE = 330;
    const CELL_SIZE = BOARD_SIZE / 3;
    const cellCoordinate: [number, number[]][] = [
        [0, [0, 0]], [1, [1, 0]], [2, [2, 0]],
        [3, [0, 1]], [4, [1, 1]], [5, [2, 1]],
        [6, [0, 2]], [7, [1, 2]], [8, [2, 2]]
    ];

    const appRef = useRef<Application | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [playerSymbol, setPlayerSymbol] = useState<TSymbolType>('X');
    let cellPattern = '012345678036147258048246';
    const [gameState, setGameState] = useState<GameState>({
        squares: Array(9).fill(null),
        isXNext: true,
        winner: null,
        isStarted: false,
        step: 0
    });
    let mapCellCoordinateRef = useRef(new Map<number, number[]>([...cellCoordinate]));

    useEffect(() => {
        initPixiApp();

        return () => {
            const app = appRef.current;
            if (app) {
                app.stage.removeAllListeners();
                app.stage.removeChildren();
                app.destroy(true, true);
                appRef.current = null;
                canvasRef.current = null;
            }
        };
    }, []);

    const handlePointerDown = (ev: FederatedPointerEvent) => {
        const global = ev.global;

        const col = Math.floor(global.x / CELL_SIZE);
        const row = Math.floor(global.y / CELL_SIZE);
        const index = row * 3 + col;

        updateGameState({index, col, row, isUpdatePattern: true});
    };

    const init = () => {
        const app = appRef.current as Application;
        if (!app) {
            return;
        }
        app.stage.off('pointerdown');
        app.stage.eventMode = 'static';
        app.stage.hitArea = new Rectangle(0, 0, BOARD_SIZE, BOARD_SIZE);
        app.stage.on('pointerdown', handlePointerDown);
    }

    const initPixiApp = () => {
        (async () => {
            if (appRef.current) {
                return;
            }

            if (!canvasRef.current) {
                const canvas = document.createElement('canvas');
                canvasRef.current = canvas as HTMLCanvasElement;
                containerRef.current?.appendChild(canvas);
            }

            try {
                const app = new Application();
                await app.init({
                    canvas: canvasRef.current as HTMLCanvasElement | undefined,
                    height: BOARD_SIZE,
                    width: BOARD_SIZE,
                    backgroundColor: '#FFFFFF',
                    autoDensity: true
                });

                appRef.current = app;
                drawBorder();
            } catch (e) {
                console.error('Error from app catch: ' + e);
            }
        })();
    }

    const drawBorder = () => {
        const app = appRef.current;
        if (!app) {
            return;
        }
        app.stage.removeChildren();
        const grid = new Graphics();
        grid.setStrokeStyle({width: 2, color: 'black'});
        for (let i = 1; i < 3; i++) {
            grid.moveTo(i * CELL_SIZE, 0);
            grid.lineTo(i * CELL_SIZE, BOARD_SIZE);
            grid.moveTo(0, i * CELL_SIZE);
            grid.lineTo(BOARD_SIZE, i * CELL_SIZE);
        }
        grid.stroke();
        app.stage.addChild(grid);
    };

    const initGameSettings = () => {
        resetAllState();
        init();
        if (playerSymbol === 'O') {
            botDraw();
        }
    }

    const resetAllState = useCallback(() => {
        mapCellCoordinateRef.current = new Map<number, number[]>([...cellCoordinate]);
        setGameState((prevState) => ({
            ...prevState,
            isXNext: true,
            isStarted: true,
            step: 0,
            squares: Array(9).fill(null)
        }));
        const app = appRef.current;
        if (app) {
            app?.stage.removeChildren();
            drawBorder();
            app.stage.hitArea = null;
            app.stage.eventMode = 'none';
        }
    }, []);

    const updateGameState = (
        {index, col, row, isUpdatePattern}: { index: number, col: number, row: number, isUpdatePattern?: boolean }
    ) => {
        setGameState(prevState => {
            if (index >= 0 && index < 9 && !prevState.squares[index]) {
                const newSquares = [...prevState.squares];
                const symbol = prevState.isXNext ? 'X' : 'O';
                newSquares[index] = symbol;
                cellPattern = cellPattern.replaceAll(`${index}`, symbol);
                const nextStep = ++prevState.step;
                const winner = calculateWinner(newSquares, symbol);
                drawSymbol(col, row, prevState.isXNext);
                if (isUpdatePattern && !winner) {
                    botDraw(index);
                }

                return {
                    ...prevState,
                    isXNext: !prevState.isXNext,
                    squares: newSquares,
                    winner: winner,
                    step: nextStep,
                    isStarted: !winner
                };
            }
            return prevState;
        });
    };

    const calculateWinner = (squares: (TSymbolType | null)[], symbol: TSymbolType): TSymbolType | null | 'draw in the game' => {
        const regExp = new RegExp(symbol, 'g');
        const chunkSize = 3;
        for (let i = 0; i < 24; i += chunkSize) {
            const res = cellPattern.slice(i, i + chunkSize);
            const len = res.match(regExp)?.length;
            if (len === 3) {
                return symbol;
            }
        }
        return squares?.find(el => !el) === undefined ? 'draw in the game' : null;
    };

    const botDraw = (index?: number) => {
        const mapCellCoordinate = mapCellCoordinateRef.current;
        if (Number.isInteger(index)) {
            mapCellCoordinate.delete(index as number);
        }
        const keys = [...mapCellCoordinate.keys()];
        if (keys.length) {
            const randomIndex = Math.floor(Math.random() * keys.length);
            const key = keys[randomIndex];
            const [col, row] = mapCellCoordinate.get(key) as number[];
            mapCellCoordinate.delete(key);
            updateGameState({index: key, col, row});
        }
    };

    const getCellCoordinate = (col: number, row: number): { x: number, y: number } => {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;
        return {x, y};
    }

    const drawSymbol = (col: number, row: number, isXNext: boolean) => {
        const app = appRef.current;
        const container = new Container();
        const {x, y} = getCellCoordinate(col, row);
        isXNext ? drawX(container, x, y) : drawO(container, x, y);
        app?.stage.addChild(container);
    };

    const drawX = (container: Container<any>, x: number, y: number) => {
        const cross = new Graphics();
        const padding = CELL_SIZE * 0.2;
        cross.setStrokeStyle({width: 2, color: 'green'});
        cross.moveTo(x + padding, y + padding);
        cross.lineTo(x + CELL_SIZE - padding, y + CELL_SIZE - padding);
        cross.moveTo(x + CELL_SIZE - padding, y + padding);
        cross.lineTo(x + padding, y + CELL_SIZE - padding);
        cross.stroke();
        container.addChild(cross);
    };

    const drawO = (container: Container<any>, x: number, y: number) => {
        const circle = new Graphics();
        const radius = (CELL_SIZE * 0.8) / 2;
        const centerX = x + CELL_SIZE / 2;
        const centerY = y + CELL_SIZE / 2;
        circle.setStrokeStyle({width: 2, color: 'red'});
        circle.circle(centerX, centerY, radius);
        circle.stroke();
        container.addChild(circle);
    };

    const menuTemplate = useMemo(() => {
        const types: TSymbolType[] = ['X', 'O'];
        return (
            <div id="menu">
                <div>
                    {
                        !gameState.winner || <span>Winner: {gameState.winner}!</span>
                    }
                    <div>
                        Select symbol:
                        {
                            types.map(el => {
                                return (
                                    <div key={el}>
                                        <label htmlFor={el}>
                                            <input
                                                onChange={() => setPlayerSymbol(el)}
                                                name="type" type="radio" id={el}
                                                checked={playerSymbol === el}
                                            />
                                            {el}
                                        </label>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <button onClick={initGameSettings}>start</button>
            </div>
        );
    }, [playerSymbol, gameState.winner]);

    return (
        <div ref={containerRef}>
            {gameState.isStarted || menuTemplate}
        </div>
    );
}

export default TicTacToe;
