/**
 * Utility functions for exporting data in CSV and JSON formats.
 */

export interface ExportSpoke {
  id: string;
  content: string;
  platform: string;
  createdAt: number;
  hubTitle: string;
  pillarTitle: string;
  hookScore: number | null;
  predictionScore: number | null;
  evaluations: any;
  assets: { id: string; type: string; r2Key: string }[];
}

/**
 * Converts an array of spokes to a CSV string.
 */
export function convertToCSV(data: ExportSpoke[]): string {
  if (data.length === 0) return "";

  const headers = [
    "Spoke ID",
    "Hub Title",
    "Pillar Title",
    "Platform",
    "Content",
    "Hook Score (G2)",
    "Prediction Score (G7)",
    "Approval Timestamp",
  ];

  const rows = data.map((spoke) => {
    return [
      spoke.id,
      spoke.hubTitle,
      spoke.pillarTitle,
      spoke.platform,
      // Escape quotes and wrap in quotes to handle newlines and commas
      `"${spoke.content.replace(/"/g, '""')}"`,
      spoke.hookScore ?? "",
      spoke.predictionScore ?? "",
      spoke.createdAt ? new Date(spoke.createdAt * 1000).toISOString() : "",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Converts an array of spokes to a JSON string.
 */
export function convertToJSON(data: ExportSpoke[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Downloads a file with the given content and filename.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
