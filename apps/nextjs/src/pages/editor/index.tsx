import { type MouseEvent, useCallback, useRef, useState } from "react"
import clsx from "clsx"
type GridSize = [number, number];
type MouseCoords = { startX: number, startY: number, scrollLeft: number, scrollTop: number }
type Cursor = "grab" | "default"
function MapEditor() {
    const [gridSize, setGridSize] = useState<GridSize>([30, 30]);
    const grid = useRef<HTMLDivElement | null>(null);
    const [cursor, setCursor] = useState<Cursor>("default")
    const isMouseDown = useRef<boolean>(false);
    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0
    });

    const constructGrid = useCallback(() => {
        const grid: Array<JSX.Element> = [];
        for (let i = 0; i < gridSize[0]; i++) {
            const cols: Array<JSX.Element> = []
            for (let j = 0; j < gridSize[1]; j++) {
                cols.push(<div className="bg-gray-300 border w-12 h-12" key={`${i}-${j}`}></div>)
            }
            grid.push(<div className="flex flex-row" key={i}>{...cols}</div>)
        }

        return grid;
    }, [gridSize])
    const handleMouseDown = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!grid.current) return
        const startX = e.pageX - grid.current.offsetLeft;
        const startY = e.pageY - grid.current.offsetTop;
        const scrollLeft = grid.current.scrollLeft;
        const scrollTop = grid.current.scrollTop;
        mouseCoords.current = { startX, startY, scrollLeft, scrollTop }
        isMouseDown.current = true

        grid.current.style.cursor = "grab"
    }
    const handleMouseUp = () => {
        isMouseDown.current = false
        if (!grid.current) return
        grid.current.style.cursor = "default"
    }
    const handleDrag = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!isMouseDown.current || !grid.current || cursor !== "grab") return;
        e.preventDefault();

        const x = e.pageX - grid.current.offsetLeft;
        const y = e.pageY - grid.current.offsetTop;
        const walkX = (x - mouseCoords.current.startX) * 2;
        const walkY = (y - mouseCoords.current.startY) * 2;
        grid.current.scrollLeft = mouseCoords.current.scrollLeft - walkX;
        grid.current.scrollTop = mouseCoords.current.scrollTop - walkY;

    }
    return (
        <div className="flex">
            <div ref={grid} className={clsx(`flex flex-col items-center overflow-scroll w-3/4 max-h-screen`)}
                onMouseDown={handleMouseDown}
                onMouseUp={(handleMouseUp)}
                onMouseMove={handleDrag}
            >
                {...constructGrid()}
            </div>
            <div>
                <div onClick={() => setGridSize(prev => [prev[0] + 1, prev[1] + 1])}>
                    +
                </div>
                <div onClick={() => setGridSize(prev => [prev[0] - 1, prev[1] - 1])}>-</div>
            </div>
            <div onClick={() => setCursor("grab")}>
                hand
            </div>
            <div onClick={() => setCursor("default")}>
                arrow
            </div>
        </div>
    )
}

export default MapEditor