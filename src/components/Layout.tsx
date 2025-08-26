import { ReactNode, useState } from 'react';
import { Truck, Package, Users, Wrench, FileText, BarChart3, Settings, Route, ArrowLeft, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Expenses', href: '/expenses', icon: FileText },
  { name: 'Routes', href: '/routes', icon: Route },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, profile, signOut, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link key={item.name} to={item.href} onClick={onItemClick}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start gap-2 px-3 py-2",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Trigger */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="px-4 py-6 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <Package className="h-6 w-6 text-primary" />
                      <span className="text-lg font-bold">Takamul</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 p-4">
                    <NavItems onItemClick={() => setMobileMenuOpen(false)} />
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="flex items-center">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  <span className="hidden sm:inline">Takamul Logistics</span>
                  <span className="sm:hidden">Takamul</span>
                </h1>
              </Link>
            </div>
            
            {/* Desktop Navigation and User Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-1">
                <NavItems />
              </nav>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || user.email || ''} />
                        <AvatarFallback>
                          {profile?.username ? profile.username.charAt(0).toUpperCase() : 
                           user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.username || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {hasRole('admin') && (
                          <p className="text-xs leading-none text-primary font-medium">
                            Administrator
                          </p>
                        )}
                        {hasRole('moderator') && !hasRole('admin') && (
                          <p className="text-xs leading-none text-secondary font-medium">
                            Moderator
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {hasRole('admin') && (
                      <DropdownMenuItem asChild>
                        <Link to="/user-management" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>User Management</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
        {location.pathname !== '/' && (
          <div className="mb-4 sm:mb-6">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} Takamul for Logistics Services
          </p>
        </div>
      </footer>
    </div>
  );
}