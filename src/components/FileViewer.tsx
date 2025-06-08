import React from "react";
import type { FileEntry } from "@/types";
import { Button } from "./ui/button";

interface FileViewerProps {
    file: FileEntry;
    onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
    return (
        <div className="mt-4 rounded border p-4 shadow">
            <h2 className="text-lg font-semibold">Visualizando: {file.name}</h2>
            <p>O conteúdo foi impresso no console. 😎</p>
            <Button className="mt-2" onClick={onClose}>
                Fechar arquivo
            </Button>
        </div>
    );
};

export default FileViewer;
