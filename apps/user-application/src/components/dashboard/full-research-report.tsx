
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Helper to render arrays/objects safely
 */
function renderList(items: any[], emptyMsg = "No data") {
    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground italic">{emptyMsg}</p>;
    return (
        <ul className="list-disc list-inside space-y-1">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-foreground/80">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                </li>
            ))}
        </ul>
    );
}

/**
 * Safely parse JSON if it's a string, otherwise return object
 */
function safeParse(val: any, defaultVal = {}) {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch (e) {
        console.error("Failed to parse JSON field:", val);
        return defaultVal;
    }
}

export function FullResearchReport({ data }: { data: any }) {
    if (!data) return null;

    // Helper: Access deeply nested optional fields safely
    // CRITICAL FIX: Backend returns JSON fields as strings (D1 limitation). We must parse them.
    const avatar = data.avatar || {};
    const dimensions = avatar.dimensions || {};

    const discovery = safeParse(data.discovery);
    const competitorRecon = safeParse(data.competitorRecon);
    const competitors = competitorRecon.competitors || [];

    const problems = safeParse(data.problems);
    const hvco = safeParse(data.hvco);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/50 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    View Full Intelligence Report
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
                <div className="h-full w-full overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8 pb-20">

                        {/* HEADER */}
                        <SheetHeader className="pb-4 border-b">
                            <SheetTitle className="text-2xl font-sans tracking-tight font-bold">Full Intelligence Report</SheetTitle>
                            <SheetDescription>
                                Raw data extraction from Halo Agent Run: <span className="font-mono text-xs">{data.runId || 'N/A'}</span>
                            </SheetDescription>
                            <div className="flex gap-4 pt-2 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Status</span>
                                    <Badge variant={data.status === 'complete' ? 'default' : 'secondary'}>
                                        {data.status || 'Unknown'}
                                    </Badge>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Quality Score</span>
                                    <span className="font-mono font-bold text-primary">{data.qualityScore || 'N/A'}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase font-bold">Evidence</span>
                                    <span className="font-mono font-bold">{data.avatar?.evidenceCount || 0} citations</span>
                                </div>
                            </div>
                        </SheetHeader>

                        {/* SECTION 1: RECONNAISSANCE */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <span className="bg-primary/10 text-primary p-1 rounded">📡</span>
                                Phase 1: Reconnaissance
                            </h3>

                            {/* Watering Holes */}
                            <Card>
                                <CardHeader><CardTitle className="text-sm uppercase text-muted-foreground">Watering Holes Detected</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Platform</TableHead>
                                                <TableHead>Name/Source</TableHead>
                                                <TableHead>Relevance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {discovery.wateringHoles?.map((wh: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="capitalize">{wh.platform}</TableCell>
                                                    <TableCell>
                                                        <a href={wh.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-primary">
                                                            {wh.name} <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>{wh.relevanceScore}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Competitor Recon */}
                            <Card>
                                <CardHeader><CardTitle className="text-sm uppercase text-muted-foreground">Competitor Analysis</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    {competitors.length === 0 ? <p className="text-sm text-muted-foreground">No competitors analyzed.</p> : null}
                                    {competitors.map((comp: any, i: number) => (
                                        <div key={i} className="p-4 bg-muted/30 rounded-lg border">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-base text-foreground">{comp.competitorName}</h4>
                                                <a href={comp.url} target="_blank" className="text-xs text-primary hover:underline">Visit Site</a>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-semibold block text-xs text-muted-foreground uppercase">Their Offer</span>
                                                    <p>{comp.primaryOffer?.promise || 'N/A'}</p>
                                                    <p className="font-mono text-xs mt-1">{comp.primaryOffer?.price}</p>
                                                </div>
                                                <div>
                                                    <span className="font-semibold block text-xs text-muted-foreground uppercase">Weaknesses Detected</span>
                                                    <ul className="list-disc list-inside">
                                                        {comp.weaknesses?.map((w: string, k: number) => (
                                                            <li key={k} className="text-foreground/80">{w}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION 2: DEEP PSYCHOLOGY */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <span className="bg-primary/10 text-primary p-1 rounded">🧠</span>
                                Phase 2: Deep Psychology
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Hopes & Dreams */}
                                <Card className="border-l-4 border-l-primary/70 bg-primary/5">
                                    <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><span className="text-primary">✨</span> Hopes & Dreams</CardTitle></CardHeader>
                                    <CardContent>{renderList(dimensions.hopesAndDreams)}</CardContent>
                                </Card>

                                {/* Deepest Fears */}
                                <Card className="border-l-4 border-l-destructive/70 bg-destructive/5">
                                    <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><span className="text-destructive">💀</span> Deepest Fears</CardTitle></CardHeader>
                                    <CardContent>{renderList(dimensions.deepestFears)}</CardContent>
                                </Card>

                                {/* Frustrations */}
                                <Card className="border-l-4 border-l-destructive/50">
                                    <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><span className="text-destructive">😤</span> Daily Frustrations</CardTitle></CardHeader>
                                    <CardContent>{renderList(dimensions.frustrations)}</CardContent>
                                </Card>

                                {/* Happiness Triggers */}
                                <Card className="border-l-4 border-l-primary/50">
                                    <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><span className="text-primary">😊</span> Happiness Triggers</CardTitle></CardHeader>
                                    <CardContent>{renderList(dimensions.happinessTriggers)}</CardContent>
                                </Card>
                            </div>

                            {/* Vernacular / Voice */}
                            <Card>
                                <CardHeader><CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Market Vernacular (Voice of Customer)</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {dimensions.vernacular?.map((v: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-1 p-3 rounded-md bg-muted/40 border border-transparent hover:border-primary/20 transition-colors">
                                                <span className="font-serif italic text-foreground/90 leading-relaxed">"{v.phrase}"</span>
                                                <div className="flex justify-end">
                                                    <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono bg-background/50">{v.context || 'General'}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SECTION 3: STRATEGY & ANGLES */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                <span className="bg-primary/10 text-primary p-1 rounded">⚡</span>
                                Phase 3: Strategy & Angles
                            </h3>

                            {/* Hair on Fire Problem */}
                            <Card className="bg-destructive/5 border-destructive/20">
                                <CardHeader><CardTitle className="text-destructive flex justify-between">
                                    <span>🔥 Primary "Hair on Fire" Problem</span>
                                    <span className="text-sm font-mono bg-destructive/10 px-2 py-1 rounded">Score: {problems.primaryProblem?.totalScore || 0}/100</span>
                                </CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-lg font-medium">{problems.primaryProblem?.problem}</p>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-background p-4 rounded-lg border">
                                        <div>
                                            <span className="font-bold block mb-2 text-muted-foreground">Evidence Quotes</span>
                                            <ul className="space-y-2 italic text-muted-foreground">
                                                {problems.primaryProblem?.evidenceQuotes?.map((q: any, i: number) => (
                                                    <li key={i}>"{q.quote}"</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <span className="font-bold block mb-2 text-muted-foreground">Related Pains</span>
                                            <ul className="list-disc list-inside text-foreground">
                                                {problems.primaryProblem?.relatedPains?.map((p: string, i: number) => (
                                                    <li key={i}>{p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* All Headlines */}
                            <Card>
                                <CardHeader><CardTitle className="text-sm">All Generated Headlines</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Formula</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {hvco.titles?.map((t: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">"{t.title}"</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground font-mono">{t.formula}</TableCell>
                                                    <TableCell className="text-right font-bold">{t.totalScore}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
