import JsonUploader from "./components/JsonUploader";

function App() {
    const handleSuccess = (parsedJson: unknown) => {
        console.log("Sucesso:", parsedJson);
    };

    return (
        <>
            <JsonUploader onSuccess={handleSuccess} />
        </>
    );
}

export default App;
