// services/cache.ts
// Dataset caching to prevent redundant fetches within the same marathon cycle

interface CacheEntry {
    data: string;
    timestamp: number;
    hash: string;
}

interface PastIssue {
    id: number;
    title: string;
    areas: string[];
    severity: string;
    dataRefs: string[];
    createdAt: number;
    status: 'monitoring' | 'escalated' | 'resolved' | 'stagnant';
    lastChecked: number;
    trendData: number[];
}

// In-memory cache for current session
const datasetCache: Map<string, CacheEntry> = new Map();

// Past issues stored in localStorage for persistence
const PAST_ISSUES_KEY = 'lighthouse_past_issues';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes - matches marathon cycle

// Simple hash for data comparison
const hashData = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < Math.min(data.length, 1000); i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
};

// Check if we have recent cached data for a dataset
export const getCachedData = (datasetId: string): string | null => {
    const entry = datasetCache.get(datasetId);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
        datasetCache.delete(datasetId);
        return null;
    }

    return entry.data;
};

// Store data in cache
export const setCachedData = (datasetId: string, data: string): void => {
    datasetCache.set(datasetId, {
        data,
        timestamp: Date.now(),
        hash: hashData(data)
    });
};

// Check if data has changed since last fetch
export const hasDataChanged = (datasetId: string, newData: string): boolean => {
    const entry = datasetCache.get(datasetId);
    if (!entry) return true;

    const newHash = hashData(newData);
    return entry.hash !== newHash;
};

// Clear cache (called when marathon cycle completes)
export const clearCache = (): void => {
    datasetCache.clear();
};

// --- PAST ISSUES PERSISTENCE ---

export const getPastIssues = (): PastIssue[] => {
    try {
        const stored = localStorage.getItem(PAST_ISSUES_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
};

export const savePastIssues = (issues: PastIssue[]): void => {
    try {
        // Keep only last 50 issues
        const trimmed = issues.slice(-50);
        localStorage.setItem(PAST_ISSUES_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Failed to save past issues:', e);
    }
};

export const addPastIssue = (issue: {
    id: number;
    title: string;
    areas: string[];
    severity: string;
    dataRefs: string[];
}): void => {
    const pastIssues = getPastIssues();

    // Convert severity to numeric value for trend tracking
    const severityToValue = (sev: string): number => {
        switch (sev.toLowerCase()) {
            case 'critical': return 90;
            case 'high': return 70;
            case 'medium': return 50;
            case 'low': return 30;
            default: return 50;
        }
    };

    // Check if issue already exists (by title similarity)
    const existing = pastIssues.find(p =>
        p.title.toLowerCase().includes(issue.title.toLowerCase().split(' ').slice(0, 3).join(' ')) ||
        issue.title.toLowerCase().includes(p.title.toLowerCase().split(' ').slice(0, 3).join(' '))
    );

    if (existing) {
        // Update existing issue with real severity-based metric
        existing.lastChecked = Date.now();
        existing.trendData = [...existing.trendData.slice(-6), severityToValue(issue.severity)];
        savePastIssues(pastIssues);
    } else {
        // Add new issue
        const newIssue: PastIssue = {
            ...issue,
            createdAt: Date.now(),
            status: 'monitoring',
            lastChecked: Date.now(),
            trendData: [severityToValue(issue.severity)]
        };
        savePastIssues([...pastIssues, newIssue]);
    }
};

export const updateIssueStatus = (
    issueId: number,
    status: PastIssue['status']
): void => {
    const pastIssues = getPastIssues();
    const issue = pastIssues.find(p => p.id === issueId);
    if (issue) {
        issue.status = status;
        issue.lastChecked = Date.now();
        savePastIssues(pastIssues);
    }
};

// Compare current issues with past issues to detect changes
export const compareWithPastIssues = (
    currentIssues: Array<{ title: string; severity: string }>
): Array<{
    pastIssue: PastIssue;
    status: 'improving' | 'worsening' | 'stagnant' | 'new';
    matchedCurrent?: { title: string; severity: string };
}> => {
    const pastIssues = getPastIssues();
    const results: Array<{
        pastIssue: PastIssue;
        status: 'improving' | 'worsening' | 'stagnant' | 'new';
        matchedCurrent?: { title: string; severity: string };
    }> = [];

    const severityRank = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };

    for (const past of pastIssues) {
        // Find matching current issue
        const matched = currentIssues.find(c =>
            c.title.toLowerCase().includes(past.title.toLowerCase().split(' ').slice(0, 2).join(' ')) ||
            past.title.toLowerCase().includes(c.title.toLowerCase().split(' ').slice(0, 2).join(' '))
        );

        if (matched) {
            const pastSev = severityRank[past.severity as keyof typeof severityRank] || 2;
            const currSev = severityRank[matched.severity as keyof typeof severityRank] || 2;

            let status: 'improving' | 'worsening' | 'stagnant' = 'stagnant';
            if (currSev > pastSev) status = 'worsening';
            else if (currSev < pastSev) status = 'improving';

            results.push({ pastIssue: past, status, matchedCurrent: matched });
        } else {
            // Issue no longer appearing - potentially resolved
            results.push({ pastIssue: past, status: 'improving' });
        }
    }

    return results;
};

export type { PastIssue };
