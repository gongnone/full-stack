import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/_authed/projects/new')({
    component: NewProjectPage,
})

function NewProjectPage() {
    return <div>New Project Page (Placeholder)</div>
}
