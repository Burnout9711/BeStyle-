import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";

// tiny helper
const initials = (nameOrEmail) => {
  if (!nameOrEmail) return "U";
  const name = nameOrEmail.split("@")[0];
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * NavBar
 * Props:
 * - transparent (bool): if true uses glassy background, else solid dark.
 * - showTryQuiz (bool): show the "Try Quiz" CTA (default true)
 */
export default function NavBar({ transparent = false, showTryQuiz = true }) {
  const { user, checking, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const bg = transparent
    ? "bg-black/80 backdrop-blur-xl border-b border-white/10"
    : "bg-black border-b border-white/10";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${bg}`}>
      <div className="mx-auto max-w-[1200px] px-4 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <button
          className="text-xl font-bold bg-gradient-to-r from-[#4F7FFF] to-[#F2546D] bg-clip-text text-transparent"
          onClick={() => nav("/")}
          aria-label="BeStyle.AI Home"
        >
          BeStyle.AI
        </button>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {showTryQuiz && (
            <Button
              variant="secondary"
              className="rounded-full bg-white text-black hover:bg-black hover:text-white transition"
              onClick={() => nav("/quiz")}
            >
              Try Quiz
            </Button>
          )}

          {/* Auth area */}
          {checking ? (
            <div className="w-24 h-9 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/10 transition">
                  <Avatar className="h-8 w-8 ring-1 ring-white/10">
                    {/* replace user.avatar_url when you add uploads */}
                    <AvatarImage src={user.avatar_url || ""} alt={user.name || user.email} />
                    <AvatarFallback className="bg-white/10 text-white">
                      {initials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="text-sm font-medium text-white/90 hover:underline"
                    // clickable username -> dashboard
                    onClick={(e) => {
                      // prevent menu open if you click the text
                      e.stopPropagation();
                      nav("/dashboard");
                    }}
                  >
                    {user.name || user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">
                  {user.name || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav("/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/results")}>My Results</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    nav("/auth");
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                className="rounded-full text-white hover:bg-white/10"
                onClick={() => nav("/auth")}
              >
                Log in
              </Button>
              <Button
                className="rounded-full bg-white text-black hover:bg-black hover:text-white transition"
                onClick={() => nav("/auth")}
              >
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black">
          <div className="px-4 py-3 flex flex-col gap-2">
            {showTryQuiz && (
              <Button
                className="w-full rounded-full bg-white text-black hover:bg-black hover:text-white"
                onClick={() => {
                  setOpen(false);
                  nav("/quiz");
                }}
              >
                Try Quiz
              </Button>
            )}

            {checking ? (
              <div className="w-full h-10 rounded-lg bg-white/10 animate-pulse" />
            ) : user ? (
              <>
                <Button
                  variant="ghost"
                  className="justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setOpen(false);
                    nav("/dashboard");
                  }}
                >
                  {user.name || user.email}
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setOpen(false);
                    nav("/profile");
                  }}
                >
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white hover:bg-white/10"
                  onClick={() => {
                    setOpen(false);
                    nav("/results");
                  }}
                >
                  My Results
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start text-white hover:bg-white/10"
                  onClick={async () => {
                    setOpen(false);
                    await logout();
                    nav("/auth");
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full rounded-full bg-white text-black hover:bg-black hover:text-white"
                  onClick={() => {
                    setOpen(false);
                    nav("/auth");
                  }}
                >
                  Log in / Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
