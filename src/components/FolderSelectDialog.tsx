import React, { useState, useEffect } from "react";
import type { Folder } from "@/types";
import { getSubfolders, getFolderPath } from "@/database/dexieHelpers";
import { Button } from "./ui/button";
import { Folder as FolderICon, Home, Undo2 } from "lucide-react";

interface Props {
    initialFolderId: string;
    onConfirm: (targetFolderId: string) => void;
    onCancel: () => void;
}

const FolderSelectDialog: React.FC<Props> = ({
    initialFolderId,
    onConfirm,
    onCancel
}) => {
    const [currentId, setCurrentId] = useState(initialFolderId);
    const [subfolders, setSubfolders] = useState<Folder[]>([]);
    const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);

    useEffect(() => {
        (async () => {
            setSubfolders(await getSubfolders(currentId));
            setBreadcrumb(await getFolderPath(currentId));
        })();
    }, [currentId]);

    return (
        <>
            <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm">
                <button
                    onClick={() => setCurrentId("")}
                    className="bg-accent flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1 hover:bg-blue-300"
                >
                    <Home size={16} />
                    Home
                </button>
                {breadcrumb.map((f) => (
                    <React.Fragment key={f.id}>
                        <span>/</span>
                        <button
                            onClick={() => setCurrentId(f.id)}
                            className="flex cursor-pointer items-center gap-2 rounded-2xl px-2 py-1 hover:bg-blue-300"
                        >
                            <Undo2 size={16} />
                            {f.name}
                        </button>
                    </React.Fragment>
                ))}
            </nav>
            <div className="max-h-60 overflow-auto">
                {subfolders.map((f) => (
                    <div
                        key={f.id}
                        className="flex cursor-pointer items-center gap-2 p-1 hover:bg-gray-100"
                        onClick={() => setCurrentId(f.id)}
                    >
                        <FolderICon size={24} /> {f.name}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button onClick={() => onConfirm(currentId)}>Mover</Button>
            </div>
        </>
    );
};

export default FolderSelectDialog;
