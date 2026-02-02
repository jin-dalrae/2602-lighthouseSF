import React, { useState } from 'react';
import { StoredIssue } from '../services/firebase';
import { C } from '../constants';
import { X, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, TrendingUp, FileText, MessageSquare, Database, CheckCircle, Eye, Clock, Bot, Lightbulb, BarChart3 } from 'lucide-react';
import { Area } from '../types';

interface Props {
    issue: StoredIssue;
    onClose: () => void;
    onStatusChange?: (status: 'active' | 'resolved' | 'monitoring') => void;
}

// Parse agent conversation message
const parseConversationMessage = (msg: string): { timestamp: string; agent: string; content: string } | null => {
    const match = msg.match(/^\[([^\]]+)\]\s+([^:]+):\s+(.+)$/s);
    if (match) {
        return { timestamp: match[1], agent: match[2], content: match[3] };
    }
    return null;
};

// Get agent color based on name
const getAgentColor = (agentName: string): string => {
    if (agentName.includes('PS') || agentName.includes('Public Safety')) return C.ps;
    if (agentName.includes('IU') || agentName.includes('Infrastructure')) return C.iu;
    if (agentName.includes('LZ') || agentName.includes('Land Use')) return C.lz;
    if (agentName.includes('Orchestrator') || agentName.includes('System')) return C.mint;
    if (agentName.includes('Consolidator')) return '#8B5CF6';
    return '#64748B';
};

const AreaBadge: React.FC<{ area: Area }> = ({ area }) => {
    const map = {
        [Area.PS]: { label: "Public Safety", color: C.ps, bg: C.psLight },
        [Area.IU]: { label: "Infrastructure", color: C.iu, bg: C.iuLight },
        [Area.LZ]: { label: "Land Use", color: C.lz, bg: C.lzLight }
    };
    const a = map[area];
    if (!a) return null;
    return (
        <span style={{
            display: "inline-block",
            background: a.bg,
            color: a.color,
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 16,
            marginRight: 6
        }}>
            {a.label}
        </span>
    );
};

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const colors: Record<string, { bg: string; color: string }> = {
        Critical: { bg: '#FEE2E2', color: '#DC2626' },
        High: { bg: '#FEF3C7', color: '#D97706' },
        Medium: { bg: '#E0F2FE', color: '#0284C7' },
        Low: { bg: '#F1F5F9', color: '#64748B' }
    };
    const c = colors[severity] || colors.Low;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: c.bg,
            color: c.color,
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 16
        }}>
            <AlertTriangle size={12} />
            {severity}
        </span>
    );
};

