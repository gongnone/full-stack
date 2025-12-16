
import { HaloResearchData } from '@repo/data-ops/zod/halo-schema';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Safely render any value - handles arrays, objects, and primitives
 */
function renderValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);

    if (Array.isArray(value)) {
        // Handle array of objects (like vernacular entries)
        return value.map(item => {
            if (typeof item === 'object' && item !== null) {
                // For vernacular: {phrase, source, context}
                if ('phrase' in item) return `"${item.phrase}"`;
                // For other objects, show key values
                return Object.values(item).filter(v => typeof v === 'string').join(' - ');
            }
            return String(item);
        }).join(', ');
    }

    if (typeof value === 'object') {
        // For nested objects, extract meaningful string values
        const stringValues = Object.values(value).filter(v => typeof v === 'string');
        if (stringValues.length > 0) return stringValues.join(', ');
        return JSON.stringify(value);
    }

    return String(value);
}

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
                        {typeof research.avatar.demographics === 'object' ? (
                            <ul className="text-sm space-y-1">
                                {Object.entries(research.avatar.demographics).map(([key, value]) => (
                                    <li key={key}>
                                        <span className="font-medium capitalize">{key}: </span>
                                        <span className="text-muted-foreground">{renderValue(value)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">{research.avatar.demographics}</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Psychographics</h4>
                        {typeof research.avatar.psychographics === 'object' ? (
                            <ul className="text-sm space-y-1">
                                {Object.entries(research.avatar.psychographics).map(([key, value]) => (
                                    <li key={key}>
                                        <span className="font-medium capitalize">{key}: </span>
                                        <span className="text-muted-foreground">{renderValue(value)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">{research.avatar.psychographics}</p>
                        )}
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
                                {research.painPoints?.map((pain: any, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Badge variant="destructive" className="mt-1">{i + 1}</Badge>
                                        <span>{renderValue(pain)}</span>
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
                                {research.competitorGaps?.map((gap: any, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className="text-green-500">✅</span>
                                        <span>{renderValue(gap)}</span>
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
                            {research.verbatimQuotes?.map((quote: any, i: number) => (
                                <blockquote key={i} className="border-l-2 pl-4 italic text-muted-foreground">
                                    "{renderValue(quote)}"
                                </blockquote>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
