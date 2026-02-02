// services/soda.ts

import { getCachedData, setCachedData } from './cache';

const SODA_BASE = "https://data.sfgov.org/resource";

// Helper for dates (YYYY-MM-DD)
const getSimpleDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

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
    const cacheKey = 'PS_DATA';

    // Check cache first to avoid redundant fetches
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log('[PS Data Agent] Using cached data (within marathon cycle)');
        return cached;
    }

    // SODA - Direct API calls (no CORS issues)
    // Police Incidents: wg3w-h783 | last 7 days
    const policeQuery = `$where=incident_date > '${getSimpleDate(7)}'&$limit=50&$order=incident_date DESC`;

    // Fire Calls: nuek-vuh3 | last 30 days
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

    const resultStr = JSON.stringify(result, null, 2);
    setCachedData(cacheKey, resultStr);
    return resultStr;
};

// Agent 4: Infrastructure Data
export const fetchIUData = async (): Promise<string> => {
    const cacheKey = 'IU_DATA';

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log('[IU Data Agent] Using cached data (within marathon cycle)');
        return cached;
    }

    // SODA - Direct API calls
    // 311 Cases: dpis-dxar (SF 311 Cases - current dataset)
    const cases311Query = `$where=requested_datetime > '${getSimpleDate(30)}'&$limit=50&$order=requested_datetime DESC`;
    // Street Use Permits: w2ip-mc6t (active street use permits)
    const streetUseQuery = `$limit=50&$order=permit_start_date DESC`;

    const [cases311, streetUse] = await Promise.all([
        fetchSoda('dpis-dxar', cases311Query),
        fetchSoda('w2ip-mc6t', streetUseQuery)
    ]);

    const result = {
        agent: "IU-4 (SODA)",
        timestamp: new Date().toISOString(),
        sources: [
            { id: "dpis-dxar", name: "311 Cases", status: cases311 ? "OK" : "FAILED", count: cases311?.length || 0 },
            { id: "w2ip-mc6t", name: "Street Use Permits", status: streetUse ? "OK" : "FAILED", count: streetUse?.length || 0 }
        ],
        data: {
            cases_311: cases311 || [],
            street_use_permits: streetUse || []
        }
    };

    const resultStr = JSON.stringify(result, null, 2);
    setCachedData(cacheKey, resultStr);
    return resultStr;
};

// Agent 7: Land Use Data
export const fetchLZData = async (): Promise<string> => {
    const cacheKey = 'LZ_DATA';

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log('[LZ Data Agent] Using cached data (within marathon cycle)');
        return cached;
    }

    // SODA - Direct API calls  
    // Building Permits: i98e-djp9 | last 90d
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

    const resultStr = JSON.stringify(result, null, 2);
    setCachedData(cacheKey, resultStr);
    return resultStr;
};