import { type MouseEvent, useRef, useState, useMemo, useEffect } from "react"
import clsx from "clsx"
type GridSize = [number, number];
type MouseCoords = { startX: number, startY: number, scrollLeft: number, scrollTop: number }
type Cursor = "grab" | "default"
const textures = [
    {
        name: "stone",
        src: "https://static.planetminecraft.com/files/image/minecraft/texture-pack/2021/363/14104498-stone_s.webp"
    },
    {
        name: "dirt",
        src: "https://static.planetminecraft.com/files/image/minecraft/texture-pack/2021/363/14104498-stone_s.webp"
    },
    {
        name: "wood",
        src: "https://static.planetminecraft.com/files/image/minecraft/texture-pack/2021/363/14104498-stone_s.webp"
    }
]

function MapEditor() {
    const [gridSize, setGridSize] = useState<GridSize>([30, 30]);
    const grid = useRef<HTMLDivElement | null>(null);
    const [cursor, setCursor] = useState<Cursor>("default")
    const [currentTexture, setCurrentTexture] = useState<string>();
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const mouseCoords = useRef<MouseCoords>({
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0
    });
    useEffect(() => {
        if (!grid.current) return;
        const currentGrid = grid.current
        function stopDefaultScroll(e: Event) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        currentGrid.addEventListener("scroll", stopDefaultScroll);
        currentGrid.addEventListener("touchmove", stopDefaultScroll)
        currentGrid.addEventListener("mousewheel", stopDefaultScroll)
        return () => {
            currentGrid.removeEventListener("scroll", stopDefaultScroll);
            currentGrid.removeEventListener("touchmove", stopDefaultScroll)
            currentGrid.removeEventListener("mousewheel", stopDefaultScroll)
        }
    }, [grid])
    function Toolbar() {
        return (
            <div>
                <div>
                    textures
                    {
                        textures.map(i => <div onClick={() => setCurrentTexture(i.src)} key={i.name}>
                            {i.name}
                        </div>)
                    }
                </div>
            </div>
        )
    }
    const constructGrid = useMemo(() => {
        const grid: Array<JSX.Element> = [];
        for (let i = 0; i < gridSize[0]; i++) {
            const cols: Array<JSX.Element> = []
            for (let j = 0; j < gridSize[1]; j++) {
                cols.push(<div className="bg-gray-300 border w-12 h-12" onMouseOver={
                    (e) => {
                        if (!currentTexture) return
                        const img = e.currentTarget.firstChild as HTMLImageElement;
                        img.src = currentTexture
                    }

                }
                    onClick={(e) => {
                        if (!currentTexture) return
                        const img = e.currentTarget.firstChild as HTMLImageElement;
                        img.src = currentTexture
                        img.dataset.comitted = currentTexture;
                    }}
                    onMouseLeave={
                        (e) => {
                            const img = e.currentTarget.firstChild as HTMLImageElement;
                            if (img.dataset.comitted === currentTexture) return;
                            img.src = ""
                        }
                    }

                    key={`${i}-${j}`}>
                    <img onDragStart={(e) => {
                        e.preventDefault();
                    }} alt="texture" src="">
                    </img>
                </div>)
            }
            grid.push(<div className="flex flex-row" key={i}>{...cols}</div>)
        }

        return grid;
    }, [gridSize])
    const handleMouseDown = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!grid.current || cursor !== "grab") return
        const startX = e.pageX - grid.current.offsetLeft;
        const startY = e.pageY - grid.current.offsetTop;
        const scrollLeft = grid.current.scrollLeft;
        const scrollTop = grid.current.scrollTop;
        mouseCoords.current = { startX, startY, scrollLeft, scrollTop }
        setIsMouseDown(true)

        document.body.style.cursor = "grabbing"
    }
    const handleMouseUp = () => {
        setIsMouseDown(false)
        if (!grid.current) return
        document.body.style.cursor = "default"
    }
    const handleDrag = (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!isMouseDown || !grid.current || cursor !== "grab") return;
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
            <div

                ref={grid}
                className={clsx(`flex select-none flex-col scrollbar-none items-center overflow-scroll w-3/4 max-h-screen`,
                    { "cursor-default": !isMouseDown && cursor === "default" },
                    { "cursor-grab": !isMouseDown && cursor === "grab" }

                )}
                onMouseDown={handleMouseDown}
                onMouseUp={(handleMouseUp)}
                onMouseMove={handleDrag}
            >
                {...constructGrid}
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
            <Toolbar />
        </div>
    )
}

export default MapEditor