import JSZip from 'jszip';

/**
 * Export Utility Functions
 *
 * Helpers for converting approved content into CSV and JSON formats.
 */

export interface ExportSpoke {
  id: string;
  content: string;
  platform: string;
  createdAt: number | null;
  hubTitle: string;
  pillarTitle: string;
  hookScore: number | null;
  predictionScore: number | null;
  evaluations: {
    g2_breakdown: string | null;
    g4_result: string | null;
    g4_violations: string | null;
    g5_result: string | null;
    g5_violations: string | null;
  } | null;
  scheduling?: {
    publishAt: string;
    recommendedTimeSlot: string;
    queueIndex: number;
  };
  assets?: {
    id: string;
    type: string;
    r2Key: string;
  }[];
}

/**
 * Assign suggested publish dates and times to content
 */
export function applySchedulingMetadata(data: ExportSpoke[]): ExportSpoke[] {
  const platformQueues: Record<string, number> = {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start scheduling from tomorrow
  startDate.setHours(9, 0, 0, 0); // Default to 9 AM

  return data.map(item => {
    const queuePos = (platformQueues[item.platform] || 0) + 1;
    platformQueues[item.platform] = queuePos;

    // Space out posts: 1 per day per platform
    const publishDate = new Date(startDate);
    publishDate.setDate(startDate.getDate() + (queuePos - 1));

    return {
      ...item,
      scheduling: {
        publishAt: publishDate.toISOString(),
        recommendedTimeSlot: 'morning',
        queueIndex: queuePos
      }
    };
  });
}

/**
 * Convert export data to CSV string
 */
export function convertToCSV(data: ExportSpoke[], includeScheduling: boolean = false): string {
  const headers = [
    'Spoke ID',
    'Hub Title',
    'Pillar Title',
    'Platform',
    'Content',
    'Hook Score (G2)',
    'Prediction Score (G7)',
    'Approved At'
  ];

  if (includeScheduling) {
    headers.push('Suggested Publish Date', 'Optimal Time', 'Queue Position');
  }

  const rows = data.map(item => {
    const row = [
      item.id,
      item.hubTitle,
      item.pillarTitle,
      item.platform,
      `"${item.content.replace(/"/g, '""')}"`, // Escape quotes and wrap in quotes
      item.hookScore ?? 'N/A',
      item.predictionScore ?? 'N/A',
      item.createdAt ? new Date(item.createdAt * 1000).toLocaleString() : 'N/A'
    ];

    if (includeScheduling && item.scheduling) {
      const date = new Date(item.scheduling.publishAt);
      row.push(
        date.toISOString().split('T')[0],
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        item.scheduling.queueIndex.toString()
      );
    }

    return row;
  });

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

/**
 * Convert export data to hierarchical JSON
 */
export function convertToJSON(data: ExportSpoke[], includeScheduling: boolean = false): string {
  const hierarchy: any = {};

  data.forEach(item => {
    if (!hierarchy[item.hubTitle]) {
      hierarchy[item.hubTitle] = {
        title: item.hubTitle,
        pillars: {}
      };
    }

    if (!hierarchy[item.hubTitle].pillars[item.pillarTitle]) {
      hierarchy[item.hubTitle].pillars[item.pillarTitle] = {
        title: item.pillarTitle,
        spokes: []
      };
    }

    const spokeEntry: any = {
      id: item.id,
      platform: item.platform,
      content: item.content,
      hookScore: item.hookScore,
      predictionScore: item.predictionScore,
      evaluations: item.evaluations,
      approvedAt: item.createdAt
    };

    if (includeScheduling && item.scheduling) {
      spokeEntry.scheduling = item.scheduling;
    }

    hierarchy[item.hubTitle].pillars[item.pillarTitle].spokes.push(spokeEntry);
  });

  // Convert objects to arrays for cleaner final JSON
  const finalOutput = Object.values(hierarchy).map((hub: any) => ({
    ...hub,
    pillars: Object.values(hub.pillars)
  }));

  return JSON.stringify(finalOutput, null, 2);
}

/**
 * Generate a ZIP file organized by platform
 */
export async function generatePlatformZIP(
  data: ExportSpoke[], 
  format: 'csv' | 'json',
  includeScheduling: boolean = false,
  includeMedia: boolean = false
): Promise<Blob> {
  const zip = new JSZip();
  const platforms = [...new Set(data.map(item => item.platform))];

  for (const platform of platforms) {
    const platformData = data.filter(item => item.platform === platform);
    const folder = zip.folder(platform);

    if (format === 'csv') {
      const content = convertToCSV(platformData, includeScheduling);
      folder?.file(`${platform}-export.csv`, content);
    } else {
      const content = convertToJSON(platformData, includeScheduling);
      folder?.file(`${platform}-export.json`, content);
    }

    if (includeMedia) {
      const mediaFolder = folder?.folder('media');
      const assetPromises: Promise<void>[] = [];

      platformData.forEach(spoke => {
        spoke.assets?.forEach(asset => {
          assetPromises.push((async () => {
            try {
              const response = await fetch(`/api/assets/${asset.r2Key}`);
              if (response.ok) {
                const blob = await response.blob();
                const extension = asset.type === 'thumbnail' ? 'png' : 'png'; // Default to png
                mediaFolder?.file(`${spoke.id}-${asset.type}.${extension}`, blob);
              }
            } catch (e) {
              console.error(`Failed to fetch asset ${asset.r2Key}`, e);
            }
          })());
        });
      });

      await Promise.all(assetPromises);
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Format spoke content for friendly clipboard usage
 */
export function formatContentForClipboard(content: string, platform: string): string {
  if (platform === 'thread') {
    try {
      const posts = JSON.parse(content);
      if (Array.isArray(posts)) {
        return posts.map((post, i) => `${i + 1}/${posts.length}\n${post}`).join('\n\n');
      }
    } catch (e) {}
  }

  if (platform === 'carousel') {
    try {
      const slides = JSON.parse(content);
      if (Array.isArray(slides)) {
        return slides.map((slide, i) => `Slide ${i + 1}\nTitle: ${slide.title}\n${slide.description}`).join('\n\n');
      }
    } catch (e) {}
  }

  return content;
}

/**
 * Trigger browser download of a string or blob as a file
 */
export function downloadFile(content: string | Blob, filename: string, contentType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: contentType }) : content;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
