import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-full min-h-[100vh] flex justify-center items-center text-2xl text-center font-bold">
        Hello
      </div>
    </ThemeProvider>
  );
}

export default App;
