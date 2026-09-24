import { LuSearch, LuMenu, LuSettings } from "react-icons/lu";
import GlobalSearch from "./GlobalSearch";
import NotificationsBell from "./NotificationsBell";
import ApiStatusPill from "../ui/ApiStatusPill";
import ThemeToggle from "../ui/ThemeToggle";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import { useSidebarUI } from "../../context/SidebarUIContext";
import { useAuth } from "../../context/AuthContext";

/**
 * Page header. Page-specific actions (`actions`) sit inline on md+ and drop
 * onto their own scrollable row on phones, so a wide control like the
 * candidate search never pushes the title off screen.
 */
export default function Topbar({ title, subtitle, actions }) {
  const { openMobile } = useSidebarUI();
  const { user } = useAuth();
  const displayName = user?.full_name || user?.email || "Account";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-3 sm:px-5 py-2">
        <IconButton
          icon={LuMenu}
          label="Open menu"
          size="lg"
          className="md:hidden -ml-1"
          onClick={openMobile}
        />

        <div className="min-w-0 flex-1 lg:flex-none lg:max-w-[38%]">
          <h1 className="font-display font-semibold text-[15px] leading-tight text-ink truncate">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-ink-soft mt-0.5 truncate">{subtitle}</p>}
        </div>

        <div className="hidden lg:flex flex-1 justify-center min-w-0">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {actions && <div className="hidden md:flex items-center gap-2">{actions}</div>}

          <div className="hidden md:flex items-center gap-1.5 pl-2.5 ml-0.5 border-l border-border-soft">
            <ApiStatusPill />
            <ThemeToggle compact />
            <NotificationsBell />
            <IconButton icon={LuSettings} label="Settings" to="/settings" />
            <Avatar name={displayName} size="sm" />
          </div>
        </div>
      </div>

      {actions && (
        <div className="md:hidden flex items-center gap-2 px-3 pb-3 overflow-x-auto">{actions}</div>
      )}
    </header>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search...", label = "Search" }) {
  return (
    <div className="relative flex-1 min-w-0 md:flex-none">
      <LuSearch
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-soft pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
        className="w-full md:w-64 pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-canvas text-ink
          placeholder:text-ink-soft/70 shadow-xs outline-none transition-colors
          focus:bg-surface focus:border-accent"
      />
    </div>
  );
}
