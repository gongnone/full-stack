import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { UploadAssetDialog } from "@/components/dashboard/upload-asset-dialog";

export const Route = createFileRoute('/app/_authed/projects/$projectId/competitors')({
    component: CompetitorsTab,
})

function CompetitorsTab() {
    const [competitors, setCompetitors] = useState([
        { id: '1', name: 'Competitor X', url: 'https://example.com', status: 'pending_upload', workflowId: 'wf_123' },
        { id: '2', name: 'Competitor Y', url: 'https://y.com', status: 'analyzed', workflowId: 'wf_456' }
    ]);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddCompetitor = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setTimeout(() => {
            setCompetitors([...competitors, { id: '3', name: 'New Entry', url: 'https://new.com', status: 'analyzing', workflowId: 'wf_789' }]);
            setIsAdding(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add Competitor</CardTitle>
                    <CardDescription>Start the "Golden Pheasant" workflow for a new competitor.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddCompetitor} className="flex gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="url">Website URL</Label>
                            <Input id="url" placeholder="https://competitor.com" />
                        </div>
                        <Button type="submit" disabled={isAdding}>
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-2">Analyze</span>
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Competitor Landscape</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competitors.map((comp) => (
                                <TableRow key={comp.id}>
                                    <TableCell className="font-medium">{comp.name}</TableCell>
                                    <TableCell>{comp.url}</TableCell>
                                    <TableCell>
                                        <Badge variant={comp.status === 'analyzed' ? 'default' : 'secondary'}>
                                            {comp.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {comp.status === 'pending_upload' && (
                                            <UploadAssetDialog
                                                workflowId={comp.workflowId}
                                                onUploadComplete={() => {
                                                    setCompetitors(competitors.map(c => c.id === comp.id ? { ...c, status: 'analyzing' } : c));
                                                }}
                                            />
                                        )}
                                        {comp.status === 'analyzed' && (
                                            <Button variant="ghost" size="sm">View Report</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
