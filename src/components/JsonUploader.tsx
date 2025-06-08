import React, { useRef, useState, useEffect } from "react";
import JSONWorker from "../workers/jsonWorker.ts?worker";
import { v4 as uuidv4 } from "uuid";
import { useAppStore } from "@/stores/use-explore-store";
import { saveFile } from "@/database/dexieHelpers";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface JsonUploaderProps {
    onSuccess?: (parsedJson: unknown) => void;
}

interface WorkerResponse {
    status: "success" | "error";
    message: string;
    payload?: unknown;
    uploadId: string;
}

interface FileUploadStatus {
    id: string;
    file: File;
    progress: number;
    output: string;
    outputStatus: "success" | "error" | "";
}

const JsonUploader: React.FC<JsonUploaderProps> = ({ onSuccess }) => {
    const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
    const workerRef = useRef<Worker | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const currentFolderId = useAppStore((state) => state.currentFolderId);
    const loadFolderContents = useAppStore((state) => state.loadFolderContents);

    useEffect(() => {
        workerRef.current = new JSONWorker();

        if (workerRef.current) {
            workerRef.current.onmessage = (e: MessageEvent) => {
                const { status, message, payload, uploadId } =
                    e.data as WorkerResponse;

                setUploads((prevUploads) =>
                    prevUploads.map((upload) => {
                        if (upload.id === uploadId) {
                            if (status === "success") {
                                const contentString = JSON.stringify(
                                    payload,
                                    null,
                                    2
                                );
                                const fileName =
                                    upload.file.name || `data-${uuidv4()}.json`;

                                void saveFile(
                                    fileName,
                                    contentString,
                                    currentFolderId
                                ).then(async (fileId) => {
                                    upload.output =
                                        "Arquivo salvo com sucesso!";
                                    upload.outputStatus = "success";
                                    toast.success(
                                        `Arquivo ${fileName} salvo com sucesso.`
                                    );
                                    await loadFolderContents(currentFolderId);
                                    if (onSuccess) onSuccess(fileId);
                                    setTimeout(
                                        () => removeUpload(upload.id),
                                        5000
                                    );
                                });
                            } else {
                                upload.output = `Erro: ${message}`;
                                upload.outputStatus = "error";
                                toast.error(
                                    `Erro no arquivo ${upload.file.name}: ${message}`
                                );
                                setTimeout(() => removeUpload(upload.id), 5000);
                            }
                        }
                        return upload;
                    })
                );
            };

            return () => {
                workerRef.current?.terminate();
            };
        }
    }, [onSuccess, currentFolderId, loadFolderContents]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            toast.error("Nenhum arquivo selecionado.");
            return;
        }

        const newUploads: FileUploadStatus[] = [];
        for (const file of files) {
            if (
                file.type === "application/json" ||
                file.name.toLowerCase().endsWith(".json")
            ) {
                newUploads.push({
                    id: uuidv4(),
                    file,
                    progress: 0,
                    output: "",
                    outputStatus: ""
                });
            } else {
                toast.error(`O arquivo ${file.name} não é um JSON válido.`);
            }
        }

        setUploads((prev) => [...prev, ...newUploads]);
    };

    const handleSendFiles = () => {
        if (uploads.length === 0) {
            toast.error("Nenhum arquivo selecionado para enviar.");
            return;
        }

        uploads.forEach((upload) => {
            const reader = new FileReader();

            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploads((prevUploads) =>
                        prevUploads.map((u) =>
                            u.id === upload.id
                                ? { ...u, progress: percentComplete }
                                : u
                        )
                    );
                }
            };

            reader.onloadstart = () => {
                setUploads((prevUploads) =>
                    prevUploads.map((u) =>
                        u.id === upload.id ? { ...u, progress: 0 } : u
                    )
                );
            };

            reader.onloadend = () => {
                setUploads((prevUploads) =>
                    prevUploads.map((u) =>
                        u.id === upload.id ? { ...u, progress: 100 } : u
                    )
                );

                setTimeout(() => removeUpload(upload.id), 5000);
            };

            reader.onload = (e) => {
                const content = e.target?.result as string;
                workerRef.current?.postMessage({
                    content,
                    uploadId: upload.id
                });
            };

            reader.readAsText(upload.file);
        });
    };

    const removeUpload = (uploadId: string) => {
        setUploads((prevUploads) =>
            prevUploads.filter((u) => u.id !== uploadId)
        );
    };

    return (
        <div className="mt-4">
            <h2>Validador JSON</h2>
            <div className="mt-3 grid w-full max-w-sm items-center gap-3">
                <Label htmlFor="json">Enviar JSON</Label>
                <Input
                    id="json"
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    multiple
                    ref={fileInputRef}
                />
            </div>
            <Button
                type="button"
                className="mt-4 cursor-pointer"
                onClick={handleSendFiles}
            >
                Enviar
            </Button>

            {uploads.map((upload) => (
                <div key={upload.id} className="mt-4 max-w-sm">
                    <div className="mb-1 font-medium">{upload.file.name}</div>
                    {upload.progress > 0 && (
                        <div>
                            <span className="block text-xs">
                                {upload.progress.toFixed(2)}%
                            </span>
                            <Progress value={upload.progress} />
                        </div>
                    )}
                    {upload.output && (
                        <Alert
                            variant={
                                upload.outputStatus === "error"
                                    ? "destructive"
                                    : "default"
                            }
                            className="mt-2.5"
                        >
                            <AlertTitle>
                                {upload.outputStatus === "success"
                                    ? "Sucesso!"
                                    : "Erro!"}
                            </AlertTitle>
                            <AlertDescription>{upload.output}</AlertDescription>
                        </Alert>
                    )}
                </div>
            ))}
        </div>
    );
};

export default JsonUploader;