const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode
}> = ({ title, icon, defaultOpen = false, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div style={{
            border: `1px solid ${C.gray3}`,
            borderRadius: 10,
            marginBottom: 12,
            overflow: 'hidden'
        }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    background: C.paper,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                }}
            >
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span style={{ color: C.gray1 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{title}</span>
            </button>
            {isOpen && (
                <div style={{ padding: 16, background: C.white, borderTop: `1px solid ${C.gray3}` }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export const IssueDetailModal: React.FC<Props> = ({ issue, onClose, onStatusChange }) => {
    const statusColors = {
        active: { bg: '#FEF3C7', color: '#D97706', label: 'Active' },
        resolved: { bg: '#D1FAE5', color: '#059669', label: 'Resolved' },
        monitoring: { bg: '#E0F2FE', color: '#0284C7', label: 'Monitoring' }
    };

    const currentStatus = statusColors[issue.status || 'active'];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
        }} onClick={onClose}>
            <div
                style={{
                    background: C.white,
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 800,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid ${C.gray3}`,
                    background: `linear-gradient(135deg, ${C.mintLight}, ${C.paper})`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {issue.areas.map(a => <AreaBadge key={a} area={a} />)}
                            <SeverityBadge severity={issue.severity} />
                            {issue.cross_area && (
                                <span style={{
                                    background: C.mint,
                                    color: C.white,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '4px 10px',
                                    borderRadius: 16,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5
                                }}>Cross-Area</span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 8,
                                borderRadius: 8,
                                display: 'flex'
                            }}
                        >
                            <X size={20} color={C.gray1} />
                        </button>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 8, lineHeight: 1.3 }}>
                        {issue.title}
                    </h2>

                    <p style={{ fontSize: 14, color: C.gray1, lineHeight: 1.5, marginBottom: 12 }}>
                        {issue.summary}
                    </p>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: C.gray2 }}>
                            Horizon: <strong style={{ color: C.navy }}>{issue.time_horizon}</strong>
                        </span>
                        <span style={{ fontSize: 11, color: C.gray2 }}>
                            Confidence: <strong style={{ color: C.navy }}>{issue.confidence}</strong>
                        </span>
                        <span style={{ fontSize: 11, color: C.gray2 }}>
                            Created: <strong style={{ color: C.navy }}>{new Date(issue.createdAt).toLocaleDateString()}</strong>
                        </span>

                        {/* Status selector */}
                        {onStatusChange && (
                            <select
                                value={issue.status || 'active'}
                                onChange={e => onStatusChange(e.target.value as any)}
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '4px 8px',
                                    borderRadius: 8,
                                    border: `1px solid ${C.gray3}`,
                                    background: currentStatus.bg,
                                    color: currentStatus.color,
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="monitoring">Monitoring</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

                    {/* Report Header */}
                    <div style={{
                        background: `linear-gradient(135deg, ${C.navy}08, ${C.mint}08)`,
                        border: `1px solid ${C.gray3}`,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <BarChart3 size={16} color={C.mint} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Issue Intelligence Report
                            </span>
                        </div>
                        <div style={{ fontSize: 11, color: C.gray1, lineHeight: 1.5 }}>
                            This report combines AI agent analysis, data evidence, and cross-area discussions to provide
                            a comprehensive view of the detected issue.
                        </div>
                    </div>

                    {/* Forecasts */}
                    <CollapsibleSection title="Forecast Analysis" icon={<TrendingUp size={16} />} defaultOpen>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {Object.entries(issue.forecast || {}).map(([period, prediction]) => (
                                <div key={period} style={{
                                    background: C.paper,
                                    padding: 12,
                                    borderRadius: 8,
                                    border: `1px solid ${C.gray3}`
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.gray2, marginBottom: 4, textTransform: 'uppercase' }}>
                                        {period} Outlook
                                    </div>
                                    <div style={{ fontSize: 12, color: C.navy, lineHeight: 1.4 }}>
                                        {prediction}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {/* Action Item */}
                    {issue.action_item && (
                        <CollapsibleSection title="Recommended Action" icon={<CheckCircle size={16} />} defaultOpen>
                            <div style={{
                                background: C.mintLight,
                                border: `1px solid ${C.mintMid}`,
                                borderRadius: 8,
                                padding: 12
                            }}>
                                <p style={{ fontSize: 13, color: C.navy, margin: 0 }}>{issue.action_item}</p>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Evidence Section - Combined Data Sources */}
                    <CollapsibleSection title="Evidence & Data Sources" icon={<Database size={16} />} defaultOpen>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Data References */}
                            {issue.data_refs && issue.data_refs.length > 0 && (
                                <div>
                                    <div style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: C.gray2,
                                        marginBottom: 8,
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}>
                                        <ExternalLink size={12} />
                                        Referenced Data Sources ({issue.data_refs.length})
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {issue.data_refs.map((ref, i) => (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                padding: '8px 12px',
                                                background: C.paper,
                                                borderRadius: 6,
                                                fontSize: 11,
                                                borderLeft: `3px solid ${C.mint}`
                                            }}>
                                                <span style={{ color: C.navy, fontFamily: 'monospace', flex: 1 }}>{ref}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Raw Data Evidence */}
                            {issue.rawData && Object.keys(issue.rawData).length > 0 && (
                                <div>
                                    <div style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: C.gray2,
                                        marginBottom: 8,
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}>
                                        <Eye size={12} />
                                        Raw Data Evidence
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {Object.entries(issue.rawData).map(([source, data]) => (
                                            <div key={source} style={{
                                                background: '#1a1a2e',
                                                borderRadius: 8,
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    background: '#252542',
                                                    padding: '8px 12px',
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: C.mint,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    {source}
                                                </div>
                                                <pre style={{
                                                    fontSize: 10,
                                                    fontFamily: 'monospace',
                                                    color: '#a0aec0',
                                                    margin: 0,
                                                    padding: 12,
                                                    maxHeight: 150,
                                                    overflow: 'auto',
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {JSON.stringify(data, null, 2).slice(0, 1500)}
                                                    {JSON.stringify(data, null, 2).length > 1500 && '\n... (truncated)'}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* Agent Analysis */}
                    {issue.agentAnalysis && Object.keys(issue.agentAnalysis).length > 0 && (
                        <CollapsibleSection title="Agent Analysis Reports" icon={<FileText size={16} />} defaultOpen>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {Object.entries(issue.agentAnalysis).map(([agent, analysis]) => {
                                    const agentColor = getAgentColor(agent);
                                    return (
                                        <div key={agent} style={{
                                            background: C.paper,
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                            border: `1px solid ${C.gray3}`
                                        }}>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: `${agentColor}10`,
                                                borderBottom: `1px solid ${C.gray3}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8
                                            }}>
                                                <Bot size={14} color={agentColor} />
                                                <span style={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    color: agentColor,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5
                                                }}>
                                                    {agent}
                                                </span>
                                            </div>
                                            <div style={{
                                                padding: 14,
                                                fontSize: 12,
                                                color: C.gray1,
                                                lineHeight: 1.6,
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {analysis}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Agent Conversation - Enhanced Chat View */}
                    {issue.agentConversation && issue.agentConversation.length > 0 && (
                        <CollapsibleSection title="Agent Discussion Log" icon={<MessageSquare size={16} />}>
                            <div style={{
                                background: '#0f0f1a',
                                borderRadius: 10,
                                padding: 16,
                                maxHeight: 400,
                                overflow: 'auto'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {issue.agentConversation.map((msg, i) => {
                                        const parsed = parseConversationMessage(msg);
                                        if (!parsed) {
                                            return (
                                                <div key={i} style={{
                                                    fontSize: 11,
                                                    fontFamily: 'monospace',
                                                    color: '#64748b',
                                                    padding: '4px 0'
                                                }}>
                                                    {msg}
                                                </div>
                                            );
                                        }

                                        const agentColor = getAgentColor(parsed.agent);
                                        const isSystem = parsed.agent.includes('Orchestrator') || parsed.agent.includes('System');

                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                                padding: '10px 12px',
                                                background: isSystem ? '#1a1a2e' : '#161625',
                                                borderRadius: 8,
                                                borderLeft: `3px solid ${agentColor}`
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Bot size={12} color={agentColor} />
                                                        <span style={{
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            color: agentColor
                                                        }}>
                                                            {parsed.agent}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Clock size={10} color="#64748b" />
                                                        <span style={{ fontSize: 9, color: '#64748b' }}>
                                                            {parsed.timestamp}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: 11,
                                                    color: '#e2e8f0',
                                                    lineHeight: 1.5,
                                                    marginTop: 4
                                                }}>
                                                    {parsed.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Key Insights Summary */}
                    <div style={{
                        marginTop: 16,
                        padding: 16,
                        background: `linear-gradient(135deg, ${C.mint}10, ${C.navy}05)`,
                        border: `1px solid ${C.mintMid}`,
                        borderRadius: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <Lightbulb size={16} color={C.mint} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Report Summary</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.gray1, lineHeight: 1.6 }}>
                            <strong>Issue:</strong> {issue.title}<br />
                            <strong>Severity:</strong> {issue.severity} | <strong>Confidence:</strong> {issue.confidence}<br />
                            <strong>Time Horizon:</strong> {issue.time_horizon}<br />
                            {issue.agentAnalysis && (
                                <>
                                    <strong>Agents Involved:</strong> {Object.keys(issue.agentAnalysis).length} ({Object.keys(issue.agentAnalysis).join(', ')})<br />
                                </>
                            )}
                            {issue.data_refs && (
                                <><strong>Data Sources:</strong> {issue.data_refs.length} references</>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
