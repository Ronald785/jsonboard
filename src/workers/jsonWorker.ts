interface WorkerSuccessResponse {
    status: "success";
    payload: unknown;
    uploadId: string;
}

interface WorkerErrorResponse {
    status: "error";
    message: string;
    uploadId: string;
}

interface WorkerRequest {
    content: string;
    uploadId: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
    const { content, uploadId } = e.data;

    try {
        const parsed: unknown = JSON.parse(content);

        const response: WorkerSuccessResponse = {
            status: "success",
            payload: parsed,
            uploadId
        };

        self.postMessage(response);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        const response: WorkerErrorResponse = {
            status: "error",
            message: errorMessage,
            uploadId
        };

        self.postMessage(response);
    }
};

export {};
