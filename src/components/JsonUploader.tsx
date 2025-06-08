import React, { useRef, useState, useEffect } from "react";
import JSONWorker from "../workers/jsonWorker.ts?worker";

interface JsonUploaderProps {
    onSuccess?: (parsedJson: unknown) => void;
}

interface WorkerResponse {
    status: "success" | "error";
    message: string;
    payload?: unknown;
}

const JsonUploader: React.FC<JsonUploaderProps> = ({ onSuccess }) => {
    const [output, setOutput] = useState<string>("");
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new JSONWorker();

        if (workerRef.current) {
            workerRef.current.onmessage = (e: MessageEvent) => {
                const { status, message } = e.data as WorkerResponse;

                if (status === "success") {
                    setOutput("JSON válido!");

                    if (onSuccess) onSuccess(e.data);
                } else {
                    setOutput(`Erro: ${message}`);
                }
            };

            return () => {
                workerRef.current?.terminate();
            };
        }
    }, [onSuccess]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setOutput("Nenhum arquivo selecionado.");
            return;
        }

        const mimetype =
            file.type === "application/json" ||
            file.name.toLowerCase().endsWith(".json");

        if (!mimetype) {
            setOutput("Selecione um arquivo JSON.");
            return;
        }

        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;

                if (percentComplete < 100)
                    console.log(`Progresso: ${percentComplete.toFixed(2)}%`);
            }
        };

        reader.onloadstart = () => {
            console.log("Progresso: 0%");
        };

        reader.onloadend = () => {
            console.log("Progresso: 100%");
        };

        reader.onload = (e) => {
            const content = e.target?.result as string;
            console.log("Enviando para o worker");
            workerRef.current?.postMessage(content);
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-2">
            <h2>Validador JSON</h2>
            <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
            />
            <div className="mt-2.5 border-2 border-solid border-gray-500 p-2">
                {output}
            </div>
        </div>
    );
};

export default JsonUploader;
