import type { FileContent, FileEntry, Folder } from "@/types";
import Dexie, { type Table } from "dexie";

export class AppDB extends Dexie {
    files!: Table<FileEntry, string>;
    folders!: Table<Folder, string>;
    contents!: Table<FileContent, string>;

    constructor() {
        super("jsonBoardDB");
        this.version(1).stores({
            files: "id, name, folderId, createdAt, lastModified, size",
            folders: "id, name, folderId, createdAt, lastModified",
            contents: "id"
        });
    }
}

export const db = new AppDB();
