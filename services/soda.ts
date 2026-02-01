// services/soda.ts

import { getCachedData, setCachedData, hasDataChanged } from './cache';

const SODA_BASE = "https://data.sfgov.org/resource";
const DATA_AGENT_URL = "https://sf-data-intel-agent-1006908265321.us-west1.run.app/";

// Helper for dates (YYYY-MM-DD)
const getSimpleDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

async function fetchFromExternalAgent(area: string): Promise<string | null> {
    try {
        const url = new URL(DATA_AGENT_URL);
        url.searchParams.append("area", area);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(url.toString(), {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            return JSON.stringify({
                agent: `${area}-External (Data Agent)`,
                timestamp: new Date().toISOString(),
                source: "External Data Agent",
                url: DATA_AGENT_URL,
                data: data
            }, null, 2);
        } else {
            console.warn(`External Agent returned ${response.status} for ${area}`);
        }
    } catch (e) {
        console.warn(`External Data Agent fetch failed for ${area}, falling back to SODA.`, e);
    }
    return null;
}

async function fetchSoda(datasetId: string, queryParams: string) {
    try {
        const url = `${SODA_BASE}/${datasetId}.json?${queryParams}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`SODA API Error: ${res.status} ${res.statusText}`);
        }
        return await res.json();
    } catch (e: any) {
        console.warn(`SODA Fetch Failed (${datasetId}):`, e.message);
        return null;
    }
}

// Agent 1: Public Safety Data
export const fetchPSData = async (): Promise<string> => {
    // Try External Agent First
    const externalData = await fetchFromExternalAgent("PS");
    if (externalData) return externalData;

    // Fallback: SODA
    // Police: last 7 days
    // Dataset: wg3w-h783
    // Note: 'incident_date' or 'incident_datetime' is standard. SODA queries are case-sensitive on columns sometimes.
    const policeQuery = `$where=incident_date > '${getSimpleDate(7)}'&$limit=50&$order=incident_date DESC`;

    // Fire: last 30 days
    // Dataset: nuek-vuh3
    const fireQuery = `$where=call_date > '${getSimpleDate(30)}'&$limit=50&$order=call_date DESC`;

    const [police, fire] = await Promise.all([
        fetchSoda('wg3w-h783', policeQuery),
        fetchSoda('nuek-vuh3', fireQuery)
    ]);

    const result = {
        agent: "PS-1 (SODA)",
        timestamp: new Date().toISOString(),
        sources: [
            { id: "wg3w-h783", name: "Police Incidents", status: police ? "OK" : "FAILED", count: police?.length || 0 },
            { id: "nuek-vuh3", name: "Fire Calls", status: fire ? "OK" : "FAILED", count: fire?.length || 0 }
        ],
        data: {
            police_incidents: police || [],
            fire_calls: fire || []
        }
    };

    return JSON.stringify(result, null, 2);
};

// Agent 4: Infrastructure Data
export const fetchIUData = async (): Promise<string> => {
    // Try External Agent First
    const externalData = await fetchFromExternalAgent("IU");
    if (externalData) return externalData;

    // Fallback: SODA
    // 311 Metrics: mwjb-biik
    // This dataset tracks cases. 'opened' is a common date field in 311 datasets.
    const metricsQuery = `$limit=50&$order=date DESC`;

    const metrics311 = await fetchSoda('mwjb-biik', metricsQuery);

    const result = {
        agent: "IU-4 (SODA)",
        timestamp: new Date().toISOString(),
        sources: [
            { id: "mwjb-biik", name: "311 Metrics", status: metrics311 ? "OK" : "FAILED", count: metrics311?.length || 0 },
            { id: "manual", name: "Street Permits", status: "SIMULATED", note: "API endpoint not configured in Spec" }
        ],
        data: {
            metrics_311: metrics311 || [],
            street_permits: { note: "Simulated Snapshot", pci_score_avg: 68, active_permits: 142 }
        }
    };
    return JSON.stringify(result, null, 2);
};

// Agent 7: Land Use Data
export const fetchLZData = async (): Promise<string> => {
    // Try External Agent First
    const externalData = await fetchFromExternalAgent("LZ");
    if (externalData) return externalData;

    // Fallback: SODA
    // Building Permits: i98e-djp9 | last 90d
    // 'filed_date' is standard for permits
    const permitQuery = `$where=filed_date > '${getSimpleDate(90)}'&$limit=50&$order=filed_date DESC`;

    const permits = await fetchSoda('i98e-djp9', permitQuery);

    const result = {
        agent: "LZ-7 (SODA)",
        timestamp: new Date().toISOString(),
        sources: [
            { id: "i98e-djp9", name: "Building Permits", status: permits ? "OK" : "FAILED", count: permits?.length || 0 }
        ],
        data: {
            building_permits: permits || []
        }
    };
    return JSON.stringify(result, null, 2);
};