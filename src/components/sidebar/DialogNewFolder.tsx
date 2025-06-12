import React from "react";
import { FolderPlus } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DialogUploadComponentProps {
    dialogOpen: boolean;
    setDialogOpen: (state: boolean) => void;
    newFolderName: string;
    setNewFolderName: (name: string) => void;
    handleCreateFolder: () => void;
}

const DialogNewFolder: React.FC<DialogUploadComponentProps> = ({
    dialogOpen,
    setDialogOpen,
    newFolderName,
    setNewFolderName,
    handleCreateFolder
}) => {
    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button type="button" className="mt-2 w-full cursor-pointer">
                    <FolderPlus size={16} />
                    Nova Pasta
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criar Nova Pasta</DialogTitle>
                    <DialogDescription>
                        Insira o nome da nova pasta que será criada no diretório
                        atual.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    placeholder="Nome da pasta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateFolder();
                    }}
                />
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleCreateFolder}>Criar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DialogNewFolder;
