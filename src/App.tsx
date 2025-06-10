import { Toaster } from "sonner";
import FileExplorer from "./components/FileExplorer";
import SidebarComponent from "./components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
    return (
        <SidebarProvider>
            <div className="flex w-full">
                <SidebarComponent />
                <FileExplorer />
                <Toaster />
            </div>
        </SidebarProvider>
    );
}

export default App;
