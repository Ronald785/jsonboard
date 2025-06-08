interface WorkerSuccessResponse {
    status: "success";
    parsedJson: unknown;
}

interface WorkerErrorResponse {
    status: "error";
    message: string;
}

self.onmessage = (e: MessageEvent<string>) => {
    const content = e.data;

    try {
        const parsed: unknown = JSON.parse(content);

        const response: WorkerSuccessResponse = {
            status: "success",
            parsedJson: parsed
        };

        self.postMessage(response);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        const response: WorkerErrorResponse = {
            status: "error",
            message: errorMessage
        };

        self.postMessage(response);
    }
};

export {};
