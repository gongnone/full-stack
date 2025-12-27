
import { HaloResearchData } from '@repo/data-ops/zod/halo-schema-v2';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { FullResearchReport } from "./full-research-report";

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

export function ResearchResults({ data, fullData }: { data: any, fullData?: any }) {
    // Safe cast or parsing
    const research = data as HaloResearchData;

    if (!research || !research.avatar) {
        return <div className="p-4 text-muted-foreground">Waiting for intelligence data...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. HERO: The Dream Buyer Passport */}
            <Card className="border-l-4 border-l-primary shadow-sm overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardHeader className="bg-muted/10 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl flex items-center gap-2 font-serif tracking-tight">
                            <span className="text-3xl">🎯</span> Target: <span className="text-primary">{research.avatar.name || "Dream Buyer"}</span>
                        </CardTitle>
                        {fullData && <FullResearchReport data={fullData} />}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Premium Grid Layout for Avatar */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Identity */}
                        <div className="space-y-3 p-5 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-2 border-b border-border pb-3">
                                <span className="text-2xl p-2 bg-muted rounded-lg">🪪</span>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Identity</h4>
                            </div>
                            {typeof research.avatar.demographics === 'object' ? (
                                <ul className="text-sm space-y-3">
                                    {Object.entries(research.avatar.demographics).map(([key, value]) => (
                                        <li key={key} className="flex justify-between items-center group">
                                            <span className="font-medium capitalize text-muted-foreground group-hover:text-foreground transition-colors">{key}:</span>
                                            <span className="text-foreground font-semibold text-right max-w-[60%] truncate">{renderValue(value)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-foreground">{research.avatar.demographics}</p>
                            )}
                        </div>

                        {/* Inner Psychology */}
                        <div className="space-y-3 p-5 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-2 border-b border-border pb-3">
                                <span className="text-2xl p-2 bg-muted rounded-lg">🧠</span>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Inner Psychology</h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Primary Desire</span>
                                    <p className="text-sm font-medium leading-relaxed mt-1 text-foreground">{research.marketDesire}</p>
                                </div>
                                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                                    <span className="font-bold text-muted-foreground block mb-1">PSYCHOGRAPHICS:</span>
                                    {typeof research.avatar.psychographics === 'string'
                                        ? research.avatar.psychographics
                                        : "Analysis complete."}
                                </div>
                            </div>
                        </div>

                        {/* Habitat */}
                        <div className="space-y-3 p-5 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-3 mb-2 border-b border-border pb-3">
                                <span className="text-2xl p-2 bg-muted rounded-lg">📍</span>
                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Habitat</h4>
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
                                            <li key={i} className="flex items-start gap-2 text-sm group">
                                                <Badge variant="secondary" className="shrink-0 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">Source</Badge>
                                                <span className="text-foreground group-hover:text-primary transition-colors">{place}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. INSIGHT BENTO GRID: Problems & Gaps */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Bleeding Necks */}
                <Card className="flex flex-col h-full border-l-4 border-l-destructive/70 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span>🩸</span> Bleeding Necks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-3">
                            {research.painPoints?.map((pain: any, i: number) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                    <Badge variant="destructive" className="mt-0.5 shrink-0 bg-destructive text-destructive-foreground">{i + 1}</Badge>
                                    <span className="text-sm text-foreground leading-snug">{renderValue(pain)}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Right: Market Gaps */}
                <Card className="flex flex-col h-full border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <span>🛡️</span> Market Gaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-3">
                            {research.competitorGaps?.map((gap: any, i: number) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <span className="text-lg shrink-0 pt-0.5 text-amber-600">⚠️</span>
                                    <span className="text-sm font-medium text-foreground pt-0.5">{renderValue(gap)}</span>
                                </li>
                            ))}
                            {(!research.competitorGaps || research.competitorGaps.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                                    <span className="text-4xl opacity-20">🤷‍♂️</span>
                                    <p>No competitor gaps identified yet.</p>
                                    <p className="text-xs">Try running a wider search or check the "Headlines" tab.</p>
                                </div>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* 3. HEADLINES (Full Width) */}
            <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span>⚡</span> Killer Headlines (HVCO)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {research.hvcoTitles?.slice(0, 3).map((t: any, i: number) => (
                            <div key={i} className={`p-5 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] hover:shadow-md ${t.isWinner ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-card border-border'}`}>
                                <div className="space-y-2">
                                    {t.isWinner && <Badge className="bg-primary text-primary-foreground self-start mb-2">🏆 Recommended</Badge>}
                                    <h4 className="font-serif font-medium text-lg text-foreground leading-snug">"{t.title}"</h4>
                                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-border bg-muted/30">{t.formula}</Badge>
                                </div>
                                <div className="flex items-end justify-between border-t border-border/50 pt-3 mt-2">
                                    <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Predictive Score</div>
                                    <div className="text-2xl font-bold text-primary">{t.totalScore}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 4. DEEP DIVES: Timeline & Voice */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Timeline (2 cols) */}
                <Card className="lg:col-span-2 border-l-4 border-l-primary/70 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>⏰</span> Day in the Life
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            try {
                                const avatar = research.avatar as any;
                                const dil = typeof avatar.dimensions?.dayInLife === 'string'
                                    ? JSON.parse(avatar.dimensions.dayInLife)
                                    : avatar.dimensions?.dayInLife;

                                if (!dil || typeof dil !== 'object') return <p>No timeline data available.</p>;

                                return (
                                    <div className="space-y-8 relative border-l-2 border-border ml-4 pl-8 py-2">
                                        {[
                                            { icon: '☀️', time: dil.wakeTime || 'Morning', label: 'Wake Up', desc: dil.morningRoutine, alert: dil.checkPhoneFirst },
                                            { icon: '🚗', time: 'The Commute', label: 'Commute', desc: dil.commuteType },
                                            { icon: '🔥', time: dil.peakStressTime || 'Mid-Day', label: 'Peak Stress', desc: 'High pressure moment', urgent: true },
                                            { icon: '🌙', time: dil.bedTime || 'Night', label: 'Wind Down', desc: dil.eveningRoutine }
                                        ].map((slot, i) => (
                                            <div key={i} className="relative group">
                                                <span className={`absolute -left-[45px] flex h-8 w-8 items-center justify-center rounded-full text-xs ring-4 ring-background z-10 
                                                    ${slot.urgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors'}`}>
                                                    {slot.icon}
                                                </span>
                                                <h4 className="font-bold text-sm text-foreground">{slot.time}</h4>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{slot.desc}</p>
                                                {slot.alert && (
                                                    <Badge variant="outline" className="mt-2 text-xs border-destructive/20 bg-destructive/5 text-destructive">
                                                        📱 Checks Phone Immediately
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            } catch (e) {
                                return <p className="text-sm text-muted-foreground">Timeline data format unrecognized.</p>;
                            }
                        })()}
                    </CardContent>
                </Card>

                {/* Market Voice (1 col) */}
                <Card className="border-l-4 border-l-primary shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span>🗣️</span> Market Voice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {research.verbatimQuotes?.map((quote: any, i: number) => (
                                <blockquote key={i} className="relative p-4 bg-muted/30 rounded-lg border-l-2 border-primary/50 text-sm italic text-muted-foreground hover:bg-muted/50 transition-colors">
                                    <span className="absolute top-2 left-2 text-primary/20 text-3xl font-serif">"</span>
                                    <span className="relative z-10 pl-2 block">{renderValue(quote)}</span>
                                </blockquote>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
