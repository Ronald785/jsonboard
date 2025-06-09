import { Toaster } from "sonner";
import FileExplorer from "./components/FileExplorer";
import SidebarComponent from "./components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
    return (
        <SidebarProvider>
            <div className="flex">
                <SidebarComponent />
                <div className="flex-1">
                    <FileExplorer />
                </div>
                <Toaster />
            </div>
        </SidebarProvider>
    );
}

export default App;
