import React from "react";
import type { FileEntry, Folder } from "@/types";
import { Button } from "./ui/button";

interface FolderViewProps {
    folders: Folder[];
    files: FileEntry[];
    onFolderClick: (id: string) => void;
    onFileClick: (file: FileEntry) => void;
}

const FolderView: React.FC<FolderViewProps> = ({
    folders,
    files,
    onFolderClick,
    onFileClick
}) => {
    return (
        <div className="mt-6">
            {folders.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold">Pastas</h2>
                    <div className="flex flex-wrap gap-4">
                        {folders.map((folder) => (
                            <Button
                                key={folder.id}
                                type="button"
                                className="mt-2 cursor-pointer"
                                onClick={() => onFolderClick(folder.id)}
                            >
                                {folder.name}
                            </Button>
                        ))}
                    </div>
                </>
            )}

            {files.length > 0 && (
                <>
                    <h2 className="mt-6 mb-2 text-lg font-semibold">
                        Arquivos
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="cursor-pointer rounded border p-2 shadow"
                                onClick={() => onFileClick(file)}
                            >
                                {file.name}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FolderView;
