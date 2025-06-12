import { getFolderPath } from "@/database/dexieHelpers";
import { useAppStore } from "@/stores/use-explore-store";
import type { FileEntry, Folder } from "@/types";
import { useState, useEffect } from "react";
import FolderBreadcrumb from "./FolderBreadcrumb";
import FileViewer from "./FileViewer";
import FolderView from "./FolderView";
import { SidebarTrigger } from "./ui/sidebar";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "./ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogDescription
} from "./ui/alert-dialog";
import { EllipsisVertical } from "lucide-react";
import FolderSelectDialog from "./FolderSelectDialog";

const FileExplorer: React.FC = () => {
    const currentFolderId = useAppStore((state) => state.currentFolderId);
    const files = useAppStore((state) => state.files);
    const folders = useAppStore((state) => state.folders);
    const loadFolderContents = useAppStore((state) => state.loadFolderContents);

    const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
    const [openedFile, setOpenedFile] = useState<FileEntry | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [orderBy, setOrderBy] = useState<
        "name" | "createdAt" | "lastModified"
    >("name");
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

    const [renameItem, setRenameItem] = useState<FileEntry | Folder | null>(
        null
    );
    const [newName, setNewName] = useState("");

    const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);

    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FileEntry | Folder | null>(
        null
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadFolderContents(currentFolderId);
                const path = await getFolderPath(currentFolderId);
                setBreadcrumb(path);
            } catch (error) {
                console.error("Erro ao carregar o conteúdo da pasta:", error);
            }
        };
        void fetchData();
    }, [currentFolderId, loadFolderContents]);

    useEffect(() => {
        const clearSelection = () => {
            setSelectedItems([]);
            setIsSelecting(false);
        };
        window.addEventListener("clear-selection", clearSelection);
        return () => {
            window.removeEventListener("clear-selection", clearSelection);
        };
    }, []);

    const handleMoveConfirm = async (targetId: string) => {
        await useAppStore.getState().moveItems(selectedItems, targetId);
        setSelectedItems([]);
        setIsSelecting(false);
        setMoveDialogOpen(false);
        await loadFolderContents(currentFolderId);
    };

    const handleOpenFile = async (file: FileEntry) => {
        try {
            setOpenedFile(file);
            const path = await getFolderPath(file.folderId);
            setBreadcrumb(path);
        } catch (error) {
            console.error("Erro ao abrir o arquivo:", error);
        }
    };

    const handleCloseFile = () => setOpenedFile(null);

    const handleRename = (item: FileEntry | Folder) => {
        setRenameItem(item);
        setNewName(item.name);
    };

    const handleRenameConfirm = async () => {
        if (!renameItem) return;
        const folderId = currentFolderId;
        if ("contentId" in renameItem) {
            await useAppStore.getState().renameFile(renameItem.id, newName);
        } else {
            await useAppStore.getState().renameFolder(renameItem.id, newName);
            useAppStore.getState().triggerSidebarRefresh();
            localStorage.setItem("sidebar-refresh", Date.now().toString());
        }
        await loadFolderContents(folderId);
        const path = await getFolderPath(folderId);
        setBreadcrumb(path);
        setRenameItem(null);
    };

    const handleDeleteFolder = async () => {
        if (!breadcrumb.length) return;
        const folderIdToDelete = breadcrumb[breadcrumb.length - 1].id;
        const parentFolderId =
            breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].id : "";
        await useAppStore.getState().deleteFolderById(folderIdToDelete);
        useAppStore.getState().triggerSidebarRefresh();
        await loadFolderContents(parentFolderId);
        const path = await getFolderPath(parentFolderId);
        setBreadcrumb(path);
        setDeleteFolderDialogOpen(false);
        localStorage.setItem("sidebar-refresh", Date.now().toString());
    };

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sortedFiles = [...filteredFiles].sort((a, b) => {
        const valA = a[orderBy];
        const valB = b[orderBy];
        if (valA < valB) return orderDirection === "asc" ? -1 : 1;
        if (valA > valB) return orderDirection === "asc" ? 1 : -1;
        return 0;
    });

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        if ("contentId" in deleteTarget) {
            await useAppStore.getState().deleteFileById(deleteTarget.id);
        } else {
            await useAppStore.getState().deleteFolderById(deleteTarget.id);
            useAppStore.getState().triggerSidebarRefresh();
            localStorage.setItem("sidebar-refresh", Date.now().toString());
        }

        await loadFolderContents(currentFolderId);
        setDeleteTarget(null);
        setDeleteDialogOpen(false);
    };

    return (
        <div className="h-full w-full p-4">
            <div className="bg-accent flex h-full w-full flex-col rounded-2xl p-4">
                <FolderBreadcrumb
                    breadcrumb={breadcrumb}
                    currentFile={openedFile}
                    onCloseFile={handleCloseFile}
                />

                <div className="my-4 flex gap-2">
                    <SidebarTrigger className="bg-accent-foreground text-accent cursor-pointer" />
                    <h1 className="text-xl font-bold">
                        Explorador de Arquivos
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                        {breadcrumb.length > 0
                            ? breadcrumb[breadcrumb.length - 1].name
                            : "Home"}
                    </h2>
                    {breadcrumb.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                                className="cursor-pointer"
                            >
                                <EllipsisVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleRename(
                                            breadcrumb[breadcrumb.length - 1]
                                        )
                                    }
                                >
                                    Renomear Pasta
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setDeleteFolderDialogOpen(true)
                                    }
                                >
                                    Excluir Pasta
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {!openedFile && (
                    <div className="my-4 flex flex-wrap gap-4">
                        <Input
                            type="text"
                            placeholder="Pesquisar arquivos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white md:w-1/3"
                        />

                        <Select
                            value={orderBy}
                            onValueChange={(val) => setOrderBy(val as any)}
                        >
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Nome</SelectItem>
                                <SelectItem value="createdAt">
                                    Data de criação
                                </SelectItem>
                                <SelectItem value="lastModified">
                                    Data de atualização
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={orderDirection}
                            onValueChange={(val) =>
                                setOrderDirection(val as any)
                            }
                        >
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Direção" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascendente</SelectItem>
                                <SelectItem value="desc">
                                    Descendente
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {!isSelecting ? (
                            <Button
                                onClick={() => setIsSelecting(true)}
                                className="cursor-pointer"
                            >
                                Selecionar
                            </Button>
                        ) : (
                            <>
                                <Button
                                    disabled={selectedItems.length === 0}
                                    onClick={() => setMoveDialogOpen(true)}
                                >
                                    Mover ({selectedItems.length})
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsSelecting(false);
                                        setSelectedItems([]);
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {!openedFile ? (
                    <div className="flex-1">
                        <FolderView
                            folders={folders}
                            files={sortedFiles}
                            onFolderClick={(id) =>
                                useAppStore.getState().setCurrentFolderId(id)
                            }
                            setDeleteTarget={setDeleteTarget}
                            setDeleteDialogOpen={setDeleteDialogOpen}
                            setIsSelecting={setIsSelecting}
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onFileClick={handleOpenFile}
                            onRenameFile={(f) => handleRename(f)}
                            onRenameFolder={(f) => handleRename(f)}
                            isSelecting={isSelecting}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                        />
                    </div>
                ) : (
                    <FileViewer file={openedFile} onClose={handleCloseFile} />
                )}

                <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
                    <DialogContent className="w-96">
                        <DialogHeader>
                            <DialogTitle>
                                Escolha a pasta de destino
                            </DialogTitle>
                        </DialogHeader>
                        <FolderSelectDialog
                            initialFolderId={currentFolderId}
                            onConfirm={handleMoveConfirm}
                            onCancel={() => setMoveDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={!!renameItem}
                    onOpenChange={() => setRenameItem(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Renomear {renameItem?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-2"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setRenameItem(null)}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleRenameConfirm}>
                                Salvar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <AlertDialog
                    open={deleteFolderDialogOpen}
                    onOpenChange={setDeleteFolderDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Pasta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir esta pasta? Esta
                                ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteFolder}>
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirmar Exclusão
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir "
                                {deleteTarget?.name}"? Esta ação não poderá ser
                                desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setDeleteDialogOpen(false)}
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDelete}>
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default FileExplorer;
