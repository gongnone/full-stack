import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { trpc, queryClient } from '@/lib/trpc';
import { Loader2, PlusIcon } from "lucide-react";
import { useMutation } from '@tanstack/react-query';

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    // const navigate = useNavigate();
    // const utils = trpc.useUtils();
    const createProject = useMutation({
        ...trpc.projects.create.mutationOptions(),
        onSuccess: () => {
            const key = trpc.projects.list.queryOptions().queryKey;
            queryClient.invalidateQueries({ queryKey: key });
        }
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createProject.mutateAsync({ name });
            const id = (result as any).id;

            // Bypass TanStack Router 'navigate' which is throwing "Could not find match"
            // Force browser navigation to ensure the user gets to the page.
            window.location.href = `/app/projects/${id}/research`;

            setIsLoading(false);
            setOpen(false);
        } catch (error) {
            console.error("Failed to create project:", error);
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Start a new research campaign for a specific product or niche.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate}>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. SaaS Marketing Masterclass"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Project
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
