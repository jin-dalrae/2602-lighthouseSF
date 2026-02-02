// services/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    Firestore
} from 'firebase/firestore';
import { IssueCard, LogEntry } from '../types';

const firebaseConfig = {
    apiKey: "AIzaSyD1zFDPlDvzapuxo9RJ7kD9ahK3SUpql9U",
    authDomain: "lighthousesf-10769.firebaseapp.com",
    projectId: "lighthousesf-10769",
    storageBucket: "lighthousesf-10769.firebasestorage.app",
    messagingSenderId: "714479585876",
    appId: "1:714479585876:web:4faa2a6b06064f0076fbc1",
    measurementId: "G-X5CN51GS51"
};

let app: FirebaseApp;
let db: Firestore;

// Initialize Firebase
export const initFirebase = () => {
    if (!app) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
    return { app, db };
};

// Issue with full context for storage
export interface StoredIssue extends IssueCard {
    createdAt: string;
    updatedAt: string;
    agentAnalysis: Record<string, string>; // agent name -> analysis
    rawData: Record<string, any>; // source data
    agentConversation: string[]; // discussion logs
    status: 'active' | 'resolved' | 'monitoring';
}

// Save an issue with its full context
export const saveIssue = async (
    issue: IssueCard,
    agentAnalysis: Record<string, string>,
    rawData: Record<string, any>,
    agentConversation: string[]
): Promise<void> => {
    const { db } = initFirebase();

    const storedIssue: StoredIssue = {
        ...issue,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agentAnalysis,
        rawData,
        agentConversation,
        status: 'active'
    };

    await setDoc(doc(db, 'issues', `issue_${issue.id}`), storedIssue);
};

// Save multiple issues at once (after pipeline run)
export const saveAllIssues = async (
    issues: IssueCard[],
    agents: { name: string; analysis?: string; payload?: string }[],
    logs: LogEntry[]
): Promise<void> => {
    const { db } = initFirebase();

    // Build agent analysis map
    const agentAnalysis: Record<string, string> = {};
    const rawData: Record<string, any> = {};

    agents.forEach(agent => {
        if (agent.analysis) {
            agentAnalysis[agent.name] = agent.analysis;
        }
        if (agent.payload) {
            try {
                rawData[agent.name] = JSON.parse(agent.payload);
            } catch {
                rawData[agent.name] = agent.payload;
            }
        }
    });

    // Filter relevant logs for conversation
    const agentConversation = logs
        .filter(l => l.source !== 'System')
        .map(l => `[${l.timestamp}] ${l.source}: ${l.message}`);

    // Save each issue
    for (const issue of issues) {
        const storedIssue: StoredIssue = {
            ...issue,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            agentAnalysis,
            rawData,
            agentConversation,
            status: 'active'
        };

        await setDoc(doc(db, 'issues', `issue_${issue.id}_${Date.now()}`), storedIssue);
    }
};

// Load all stored issues
export const loadAllIssues = async (): Promise<StoredIssue[]> => {
    const { db } = initFirebase();

    const issuesRef = collection(db, 'issues');
    const q = query(issuesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const issues: StoredIssue[] = [];
    snapshot.forEach(doc => {
        issues.push(doc.data() as StoredIssue);
    });

    return issues;
};

// Update issue status
export const updateIssueStatus = async (
    issueId: string,
    status: 'active' | 'resolved' | 'monitoring'
): Promise<void> => {
    const { db } = initFirebase();

    await setDoc(
        doc(db, 'issues', issueId),
        { status, updatedAt: new Date().toISOString() },
        { merge: true }
    );
};

// Delete an issue
export const deleteIssue = async (issueId: string): Promise<void> => {
    const { db } = initFirebase();
    await deleteDoc(doc(db, 'issues', issueId));
};

// Clear all issues (for testing)
export const clearAllIssues = async (): Promise<void> => {
    const { db } = initFirebase();
    const snapshot = await getDocs(collection(db, 'issues'));

    const deletePromises: Promise<void>[] = [];
    snapshot.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
};
