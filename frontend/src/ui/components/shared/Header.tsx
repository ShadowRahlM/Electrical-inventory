import { useTheme } from "@/infrastructure/theme-provider";
import { useAuth } from "@/domain/hooks/use-auth";
import { Sun, Moon, LogOut, User } from "lucide-react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 hover:bg-muted"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="flex items-center gap-2 text-sm">
          <User size={16} />
          <span>{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-md p-2 hover:bg-muted text-muted-foreground"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
