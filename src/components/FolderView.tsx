import React, { useRef } from "react";
import type { FileEntry, Folder } from "@/types";
import { Button } from "./ui/button";
import { EllipsisVertical, FileJson, Folder as FolderIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "./ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import MarqueeSelect from "./MarqueeSelect";
import { useAppStore } from "@/stores/use-explore-store";
import { cn } from "@/lib/utils";

interface FolderViewProps {
    folders: Folder[];
    files: FileEntry[];
    onFolderClick: (id: string) => void;
    onFileClick: (file: FileEntry) => void;
    onRenameFile: (file: FileEntry) => void;
    onRenameFolder: (folder: Folder) => void;
    isSelecting: boolean;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    setIsSelecting: (state: boolean) => void;
    setDeleteTarget: (item: FileEntry | Folder) => void;
    setDeleteDialogOpen: (open: boolean) => void;
}

const FolderView: React.FC<FolderViewProps> = ({
    folders,
    files,
    onFolderClick,
    onFileClick,
    onRenameFile,
    onRenameFolder,
    isSelecting,
    selectedItems,
    setSelectedItems,
    setIsSelecting,
    setDeleteTarget,
    setDeleteDialogOpen
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const getSelectableElements = () => {
        return Array.from(
            containerRef.current?.querySelectorAll("[data-id]") || []
        );
    };

    return (
        <div ref={containerRef} className="relative h-full w-full">
            <MarqueeSelect
                containerRef={containerRef}
                getSelectableElements={getSelectableElements}
                onSelect={(ids) => {
                    setSelectedItems(ids);
                    setIsSelecting(true);
                }}
            />
            {folders.length > 0 && (
                <>
                    <h2 className="text-lg font-semibold select-none">
                        Pastas
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {folders.map((folder) => (
                            <div
                                data-id={folder.id}
                                key={folder.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        "application/json",
                                        JSON.stringify({
                                            ids: selectedItems.length
                                                ? selectedItems
                                                : [folder.id]
                                        })
                                    );
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={async (e) => {
                                    e.preventDefault();
                                    const data = JSON.parse(
                                        e.dataTransfer.getData(
                                            "application/json"
                                        )
                                    );
                                    await useAppStore
                                        .getState()
                                        .moveItems(data.ids, folder.id);

                                    window.dispatchEvent(
                                        new CustomEvent("clear-selection")
                                    );
                                    await useAppStore
                                        .getState()
                                        .loadFolderContents(
                                            useAppStore.getState()
                                                .currentFolderId
                                        );
                                }}
                                // className="flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow"
                                className={cn(
                                    `flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow ${selectedItems.includes(folder.id) ? "bg-blue-100" : ""}`
                                )}
                            >
                                {isSelecting && (
                                    <Checkbox
                                        id={`select-folder-${folder.id}`}
                                        className="mr-2"
                                        checked={selectedItems.includes(
                                            folder.id
                                        )}
                                        onCheckedChange={(checked) => {
                                            const isChecked = checked === true;
                                            setSelectedItems((prev) =>
                                                isChecked
                                                    ? [...prev, folder.id]
                                                    : prev.filter(
                                                          (id) =>
                                                              id !== folder.id
                                                      )
                                            );
                                        }}
                                    />
                                )}
                                <div
                                    // className={`flex flex-1 cursor-pointer gap-2 ${selectedItems.includes(folder.id) ? "bg-blue-100" : ""}`}
                                    className={`flex flex-1 cursor-pointer gap-2`}
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
                                                setDeleteTarget(folder);
                                                setDeleteDialogOpen(true);
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
                    <h2 className="mt-6 mb-2 text-lg font-semibold select-none">
                        Arquivos
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {files.map((file) => (
                            <div
                                data-id={file.id}
                                key={file.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                        "application/json",
                                        JSON.stringify({
                                            ids: selectedItems.length
                                                ? selectedItems
                                                : [file.id]
                                        })
                                    );
                                }}
                                // className="flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow"
                                className={cn(
                                    `flex w-full max-w-sm items-center justify-between rounded border bg-white p-2 shadow ${selectedItems.includes(file.id) ? "bg-blue-100" : ""}`
                                )}
                            >
                                {isSelecting && (
                                    <Checkbox
                                        id={`select-file-${file.id}`}
                                        className="mr-2"
                                        checked={selectedItems.includes(
                                            file.id
                                        )}
                                        onCheckedChange={(checked) => {
                                            const isChecked = checked === true;
                                            setSelectedItems((prev) =>
                                                isChecked
                                                    ? [...prev, file.id]
                                                    : prev.filter(
                                                          (id) => id !== file.id
                                                      )
                                            );
                                        }}
                                    />
                                )}
                                <div
                                    // className={`flex flex-1 cursor-pointer gap-2 ${selectedItems.includes(file.id) ? "bg-blue-100" : ""}`}
                                    className={`flex flex-1 cursor-pointer gap-2`}
                                    onClick={() => onFileClick(file)}
                                >
                                    <FileJson size={24} /> {file.name}
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
                                                setDeleteTarget(file);
                                                setDeleteDialogOpen(true);
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
