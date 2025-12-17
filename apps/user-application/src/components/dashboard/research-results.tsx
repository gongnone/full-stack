
import { HaloResearchData } from '@repo/data-ops/zod/halo-schema-v2';
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
                <CardContent>
                    {/* Premium Grid Layout for Avatar */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Identity & Demographics */}
                        <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                <span className="text-xl">🪪</span>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500">Identity</h4>
                            </div>
                            {typeof research.avatar.demographics === 'object' ? (
                                <ul className="text-sm space-y-2">
                                    {Object.entries(research.avatar.demographics).map(([key, value]) => (
                                        <li key={key} className="flex justify-between">
                                            <span className="font-medium capitalize text-slate-600">{key}:</span>
                                            <span className="text-slate-900 font-semibold text-right">{renderValue(value)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-700">{research.avatar.demographics}</p>
                            )}
                        </div>

                        {/* 2. Inner Drive (Psychographics) */}
                        <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                <span className="text-xl">🧠</span>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500">Inner Psychology</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-blue-600 uppercase">Primary Desire</span>
                                    <p className="text-sm font-medium leading-relaxed">{research.marketDesire}</p>
                                </div>
                                <div className="text-xs text-slate-500">
                                    <span className="font-semibold text-slate-600 block mb-1">PSYCHOGRAPHICS:</span>
                                    {typeof research.avatar.psychographics === 'string'
                                        ? research.avatar.psychographics
                                        : "Analysis complete."}
                                </div>
                            </div>
                        </div>

                        {/* 3. Environment (Watering Holes) */}
                        <div className="space-y-3 p-4 bg-slate-50/50 rounded-lg border border-slate-100 col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                <span className="text-xl">📍</span>
                                <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500">Habitat</h4>
                            </div>
                            {(() => {
                                const avatar = research.avatar as any;
                                const wateringHoles = avatar.dimensions?.wateringHoles || [];
                                const infoSources = avatar.dimensions?.informationSources || [];
                                const combined = [...wateringHoles, ...infoSources].slice(0, 5);

                                if (combined.length === 0) return <p className="text-sm text-muted-foreground italic">No habitat data identified.</p>;

                                return (
                                    <ul className="space-y-2">
                                        {combined.map((place: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Badge variant="outline" className="shrink-0 bg-white">Source</Badge>
                                                <span className="text-slate-700">{place}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="pains" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pains">🩸 Bleeding Necks</TabsTrigger>
                    <TabsTrigger value="gaps">🛡️ Competitor Gaps</TabsTrigger>
                    <TabsTrigger value="voice">🗣️ Market Voice</TabsTrigger>
                    <TabsTrigger value="timeline">⏰ Timeline</TabsTrigger>
                    <TabsTrigger value="headlines">⚡ Headlines</TabsTrigger>
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

                <TabsContent value="timeline" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Day in the Life Protocol</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                try {
                                    // Parse if string, or use if object
                                    const avatar = research.avatar as any;
                                    const dil = typeof avatar.dimensions?.dayInLife === 'string'
                                        ? JSON.parse(avatar.dimensions.dayInLife)
                                        : avatar.dimensions?.dayInLife;

                                    if (!dil || typeof dil !== 'object') return <p>No timeline data available.</p>;

                                    return (
                                        <div className="space-y-6 relative border-l-2 border-slate-200 ml-4 pl-8 py-2">
                                            {/* Wake Up */}
                                            <div className="relative">
                                                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs ring-4 ring-white">
                                                    ☀️
                                                </span>
                                                <h4 className="font-bold text-sm text-slate-900">{dil.wakeTime || 'Morning'}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{dil.morningRoutine}</p>
                                                {dil.checkPhoneFirst && (
                                                    <Badge variant="outline" className="mt-2 text-xs border-red-200 bg-red-50 text-red-600">
                                                        📱 Checks Phone Immediately
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Commute */}
                                            <div className="relative">
                                                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs ring-4 ring-white">
                                                    🚗
                                                </span>
                                                <div className="flex flex-col">
                                                    <h4 className="font-bold text-sm text-slate-900">The Commute</h4>
                                                    <p className="text-sm text-slate-600 mt-1">{dil.commuteType}</p>
                                                </div>
                                            </div>

                                            {/* Peak Stress */}
                                            <div className="relative">
                                                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xs ring-4 ring-white">
                                                    🔥
                                                </span>
                                                <h4 className="font-bold text-sm text-slate-900">{dil.peakStressTime || 'Mid-Day'} - Peak Stress</h4>
                                                <p className="text-sm text-slate-600 mt-1">{dil.peakStressTime ? 'High pressure moment' : ''}</p>
                                            </div>

                                            {/* Bedtime */}
                                            <div className="relative">
                                                <span className="absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs ring-4 ring-white">
                                                    🌙
                                                </span>
                                                <h4 className="font-bold text-sm text-slate-900">{dil.bedTime || 'Night'}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{dil.eveningRoutine}</p>
                                            </div>
                                        </div>
                                    );
                                } catch (e) {
                                    return <p className="text-sm text-muted-foreground">Timeline data format unrecognized.</p>;
                                }
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="headlines" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Killer Headlines (HVCO)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {research.hvcoTitles?.map((t: any, i: number) => (
                                    <div key={i} className={`p-4 rounded-lg border flex justify-between items-start gap-4 ${t.isWinner ? 'bg-green-50/50 border-green-200' : 'bg-slate-50/50 border-slate-100'}`}>
                                        <div className="space-y-1">
                                            <h4 className="font-medium text-slate-900 leading-snug">"{t.title}"</h4>
                                            <div className="flex gap-2 text-xs">
                                                <Badge variant="outline" className="font-mono text-[10px] text-slate-500">{t.formula}</Badge>
                                                {t.isWinner && <Badge className="bg-green-600">🏆 Recommended</Badge>}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-2xl font-bold text-slate-900">{t.totalScore}</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold">Score</div>
                                        </div>
                                    </div>
                                ))}
                                {(!research.hvcoTitles || research.hvcoTitles.length === 0) && (
                                    <p className="text-muted-foreground text-sm italic">No headlines generated yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
