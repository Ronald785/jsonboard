export interface FileContent {
    id: string;
    content: string;
}

export interface FileEntry {
    id: string;
    name: string;
    contentId: string;
    folderId: string; // '' = root
    createdAt: number; //timestamp
    lastModified: number;
    size: number; // em bytes
}

export interface Folder {
    id: string;
    name: string;
    folderId: string | null;
    createdAt: number;
    lastModified: number;
}
