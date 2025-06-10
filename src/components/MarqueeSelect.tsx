import React, { useRef, useState, useEffect } from "react";

interface Props {
    onSelect: (ids: string[]) => void;
    containerRef: React.RefObject<HTMLElement>;
    getSelectableElements: () => HTMLElement[];
}

const MarqueeSelect: React.FC<Props> = ({
    onSelect,
    containerRef,
    getSelectableElements
}) => {
    const [start, setStart] = useState<{ x: number; y: number } | null>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return;

            if (e.target !== containerRef.current) return;

            setStart({ x: e.clientX, y: e.clientY });
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!start) return;
            const x = Math.min(e.clientX, start.x);
            const y = Math.min(e.clientY, start.y);
            const width = Math.abs(e.clientX - start.x);
            const height = Math.abs(e.clientY - start.y);
            setRect(new DOMRect(x, y, width, height));
        };

        const handleMouseUp = () => {
            if (rect && containerRef.current) {
                const selected: string[] = [];
                const items = getSelectableElements();

                for (const item of items) {
                    const itemRect = item.getBoundingClientRect();
                    const overlap =
                        rect.right > itemRect.left &&
                        rect.left < itemRect.right &&
                        rect.bottom > itemRect.top &&
                        rect.top < itemRect.bottom;

                    if (overlap) {
                        selected.push(item.dataset.id!);
                    }
                }

                onSelect(selected);
            }

            setStart(null);
            setRect(null);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("mousedown", handleMouseDown);
        }
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            if (container) {
                container.removeEventListener("mousedown", handleMouseDown);
            }
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [start, rect, containerRef, getSelectableElements, onSelect]);

    return (
        <>
            {rect && (
                <div
                    ref={boxRef}
                    className="bg-opacity-30 pointer-events-none fixed z-20 border border-blue-500 bg-transparent"
                    style={{
                        top: rect.y,
                        left: rect.x,
                        width: rect.width,
                        height: rect.height
                    }}
                />
            )}
        </>
    );
};

export default MarqueeSelect;
