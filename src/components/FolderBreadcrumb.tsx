import React from "react";
import type { Folder } from "@/types";
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
}

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({ breadcrumb }) => {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            useAppStore.getState().setCurrentFolderId("");
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
                                }}
                            >
                                {folder.name}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default FolderBreadcrumb;
