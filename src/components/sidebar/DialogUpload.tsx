import React from "react";
import { FileUp } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import JsonUploader from "../JsonUploader";

interface DialogUploadComponentProps {
    uploadDialogOpen: boolean;
    setUploadDialogOpen: (state: boolean) => void;
}

const DialogUploadComponent: React.FC<DialogUploadComponentProps> = ({
    uploadDialogOpen,
    setUploadDialogOpen
}) => {
    return (
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="mt-2 w-full">
                    <FileUp size={16} />
                    Upload de JSONs
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload de JSONs</DialogTitle>
                    <DialogDescription>
                        Selecione arquivos JSON para validar e salvar no
                        diretório atual.
                    </DialogDescription>
                </DialogHeader>
                <JsonUploader onSuccess={() => setUploadDialogOpen(false)} />
            </DialogContent>
        </Dialog>
    );
};

export default DialogUploadComponent;
