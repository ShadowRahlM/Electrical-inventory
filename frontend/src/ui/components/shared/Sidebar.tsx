import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Truck,
  Users,
  ShoppingCart,
  CreditCard,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  Store,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/inventory", icon: Boxes, label: "Inventory" },
  { to: "/suppliers", icon: Truck, label: "Suppliers" },
  { to: "/customers", icon: Users, label: "Customers" },
  { to: "/purchases", icon: ShoppingCart, label: "Purchases" },
  { to: "/sales", icon: Store, label: "Sales" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/expenses", icon: Wallet, label: "Expenses" },
  { to: "/accounting", icon: Receipt, label: "Accounting" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r bg-card md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Store className="mr-2 h-6 w-6" />
        <span className="text-lg font-bold">ESMS</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
