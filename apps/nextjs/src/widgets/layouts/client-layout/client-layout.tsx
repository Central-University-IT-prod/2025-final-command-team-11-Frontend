"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CircleUser,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
} from "lucide-react";

import { useLogout, useSession } from "@acme/api/auth";
import { cn } from "@acme/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@acme/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

interface ClientLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
  };
}

export function ClientLayout({ children, user }: ClientLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { session } = useSession();

  if (!session) {
    router.push("/auth/login");
  }

  const [notificationsCount, setNotificationsCount] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const { logout } = useLogout();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/login");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotificationsCount(Math.floor(Math.random() * 5));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-background/90">
      <header className="sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/80 hover:text-foreground md:hidden"
                  aria-label="Open mobile menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-[300px] p-0">
                <SheetHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                  <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                    <div className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                      <span className="font-bold">W</span>
                    </div>
                    <span>Workspace</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-2">
                  <div className="flex flex-col space-y-1 px-2 py-3">
                    <Link
                      href="/client"
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive("/client")
                          ? "bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground shadow-sm"
                          : "hover:bg-muted/80 hover:text-foreground",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="size-5" />
                      <span>Главная</span>
                    </Link>
                  </div>
                  <div className="mt-auto border-t bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-2 ring-primary/20 ring-offset-1">
                        <AvatarImage
                          src={user.image ?? undefined}
                          alt={user.name ?? "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground">
                          {user.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">
                          {user.name ?? "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="mt-4 w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="size-4" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/client" className="hidden items-center gap-2 md:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
                <span className="font-bold">W</span>
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-lg font-semibold text-transparent">
                Workspace
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600"
                  >
                    <Bell className="size-4.5" />
                    {notificationsCount > 0 && (
                      <Badge
                        className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 p-0 text-[10px] text-white"
                        variant="destructive"
                      >
                        {notificationsCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={5}
                  className="border border-border/40 bg-popover/95 shadow-xl backdrop-blur-sm"
                >
                  {notificationsCount > 0
                    ? `You have ${notificationsCount} unread notifications`
                    : "No new notifications"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-sky-500 hover:bg-sky-500/10 hover:text-sky-600"
                    onClick={toggleTheme}
                  >
                    <Sun className="size-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="size-4.5 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={5}
                  className="border border-border/40 bg-popover/95 shadow-xl backdrop-blur-sm"
                >
                  Toggle theme
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-1">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/60 text-white">
                      {user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border border-border/40 bg-popover/95 shadow-xl backdrop-blur-sm"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/client/profile" className="cursor-pointer">
                      <CircleUser className="mr-2 size-4 text-indigo-500" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/client/settings" className="cursor-pointer">
                      <Settings className="mr-2 size-4 text-emerald-500" />
                      <span>Settings</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-[calc(100vh-56px)] flex-col px-4 pb-16 pt-8 sm:px-0 lg:px-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
