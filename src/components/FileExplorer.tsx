import { getFolderPath } from "@/database/dexieHelpers";
import { useAppStore } from "@/stores/use-explore-store";
import type { FileEntry, Folder } from "@/types";
import { useState, useEffect } from "react";
import CreateFolderForm from "./CreateFolderForm";
import FolderBreadcrumb from "./FolderBreadcrumb";
import JsonUploader from "./JsonUploader";
import FileViewer from "./FileViewer";
import FolderView from "./FolderView";

const FileExplorer: React.FC = () => {
    const currentFolderId = useAppStore((state) => state.currentFolderId);
    const files = useAppStore((state) => state.files);
    const folders = useAppStore((state) => state.folders);
    const loadFolderContents = useAppStore((state) => state.loadFolderContents);

    const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
    const [openedFile, setOpenedFile] = useState<FileEntry | null>(null);

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

    return (
        <div className="p-4">
            <h1 className="mb-4 text-xl font-bold">Explorador de Arquivos</h1>
            <FolderBreadcrumb
                breadcrumb={breadcrumb}
                currentFile={openedFile}
                onCloseFile={handleCloseFile}
            />

            {!openedFile ? (
                <>
                    <CreateFolderForm />
                    <JsonUploader onSuccess={() => {}} />
                    <FolderView
                        folders={folders}
                        files={files}
                        onFolderClick={(id) =>
                            useAppStore.getState().setCurrentFolderId(id)
                        }
                        onFileClick={(file) => {
                            void handleOpenFile(file);
                        }}
                    />
                </>
            ) : (
                <FileViewer file={openedFile} onClose={handleCloseFile} />
            )}
        </div>
    );
};

export default FileExplorer;
