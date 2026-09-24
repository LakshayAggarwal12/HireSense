import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  LuChartBar,
  LuUpload,
  LuBriefcase,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuX,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { useSidebarUI } from "../../context/SidebarUIContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import Brand from "../ui/Brand";
import IconButton from "../ui/IconButton";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LuChartBar, end: true },
  { to: "/candidates", label: "Candidates", icon: LuUpload },
  { to: "/jobs", label: "Job Descriptions", icon: LuBriefcase },
];

const VERSION = "v1.0.0";

function NavItem({ item, collapsed, onNavigate }) {
  const location = useLocation();
  const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className="group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 bg-accent-soft rounded-lg"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      {/* Shape, not just color, marks the current page. */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] rounded-full bg-accent transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon
        className={`relative h-4 w-4 shrink-0 ${active ? "text-accent-ink" : "text-ink-soft group-hover:text-ink"}`}
        aria-hidden="true"
      />
      {!collapsed && (
        <span className={`relative truncate ${active ? "text-accent-ink" : "text-ink-soft group-hover:text-ink"}`}>
          {item.label}
        </span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink text-white text-xs font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {item.label}
        </span>
      )}
    </NavLink>
  );
}

function SidebarContent({ collapsed, onToggleCollapse, onNavigate, showCollapseControl, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.email || "Account";

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`h-16 shrink-0 flex items-center border-b border-border ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        <Brand size="sm" showName={!collapsed} />
        {onClose && !collapsed && (
          <IconButton icon={LuX} label="Close menu" onClick={onClose} className="ml-auto" />
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-soft/70">
            Workspace
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-border-soft space-y-1">
        <NavItem
          item={{ to: "/settings", label: "Settings", icon: LuSettings }}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <Avatar name={displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate">{displayName}</p>
              {user?.full_name && (
                <p className="text-[11px] text-ink-soft truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="h-7 w-7 rounded-md flex items-center justify-center text-ink-soft hover:text-score-low hover:bg-score-low-soft transition-colors shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <LuLogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="group relative w-full flex items-center justify-center px-3 py-2 rounded-lg text-ink-soft hover:text-score-low hover:bg-score-low-soft transition-colors"
            aria-label="Sign out"
          >
            <LuLogOut className="h-4 w-4" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-ink text-white text-xs font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              Sign out
            </span>
          </button>
        )}

        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"} pt-1`}>
          {!collapsed && (
            <p className="text-[10px] text-ink-soft/70">
              HireSense {VERSION}
            </p>
          )}
          {showCollapseControl && (
            <button
              onClick={onToggleCollapse}
              className="h-7 w-7 rounded-md flex items-center justify-center text-ink-soft hover:text-ink hover:bg-canvas transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <LuPanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <LuPanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebarUI();

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="hidden md:flex shrink-0 border-r border-border bg-surface/95 backdrop-blur h-screen sticky top-0 flex-col overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapsed} showCollapseControl />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              aria-label="Navigation"
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-surface border-r border-border z-50 flex flex-col md:hidden"
            >
              <SidebarContent
                collapsed={false}
                onNavigate={closeMobile}
                showCollapseControl={false}
                onClose={closeMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

