import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import {
    listFilesInFolder,
    saveFile,
    createFolder,
    moveItemsToFolder,
    deleteFile,
    deleteFolder,
    updateFileMetadata,
    updateFolderName
} from "@/database/dexieHelpers";
import type { FileEntry, Folder } from "@/types";

interface AppState {
    currentFolderId: string;
    files: FileEntry[];
    folders: Folder[];

    setCurrentFolderId: (id: string) => void;
    loadFolderContents: (folderId: string) => Promise<void>;
    addFile: (name: string, content: string) => Promise<void>;
    addFolder: (name: string) => Promise<void>;
    moveItems: (itemIds: string[], targetFolderId: string) => Promise<void>;
    deleteFileById: (fileId: string) => Promise<void>;
    deleteFolderById: (folderId: string) => Promise<void>;
    renameFile: (fileId: string, newName: string) => Promise<void>;
    renameFolder: (folderId: string, newName: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        immer((set, get) => ({
            currentFolderId: "", // default root
            files: [],
            folders: [],

            setCurrentFolderId: (id) => {
                set((state) => {
                    state.currentFolderId = id;
                });
            },

            loadFolderContents: async (folderId) => {
                const { files, folders } = await listFilesInFolder(folderId);
                set((state) => {
                    state.files = files;
                    state.folders = folders;
                    state.currentFolderId = folderId;
                });
            },

            addFile: async (name, content) => {
                const folderId = get().currentFolderId;
                await saveFile(name, content, folderId);
                await get().loadFolderContents(folderId);
            },

            addFolder: async (name) => {
                const folderId = get().currentFolderId;
                await createFolder(name, folderId);
                await get().loadFolderContents(folderId);
            },

            moveItems: async (itemIds, targetFolderId) => {
                await moveItemsToFolder(itemIds, targetFolderId);
                await get().loadFolderContents(get().currentFolderId);
            },

            deleteFileById: async (fileId) => {
                await deleteFile(fileId);
                await get().loadFolderContents(get().currentFolderId);
            },

            deleteFolderById: async (folderId) => {
                await deleteFolder(folderId);
                await get().loadFolderContents(get().currentFolderId);
            },

            renameFile: async (fileId, newName) => {
                await updateFileMetadata(fileId, { name: newName });
                await get().loadFolderContents(get().currentFolderId);
            },

            renameFolder: async (folderId, newName) => {
                await updateFolderName(folderId, newName);
                await get().loadFolderContents(get().currentFolderId);
            }
        })),
        {
            name: "explore-storage",
            partialize: (state) => ({
                currentFolderId: state.currentFolderId
            })
        }
    )
);
