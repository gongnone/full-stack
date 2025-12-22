import { Spoke } from "@repo/data-ops/schema";
import { GateBadge } from "./GateBadge";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

interface SpokeCardProps {
    spoke: Spoke;
}

export function SpokeCard({ spoke }: SpokeCardProps) {
    const { data: evaluation } = useQuery({
        queryKey: ["spoke-evaluation", spoke.id],
        queryFn: () => (trpc as any).generations.getSpokeEvaluation.query({ spokeId: spoke.id }),
    });

    return (
        <div className="p-4 border rounded-lg">
            <p>{spoke.content}</p>
            {evaluation && (
                <div className="flex gap-2 mt-4">
                    <GateBadge
                        gate="G2"
                        score={evaluation.g2_score}
                        breakdown={JSON.parse(evaluation.g2_breakdown || '{}')}
                        notes="Notes placeholder" // This should come from the evaluation
                    />
                    <GateBadge
                        gate="G4"
                        result={evaluation.g4_result as 'pass' | 'fail'}
                        violations={JSON.parse(evaluation.g4_violations || '[]')}
                        cosineSimilarity={evaluation.g4_similarity_score}
                    />
                    <GateBadge
                        gate="G5"
                        result={evaluation.g5_result as 'pass' | 'fail'}
                        violations={JSON.parse(evaluation.g5_violations || '[]')}
                    />
                </div>
            )}
        </div>
    );
}
