/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";

interface JsonRendererProps {
    data: any;
    path: (string | number)[];
    rootContent: any;
    onUpdateContent: (updatedContent: any) => void;
    onStartEditing?: (path: (string | number)[]) => void;
    onStopEditing?: (path: (string | number)[]) => void;
    isConflictingMap?: Record<string, boolean>;
}

const ITEMS_PER_PAGE = 50;

const JsonRenderer: React.FC<JsonRendererProps> = ({
    data,
    path,
    rootContent,
    onUpdateContent,
    onStartEditing,
    onStopEditing,
    isConflictingMap
}) => {
    const conflictKey = path.join(".");
    const isConflicting = !!isConflictingMap?.[conflictKey];

    if (Array.isArray(data)) {
        return (
            <JsonArrayRenderer
                data={data}
                path={path}
                rootContent={rootContent}
                onUpdateContent={onUpdateContent}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                isConflictingMap={isConflictingMap}
            />
        );
    } else if (typeof data === "object" && data !== null) {
        return (
            <JsonObjectRenderer
                data={data}
                path={path}
                rootContent={rootContent}
                onUpdateContent={onUpdateContent}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                isConflictingMap={isConflictingMap}
            />
        );
    } else {
        return (
            <JsonPrimitiveRenderer
                value={data}
                path={path}
                rootContent={rootContent}
                onUpdateContent={onUpdateContent}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
                isConflicting={isConflicting}
            />
        );
    }
};

const JsonPrimitiveRenderer: React.FC<{
    value: any;
    path: (string | number)[];
    rootContent: any;
    onUpdateContent: (updatedContent: any) => void;
    onStartEditing?: (path: (string | number)[]) => void;
    onStopEditing?: (path: (string | number)[]) => void;
    isConflicting?: boolean;
}> = ({
    value,
    path,
    rootContent,
    onUpdateContent,
    onStartEditing,
    onStopEditing,
    isConflicting
}) => {
    const [inputValue, setInputValue] = useState(String(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleBlur = () => {
        onStopEditing?.(path);

        const updated = structuredClone(rootContent);
        let target = updated;
        for (let i = 0; i < path.length - 1; i++) {
            target = target[path[i]];
        }
        const lastKey = path[path.length - 1];

        let parsedValue: any = inputValue;
        if (!isNaN(Number(inputValue)) && inputValue.trim() !== "") {
            parsedValue = Number(inputValue);
        } else if (inputValue.toLowerCase() === "true") {
            parsedValue = true;
        } else if (inputValue.toLowerCase() === "false") {
            parsedValue = false;
        }

        target[lastKey] = parsedValue;
        onUpdateContent(updated);
    };

    const handleFocus = () => {
        onStartEditing?.(path);
    };

    return (
        <input
            type="text"
            className={`editable-input w-full min-w-32 rounded border px-2 py-1 ${
                isConflicting ? "border-red-500" : ""
            }`}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleBlur();
                    (e.target as HTMLInputElement).blur();
                }
            }}
        />
    );
};

const JsonArrayRenderer: React.FC<JsonRendererProps> = ({
    data,
    path,
    rootContent,
    onUpdateContent,
    onStartEditing,
    onStopEditing,
    isConflictingMap
}) => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
                containerRef.current;
            if (scrollTop + clientHeight >= scrollHeight - 50) {
                setVisibleCount((prev) =>
                    Math.min(prev + ITEMS_PER_PAGE, data.length)
                );
            }
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ maxHeight: "400px", overflowY: "auto" }}
            className="mb-4 rounded border"
        >
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="bg-gray-200 px-2 py-1">Índice</th>
                        <th className="bg-gray-200 px-2 py-1">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {data
                        .slice(0, visibleCount)
                        .map((item: any, index: any) => (
                            // eslint-disable-next-line react-x/no-array-index-key
                            <tr key={index} className="border-b">
                                <td className="px-2 py-1">{index}</td>
                                <td className="px-2 py-1">
                                    <JsonRenderer
                                        data={item}
                                        path={[...path, index]}
                                        rootContent={rootContent}
                                        onUpdateContent={onUpdateContent}
                                        onStartEditing={onStartEditing}
                                        onStopEditing={onStopEditing}
                                        isConflictingMap={isConflictingMap}
                                    />
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

const JsonObjectRenderer: React.FC<JsonRendererProps> = ({
    data,
    path,
    rootContent,
    onUpdateContent,
    onStartEditing,
    onStopEditing,
    isConflictingMap
}) => {
    return (
        <div className="mb-4 rounded sm:border">
            <table className="w-full border-collapse">
                <tbody>
                    {Object.entries(data).map(([key, value]) => (
                        <tr key={key} className="border-b">
                            <td className="bg-gray-100 px-2 py-1 font-bold">
                                {key}
                            </td>
                            <td className="px-2 py-1">
                                <JsonRenderer
                                    data={value}
                                    path={[...path, key]}
                                    rootContent={rootContent}
                                    onUpdateContent={onUpdateContent}
                                    onStartEditing={onStartEditing}
                                    onStopEditing={onStopEditing}
                                    isConflictingMap={isConflictingMap}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JsonRenderer;
