import React, { useEffect, useState } from "react";
import type { FileEntry } from "@/types";
import { Button } from "./ui/button";
import { getFileContent, updateFileContent } from "@/database/dexieHelpers";
import JsonRenderer from "./JsonRenderer";

interface FileViewerProps {
    file: FileEntry;
    onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
    const [content, setContent] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const fileContent = await getFileContent(file.contentId);
                if (!fileContent) {
                    console.error("Conteúdo não encontrado!");
                    return;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const parsed = JSON.parse(fileContent.content);
                setContent(parsed);
            } catch (error) {
                console.error("Erro ao carregar o conteúdo:", error);
            } finally {
                setLoading(false);
            }
        };
        void fetchContent();
    }, [file]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdateContent = async (updatedContent: any) => {
        setContent({ ...updatedContent });
        await updateFileContent(
            file.contentId,
            JSON.stringify(updatedContent, null, 2)
        );
        console.log("Conteúdo atualizado no banco de dados.");
    };

    return (
        <div className="mt-4 rounded border p-4 shadow">
            <h2 className="text-lg font-semibold">Visualizando: {file.name}</h2>
            {loading ? (
                <p>Carregando conteúdo...</p>
            ) : (
                <div className="overflow-x-auto">
                    {content ? (
                        <JsonRenderer
                            data={content}
                            path={[]}
                            rootContent={content}
                            onUpdateContent={(updatedContent) => {
                                void handleUpdateContent(updatedContent);
                            }}
                        />
                    ) : (
                        <p>Conteúdo vazio ou inválido.</p>
                    )}
                </div>
            )}
            <Button className="mt-2" onClick={onClose}>
                Fechar arquivo
            </Button>
        </div>
    );
};

export default FileViewer;
