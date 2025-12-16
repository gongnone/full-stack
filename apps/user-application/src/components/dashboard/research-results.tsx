
import { HaloResearchData } from '@repo/data-ops/zod/halo-schema';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResearchResults({ data }: { data: any }) {
    // Safe cast or parsing
    const research = data as HaloResearchData;

    if (!research || !research.avatar) {
        return <div className="p-4 text-muted-foreground">Waiting for intelligence data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Top Section: The Dream Buyer */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        🎯 Target: {research.avatar.name || "Dream Buyer"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Demographics</h4>
                        <p className="text-sm text-muted-foreground">{research.avatar.demographics}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Psychographics</h4>
                        <p className="text-sm text-muted-foreground">{research.avatar.psychographics}</p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="pains" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pains">🩸 Bleeding Necks</TabsTrigger>
                    <TabsTrigger value="gaps">🛡️ Competitor Gaps</TabsTrigger>
                    <TabsTrigger value="voice">🗣️ Market Voice</TabsTrigger>
                </TabsList>

                <TabsContent value="pains" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Core Pain Points</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {research.painPoints?.map((pain, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Badge variant="destructive" className="mt-1">{i + 1}</Badge>
                                        <span>{pain}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gaps" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Market Gaps (Opportunities)</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {research.competitorGaps?.map((gap, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-green-500">✅</span>
                                        <span>{gap}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="voice" className="mt-4">
                    <Card>
                        <CardHeader><CardTitle>Verbatim Quotes</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            {research.verbatimQuotes?.map((quote, i) => (
                                <blockquote key={i} className="border-l-2 pl-4 italic text-muted-foreground">
                                    "{quote}"
                                </blockquote>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
