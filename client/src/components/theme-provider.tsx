import { ThemeProvider as CustomThemeProvider } from "@/hooks/use-theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <CustomThemeProvider>{children}</CustomThemeProvider>;
}
