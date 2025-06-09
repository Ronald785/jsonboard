import React from "react";
import type { FileEntry, Folder } from "@/types";
import { Button } from "./ui/button";
import { EllipsisVertical, FileJson, Folder as FolderIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "./ui/dropdown-menu";

interface FolderViewProps {
    folders: Folder[];
    files: FileEntry[];
    onFolderClick: (id: string) => void;
    onFileClick: (file: FileEntry) => void;
    onRenameFile: (file: FileEntry) => void;
    onDeleteFile: (fileId: string) => void;
    onRenameFolder: (folder: Folder) => void;
    onDeleteFolder: (folderId: string) => void;
}

const FolderView: React.FC<FolderViewProps> = ({
    folders,
    files,
    onFolderClick,
    onFileClick,
    onRenameFile,
    onDeleteFile,
    onRenameFolder,
    onDeleteFolder
}) => {
    return (
        <div>
            {folders.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold">Pastas</h2>
                    <div className="flex flex-wrap gap-4">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className="flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow"
                            >
                                <div
                                    className="flex flex-1 cursor-pointer gap-2"
                                    onClick={() => onFolderClick(folder.id)}
                                >
                                    <FolderIcon size={24} /> {folder.name}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <EllipsisVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRenameFolder(folder);
                                            }}
                                        >
                                            Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFolder(folder.id);
                                            }}
                                        >
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
                                className="flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow"
                            >
                                <div
                                    className="flex flex-1 cursor-pointer gap-2"
                                    onClick={() => onFileClick(file)}
                                >
                                    <FileJson size={24} />
                                    {file.name}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <EllipsisVertical />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRenameFile(file);
                                            }}
                                        >
                                            Renomear
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFile(file.id);
                                            }}
                                        >
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default FolderView;
