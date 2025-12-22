import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, LogOut, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/components/auth/client';

export const Route = createFileRoute('/app/_authed/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => trpc.client.auth.me.query(),
  });

  useEffect(() => {
    if (data?.profile?.display_name) {
      setDisplayName(data.profile.display_name);
    } else if (data?.user?.name) {
      setDisplayName(data.user.name);
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: (variables: { displayName: string }) => 
      trpc.client.auth.updateProfile.mutate(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  const handleSave = () => {
    if (displayName.length < 2) {
      toast.error('Display name must be at least 2 characters');
      return;
    }
    updateProfileMutation.mutate({ displayName });
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and profile.</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                {data?.user?.image && <AvatarImage src={data.user.image} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon />}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" disabled>Change Avatar</Button>
                <p className="text-xs text-muted-foreground mt-2">Avatars are managed via your login provider.</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="display-name">Display Name</Label>
                <div className="relative">
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-background max-w-md"
                    maxLength={50}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                    {displayName.length}/50
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={data?.user?.email || ''}
                  disabled
                  className="bg-muted max-w-md cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-6">
            <Button 
              onClick={handleSave} 
              disabled={updateProfileMutation.isPending || displayName === (data?.profile?.display_name || data?.user?.name)}
              className="gap-2"
            >
              {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Actions that affect your session or account.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of your account on this device.
            </p>
            <Button variant="destructive" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
