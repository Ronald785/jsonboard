import type { FileContent, FileEntry, Folder } from "@/types";
import { Blob } from "buffer";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

export async function saveFile(
    name: string,
    content: string,
    folderId: string
): Promise<string> {
    const fileId = uuidv4();
    const contentId = uuidv4();
    const size = new Blob([content]).size;
    const now = Date.now();

    const fileEntry: FileEntry = {
        id: fileId,
        name,
        contentId,
        folderId,
        createdAt: now,
        lastModified: now,
        size
    };

    const fileContent: FileContent = {
        id: contentId,
        content
    };

    await db.transaction("rw", db.files, db.contents, async () => {
        await db.contents.add(fileContent);
        await db.files.add(fileEntry);
    });

    return fileId;
}

export async function getFileContent(contentId: string) {
    return await db.contents.get(contentId);
}

export async function updateFileContent(contentId: string, newContent: string) {
    await db.contents.update(contentId, { content: newContent });
}

export async function updateFileMetadata(
    fileId: string,
    updatedFields: Partial<Omit<FileEntry, "id" | "contentId" | "createdAt">>
) {
    await db.files.update(fileId, {
        ...updatedFields,
        lastModified: Date.now()
    });
}

export async function deleteFile(fileId: string): Promise<void> {
    const file = await db.files.get(fileId);
    if (!file) return;

    await db.transaction("rw", db.files, db.contents, async () => {
        await db.contents.delete(file.contentId);
        await db.files.delete(fileId);
    });
}

export async function createFolder(
    name: string,
    folderId: string
): Promise<string> {
    const id = uuidv4();
    const timestamp = Date.now();

    const folder: Folder = {
        id,
        name,
        folderId,
        createdAt: timestamp,
        lastModified: timestamp
    };

    await db.folders.add(folder);
    return id;
}

export async function getFolderById(folderId: string) {
    return await db.folders.get(folderId);
}

export async function updateFolderName(folderId: string, newName: string) {
    await db.folders.update(folderId, {
        name: newName,
        lastModified: Date.now()
    });
}

export async function listFilesInFolder(folderId: string) {
    const files = await db.files.where("folderId").equals(folderId).toArray();
    const folders = await db.folders
        .where("folderId")
        .equals(folderId)
        .toArray();
    return { files, folders };
}

async function getAllDescendantFolderIds(folderId: string): Promise<string[]> {
    const descendants: string[] = [];

    async function getChildren(id: string) {
        const children = await db.folders
            .where("folderId")
            .equals(id)
            .toArray();

        for (const child of children) {
            descendants.push(child.id);
            await getChildren(child.id);
        }
    }

    await getChildren(folderId);
    return descendants;
}

export async function moveItemsToFolder(
    itemIds: string[],
    targetFolderId: string
): Promise<void> {
    for (const id of itemIds) {
        const file = await db.files.get(id);

        if (file) {
            await db.files.update(id, { folderId: targetFolderId });
            continue;
        }

        const folder = await db.folders.get(id);
        if (folder) {
            if (id === targetFolderId) {
                console.warn(
                    `Não é possível mover a pasta ${id} para ela mesma.`
                );
                continue;
            }

            // Destino não pode ser subpasta da origem
            const descendantIds = await getAllDescendantFolderIds(folder.id);
            if (descendantIds.includes(targetFolderId)) {
                console.warn(
                    `Não é possível mover a pasta ${id} para uma de suas subpastas.`
                );
                continue;
            }

            await db.folders.update(id, { folderId: targetFolderId });
        }
    }
}

export async function deleteFolder(folderId: string): Promise<void> {
    const folder = await db.folders.get(folderId);
    if (!folder) return;

    const descendantFolderIds = await getAllDescendantFolderIds(folderId);

    const allFolderIds = [folderId, ...descendantFolderIds];

    const filesToDelete = await db.files
        .where("folderId")
        .anyOf(allFolderIds)
        .toArray();

    await db.transaction("rw", db.folders, db.files, db.contents, async () => {
        for (const file of filesToDelete) {
            await db.contents.delete(file.contentId);
        }

        await db.files.where("folderId").anyOf(allFolderIds).delete();

        await db.folders.where("id").anyOf(allFolderIds).delete();
    });
}

export async function isFolderEmpty(folderId: string): Promise<boolean> {
    const hasFiles = await db.files.where("folderId").equals(folderId).count();
    const hasSubfolders = await db.folders
        .where("folderId")
        .equals(folderId)
        .count();
    return hasFiles === 0 && hasSubfolders === 0;
}

export async function getAllFilesInFolder(
    folderId: string
): Promise<FileEntry[]> {
    const descendantFolderIds = await getAllDescendantFolderIds(folderId);
    const allFolderIds = [folderId, ...descendantFolderIds];

    const files = await db.files
        .where("folderId")
        .anyOf(allFolderIds)
        .toArray();
    return files;
}
