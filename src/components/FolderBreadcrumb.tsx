import React from "react";
import type { Folder, FileEntry } from "@/types";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useAppStore } from "@/stores/use-explore-store";

interface FolderBreadcrumbProps {
    breadcrumb: Folder[];
    currentFile?: FileEntry | null;
    onCloseFile?: () => void;
}

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
    breadcrumb,
    currentFile,
    onCloseFile
}) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            useAppStore.getState().setCurrentFolderId("");
                            onCloseFile?.();
                        }}
                    >
                        Home
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {breadcrumb.map((folder) => (
                    <React.Fragment key={folder.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    useAppStore
                                        .getState()
                                        .setCurrentFolderId(folder.id);
                                    onCloseFile?.();
                                }}
                            >
                                {folder.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}

                {currentFile && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                href="#"
                                onClick={(e) => e.preventDefault()}
                            >
                                {currentFile.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default FolderBreadcrumb;
