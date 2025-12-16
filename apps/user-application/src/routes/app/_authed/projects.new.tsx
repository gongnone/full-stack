import { createFileRoute } from '@tanstack/react-router'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute('/app/_authed/projects/new')({
    component: NewProjectPage,
})

function NewProjectPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>Start a new research project to analyze your market.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <CreateProjectDialog />
                </CardContent>
            </Card>
        </div>
    )
}
