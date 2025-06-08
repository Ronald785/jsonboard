import { useAppStore } from "@/stores/use-explore-store";
import React, { useEffect, useState } from "react";
import CreateFolderForm from "./CreateFolderForm";
import JsonUploader from "./JsonUploader";
import { Button } from "./ui/button";
import type { Folder } from "@/types";
import { getFolderPath } from "@/database/dexieHelpers";
import FolderBreadcrumb from "./FolderBreadcrumb";

const FileExplorer: React.FC = () => {
    const currentFolderId = useAppStore((state) => state.currentFolderId);
    const files = useAppStore((state) => state.files);
    const folders = useAppStore((state) => state.folders);
    const loadFolderContents = useAppStore((state) => state.loadFolderContents);
    const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);

    console.log("Oi");

    useEffect(() => {
        console.log("Carregando pasta:", currentFolderId);

        const fetchData = async () => {
            try {
                await loadFolderContents(currentFolderId);
                const path = await getFolderPath(currentFolderId);

                console.log("path: ", path);

                setBreadcrumb(path);
            } catch (error) {
                console.error("Erro ao carregar o conteúdo da pasta:", error);
            }
        };
        void fetchData();
    }, [currentFolderId, loadFolderContents]);

    const handleSuccess = (parsedJson: unknown) => {
        console.log("Sucesso:", parsedJson);
    };

    return (
        <div className="p-4">
            <h1 className="mb-4 text-xl font-bold">Explorador de Arquivos</h1>
            <FolderBreadcrumb breadcrumb={breadcrumb} />

            <CreateFolderForm />
            <JsonUploader onSuccess={handleSuccess} />

            <div className="mt-6">
                {folders.length > 0 && (
                    <h2 className="text-lg font-semibold">Pastas</h2>
                )}

                <div className="flex flex-wrap gap-4">
                    {folders.map((folder) => (
                        <Button
                            key={folder.id}
                            type="button"
                            className="mt-2 cursor-pointer"
                            onClick={() =>
                                useAppStore
                                    .getState()
                                    .setCurrentFolderId(folder.id)
                            }
                        >
                            {folder.name}
                        </Button>
                    ))}
                </div>

                {files.length > 0 && (
                    <h2 className="mt-6 mb-2 text-lg font-semibold">
                        Arquivos
                    </h2>
                )}

                <div className="flex flex-wrap gap-4">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="rounded border p-2 shadow"
                        >
                            {file.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileExplorer;
