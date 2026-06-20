interface RawRequest {
    contentId: string;
    mimeType?: string;
}

interface SuccessResponse {
    status: "success";
    blob: Blob;
}

interface ErrorResponse {
    status: "error";
    message: string;
}

self.onmessage = (e: MessageEvent<RawRequest>) => {
    const { contentId, mimeType = "application/json" } = e.data;

    const dbRequest = indexedDB.open("jsonBoardDB");

    dbRequest.onerror = () => {
        const response: ErrorResponse = { status: "error", message: "Erro ao abrir o banco de dados" };
        self.postMessage(response);
    };

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const tx = db.transaction("contents", "readonly");
        const store = tx.objectStore("contents");
        const getRequest = store.get(contentId);

        getRequest.onerror = () => {
            const response: ErrorResponse = { status: "error", message: "Erro ao ler o conteúdo" };
            self.postMessage(response);
        };

        getRequest.onsuccess = () => {
            const record = getRequest.result as { id: string; content: string } | undefined;

            if (!record) {
                const response: ErrorResponse = { status: "error", message: "Conteúdo não encontrado" };
                self.postMessage(response);
                return;
            }

            const blob = new Blob([record.content], { type: mimeType });
            const response: SuccessResponse = { status: "success", blob };
            self.postMessage(response);
        };
    };
};

export {};
