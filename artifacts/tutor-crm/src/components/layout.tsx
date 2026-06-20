import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserPlus, 
  CheckSquare, 
  CalendarDays, 
  CreditCard,
  LogOut,
  Briefcase
} from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "parent_success_executive", "tutor_acquisition_executive"] },
    { href: "/leads", label: "Leads Pipeline", icon: UserPlus, roles: ["admin", "parent_success_executive"] },
    { href: "/parents", label: "Parents", icon: Users, roles: ["admin", "parent_success_executive"] },
    { href: "/tutors", label: "Tutors", icon: Briefcase, roles: ["admin", "tutor_acquisition_executive"] },
    { href: "/requirements", label: "Requirements", icon: BookOpen, roles: ["admin", "tutor_acquisition_executive"] },
    { href: "/demos", label: "Demos", icon: CalendarDays, roles: ["admin", "parent_success_executive"] },
    { href: "/payments", label: "Payments", icon: CreditCard, roles: ["admin"] },
    { href: "/staff", label: "Staff", icon: CheckSquare, roles: ["admin"] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-card-foreground">TutorCRM</span>
          </Link>
        </div>
        
        <div className="flex-1 px-4 py-2 space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const active = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  active 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace(/_/g, ' ')}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
