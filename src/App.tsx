import { Toaster } from "sonner";
import FileExplorer from "./components/FileExplorer";
import SidebarComponent from "./components/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <SidebarProvider>
                <div className="flex w-full">
                    <SidebarComponent />
                    <FileExplorer />
                    <Toaster />
                </div>
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default App;
