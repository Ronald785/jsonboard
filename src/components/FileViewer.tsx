import React, { useEffect, useState } from "react";
import type { FileEntry } from "@/types";
import { Button } from "./ui/button";
import { getFileContent, updateFileContent } from "@/database/dexieHelpers";
import JsonRenderer from "./JsonRenderer";
import { toast } from "sonner";

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

    const handleCopyToClipboard = async () => {
        if (!content) {
            console.warn("Sem conteúdo para copiar.");
            toast("Sem conteúdo para copiar.", {
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok")
                }
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(
                JSON.stringify(content, null, 2)
            );
            toast("JSON copiado para a área de transferência!", {
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok")
                }
            });
        } catch (error) {
            console.error("Erro ao copiar o conteúdo:", error);
            toast("Error ao copiar JSON para a área de transferência!", {
                action: {
                    label: "Ok",
                    onClick: () => console.log("Ok")
                }
            });
        }
    };

    const handleOpenRaw = () => {
        if (!content) {
            console.warn("Sem conteúdo para abrir.");
            return;
        }

        const blob = new Blob([JSON.stringify(content, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    return (
        <div className="mt-4 rounded border p-4 shadow">
            <h2 className="text-lg font-semibold">Visualizando: {file.name}</h2>
            {loading ? (
                <p>Carregando conteúdo...</p>
            ) : (
                <>
                    <div className="my-4 flex flex-wrap items-center gap-2">
                        <Button
                            className="cursor-pointer"
                            onClick={() => {
                                void handleCopyToClipboard();
                            }}
                        >
                            Copiar JSON
                        </Button>
                        <Button
                            className="cursor-pointer"
                            onClick={handleOpenRaw}
                        >
                            Abrir RAW
                        </Button>
                        <Button className="cursor-pointer" onClick={onClose}>
                            Fechar arquivo
                        </Button>
                    </div>
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
                </>
            )}
        </div>
    );
};

export default FileViewer;
