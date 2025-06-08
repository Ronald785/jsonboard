/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useRef, useState } from "react";
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
    const broadcastChannel = useRef<BroadcastChannel | null>(null);
    const [conflicts, setConflicts] = useState<Record<string, boolean>>({});
    const tabId = useRef<string>(crypto.randomUUID());

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const fileContent = await getFileContent(file.contentId);
                if (!fileContent) {
                    console.error("Conteúdo não encontrado!");
                    return;
                }
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

    useEffect(() => {
        broadcastChannel.current = new BroadcastChannel(`file-${file.id}`);

        broadcastChannel.current.onmessage = (e) => {
            if (
                e.data.type === "file-opened" &&
                e.data.tabId !== tabId.current
            ) {
                broadcastChannel.current?.postMessage({
                    type: "file-presence",
                    tabId: tabId.current
                });
            }

            if (
                e.data.type === "file-presence" &&
                e.data.tabId !== tabId.current
            ) {
                toast("Este arquivo já está sendo visualizado em outra aba!", {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    action: { label: "Ok", onClick: () => {} }
                });
            }

            if (e.data.type === "editing-start") {
                const path = JSON.parse(e.data.path ?? "[]");
                setConflicts((prev) => ({
                    ...prev,
                    [path.join(".")]: true
                }));
            }

            if (e.data.type === "editing-stop") {
                const path = JSON.parse(e.data.path ?? "[]");
                setConflicts((prev) => {
                    const updated = { ...prev };
                    delete updated[path.join(".")];
                    return updated;
                });
            }

            if (e.data.type === "content-update") {
                const updated = JSON.parse(e.data.content);
                setContent(updated);
                toast("Este arquivo foi atualizado em outra aba!", {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    action: { label: "Ok", onClick: () => {} }
                });
            }
        };

        broadcastChannel.current.postMessage({
            type: "file-opened",
            tabId: tabId.current
        });

        return () => broadcastChannel.current?.close();
    }, [file.id]);

    const broadcastUpdate = (
        type: string,
        content?: unknown,
        path?: (string | number)[]
    ) => {
        broadcastChannel.current?.postMessage({
            type,
            content: content ? JSON.stringify(content) : undefined,
            path: path ? JSON.stringify(path) : undefined
        });
    };

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
            toast("Erro ao copiar JSON para a área de transferência!", {
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
                                    broadcastUpdate(
                                        "content-update",
                                        updatedContent
                                    );
                                }}
                                onStartEditing={(path) =>
                                    broadcastUpdate("editing-start", null, path)
                                }
                                onStopEditing={(path) =>
                                    broadcastUpdate("editing-stop", null, path)
                                }
                                isConflictingMap={conflicts}
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
