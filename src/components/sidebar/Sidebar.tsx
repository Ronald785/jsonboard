import React, { useEffect, useState } from "react";
import { useAppStore } from "@/stores/use-explore-store";
import { db } from "@/database/db";
import { Button } from "../ui/button";
import type { Folder } from "@/types";
import {
    BookOpen,
    Bot,
    ChevronRight,
    Folder as FolderIcon,
    House,
    Plus,
    SquareTerminal
} from "lucide-react";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from "../ui/sidebar";

import DialogUploadComponent from "./DialogUpload";
import DialogNewFolder from "./DialogNewFolder";

const SidebarComponent: React.FC = () => {
    const setCurrentFolderId = useAppStore((state) => state.setCurrentFolderId);
    const addFolder = useAppStore((state) => state.addFolder);
    const currentFolderId = useAppStore((state) => state.currentFolderId);

    const [rootFolders, setRootFolders] = useState<Folder[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
        new Set()
    );
    const [subfolders, setSubfolders] = useState<Record<string, Folder[]>>({});
    const [foldersWithChildren, setFoldersWithChildren] = useState<Set<string>>(
        new Set()
    );
    const [totalSize, setTotalSize] = useState<number>(0);
    const [newFolderName, setNewFolderName] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const fetchData = async () => {
        const folders = await db.folders.where("folderId").equals("").toArray();
        setRootFolders(folders);

        const allFolders = await db.folders.toArray();
        const parentsWithChildren = new Set<string>();
        const groupedSubfolders: Record<string, Folder[]> = {};
        allFolders.forEach((f) => {
            if (f.folderId) {
                parentsWithChildren.add(f.folderId);
                if (!groupedSubfolders[f.folderId]) {
                    groupedSubfolders[f.folderId] = [];
                }
                groupedSubfolders[f.folderId].push(f);
            }
        });
        setFoldersWithChildren(parentsWithChildren);
        setSubfolders(groupedSubfolders);

        const allFiles = await db.files.toArray();
        const sizeSum = allFiles.reduce((sum, file) => sum + file.size, 0);
        setTotalSize(sizeSum);
    };

    useEffect(() => {
        fetchData();
        const handleStorage = (event: StorageEvent) => {
            if (event.key === "sidebar-refresh") {
                void fetchData();
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await addFolder(newFolderName.trim());
        setNewFolderName("");
        setDialogOpen(false);
        await fetchData();
        localStorage.setItem("sidebar-refresh", Date.now().toString());
    };

    const formatSize = (bytes: number) => {
        if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
        if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
        if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
        return `${bytes} B`;
    };

    const renderFolder = (folder: Folder) => {
        const hasChildren = foldersWithChildren.has(folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        const handleToggle = () => {
            setExpandedFolders((prev) => {
                const updated = new Set(prev);
                if (updated.has(folder.id)) {
                    updated.delete(folder.id);
                } else {
                    updated.add(folder.id);
                }
                return updated;
            });
        };

        const handleSelectFolder = () => {
            setCurrentFolderId(folder.id);
        };

        return (
            <SidebarMenuItem key={folder.id}>
                {hasChildren ? (
                    <Collapsible open={isExpanded} onOpenChange={handleToggle}>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                                <FolderIcon size={16} />
                                {/* Clique apenas no nome da pasta */}
                                <span
                                    onClick={handleSelectFolder}
                                    className="cursor-pointer"
                                >
                                    {folder.name}
                                </span>
                                <ChevronRight
                                    className={`ml-auto transition-transform duration-200 ${
                                        isExpanded ? "rotate-90" : ""
                                    }`}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {subfolders[folder.id]?.map((sub) =>
                                    renderFolder(sub)
                                )}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                ) : (
                    <SidebarMenuButton onClick={handleSelectFolder}>
                        <FolderIcon size={16} />
                        <span>{folder.name}</span>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        );
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button className="cursor-pointer">
                                        <House size={16} />
                                        Home
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Pastas</SidebarGroupLabel>
                    <SidebarMenu>
                        {rootFolders.map((folder) => renderFolder(folder))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <DialogNewFolder
                    dialogOpen={dialogOpen}
                    setDialogOpen={setDialogOpen}
                    handleCreateFolder={handleCreateFolder}
                    newFolderName={newFolderName}
                    setNewFolderName={setNewFolderName}
                />
                <DialogUploadComponent
                    uploadDialogOpen={uploadDialogOpen}
                    setUploadDialogOpen={setUploadDialogOpen}
                />
                <div className="mt-4 text-center text-sm">
                    <strong>Espaço usado:</strong> {formatSize(totalSize)}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default SidebarComponent;
