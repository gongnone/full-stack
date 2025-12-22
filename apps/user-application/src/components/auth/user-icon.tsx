import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react"; // Import Settings icon
import { useState } from "react";
import { authClient } from "./client";

type UserProfilePopupProps = {
  data: Awaited<ReturnType<typeof authClient.useSession>>["data"];
  children: React.ReactNode;
};

function UserProfilePopup({ data, children }: UserProfilePopupProps) {
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state to toggle settings view

  const handleLogout = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(open) => !open && setShowSettings(false)}> {/* Reset showSettings on dialog close */}
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-16 w-16">
              {data?.user.image && (
                <AvatarImage
                  src={data.user.image}
                  alt={data.user.name || "User"}
                />
              )}
              <AvatarFallback>
                {data?.user.name ? (
                  data.user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-8 w-8" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-semibold">
                {showSettings ? "User Settings" : (data?.user.name || "User")} {/* Dynamic title */}
              </DialogTitle>
              {!showSettings && data?.user.email && (
                <p className="text-sm text-muted-foreground">
                  {data.user.email}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-2"> {/* Use flex-col and gap for spacing */}
          {!showSettings ? ( // Conditional rendering for profile vs settings
            <>
              <Button
                onClick={() => setShowSettings(true)} // Show settings on click
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full h-12 text-base font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 border rounded-md bg-muted/20 text-muted-foreground">
                <p>This is a placeholder for user settings.</p>
                <p>More settings options will be implemented here.</p>
              </div>
              <Button
                onClick={() => setShowSettings(false)} // Go back to profile view
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                Back to Profile
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UserCircle() {
  const { data: user, isPending: loading } = authClient.useSession();

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return null;
  }

  return (
    <UserProfilePopup data={user}>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          {user.user.image && (
            <AvatarImage src={user.user.image} alt={user.user.name || "User"} />
          )}
          <AvatarFallback>
            {user.user.name ? (
              user.user.name.charAt(0).toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </Button>
    </UserProfilePopup>
  );
}

export function UserTab() {
  const { data, isPending: loading } = authClient.useSession();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          <div className="h-2 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <UserProfilePopup data={data}>
      <Button
        variant="ghost"
        className="flex items-center gap-3 p-2 w-full justify-start"
      >
        <Avatar className="h-8 w-8">
          {data.user.image && (
            <AvatarImage src={data.user.image} alt={data.user.name || "User"} />
          )}
          <AvatarFallback>
            {data.user.name ? (
              data.user.name.charAt(0).toUpperCase()
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left">
          <span className="font-medium text-sm">
            {data.user.name || "User"}
          </span>
          {data.user.email && (
            <span className="text-xs text-muted-foreground">
              {data.user.email}
            </span>
          )}
        </div>
      </Button>
    </UserProfilePopup>
  );
}
