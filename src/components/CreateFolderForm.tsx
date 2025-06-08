// src/components/CreateFolderForm.tsx
import { useAppStore } from "@/stores/use-explore-store";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const CreateFolderForm: React.FC = () => {
    const [folderName, setFolderName] = useState("");
    const addFolder = useAppStore((state) => state.addFolder);

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            alert("Digite um nome para a pasta.");
            return;
        }

        await addFolder(folderName.trim());

        setFolderName("");
    };

    return (
        <div className="">
            <div className="mt-3 grid w-full max-w-sm items-center gap-3">
                <Label htmlFor="folder">Criar Nova Pasta</Label>
                <Input
                    id="folder"
                    value={folderName}
                    type="texr"
                    onChange={(e) => setFolderName(e.target.value)}
                />
            </div>

            <Button
                className="mt-4 cursor-pointer"
                onClick={handleCreateFolder}
                type="button"
            >
                Criar
            </Button>
        </div>
    );
};

export default CreateFolderForm;
