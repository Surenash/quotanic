// Cost Breakdown Modal Component
import { useCurrency } from './utils/currency';

const CostBreakdownModal = ({ request, onClose }) => {
    // Parse the notes field to extract breakdown data
    const parseBreakdown = (notes) => {
        try {
            // Notes format: "Match Score: 70.0/100. Process: ManufacturingProcess.MILLING_3_AXIS. {json_data}"
            const jsonStart = notes.indexOf('{');
            if (jsonStart === -1) return null;

            const jsonStr = notes.substring(jsonStart);
            const data = JSON.parse(jsonStr.replace(/'/g, '"'));
            return data;
        } catch (e) {
            console.error('Failed to parse breakdown:', e);
            return null;
        }
    };

    const breakdown = parseBreakdown(request.notes);

    const { formatPrice } = useCurrency();

    return (
        <div style={{ ...styles.modalOverlay }}>
            <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
                <div style={styles.modalHeader}>
                    <h2 style={{ margin: 0, color: 'var(--neon-cyan)' }}>Cost Breakdown</h2>
                    <button onClick={onClose} style={styles.modalCloseButton}>✕</button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Part Info */}
                    <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(var(--neon-cyan-rgb), 0.05)', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '18px' }}>{request.designName}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Customer</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.customer}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Material</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.material}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Quantity</p>
                                <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{request.quantity} units</p>
                            </div>
                        </div>
                    </div>

                    {breakdown ? (
                        <>
                            {/* Summary */}
                            <div style={{ marginBottom: '24px', padding: '16px', background: 'linear-gradient(135deg, rgba(var(--neon-cyan-rgb), 0.1), rgba(var(--neon-cyan-rgb), 0.05))', borderRadius: '8px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Total Price</p>
                                        <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--neon-cyan)', margin: 0 }}>{formatPrice(breakdown.final_price)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Unit Price</p>
                                        <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{formatPrice(breakdown.unit_price)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#CBD5E1', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost Components</h4>
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {breakdown.material_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Material Cost</span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.material_cost_per_unit)}</span>
                                        </div>
                                    )}
                                    {breakdown.labor_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Labor Cost <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>({breakdown.labor_cost_per_unit.split('(')[1]?.replace(')', '')})</span></span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.labor_cost_per_unit.split(' ')[0].replace('$', ''))}</span>
                                        </div>
                                    )}
                                    {breakdown.applied_hourly_rate && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Machining Rate</span>
                                            <span style={{ fontWeight: '600' }}>{breakdown.applied_hourly_rate}</span>
                                        </div>
                                    )}
                                    {breakdown.finishing_cost_per_unit && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                            <span>Finishing <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{breakdown.finishing_details ? `(${breakdown.finishing_details.substring(0, 30)}...)` : ''}</span></span>
                                            <span style={{ fontWeight: '600' }}>{formatPrice(breakdown.finishing_cost_per_unit)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step-by-Step Process Flow */}
                            {breakdown.process_flow && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-cyan)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manufacturing Process Flow</h4>
                                    <div style={{ display: 'grid', gap: '4px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 80px 80px', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                            <span>#</span>
                                            <span>Operation</span>
                                            <span>Tooling</span>
                                            <span>Time</span>
                                            <span style={{ textAlign: 'right' }}>Cost</span>
                                        </div>
                                        {(() => {
                                            try {
                                                const flow = JSON.parse(breakdown.process_flow);
                                                return flow.map((step, idx) => (
                                                    <div key={idx} style={{ 
                                                        display: 'grid', 
                                                        gridTemplateColumns: '40px 1fr 1fr 80px 80px', 
                                                        padding: '10px 12px', 
                                                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                                        fontSize: '12px',
                                                        alignItems: 'center',
                                                        borderBottom: idx === flow.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{idx + 1}</span>
                                                        <span style={{ color: '#E2E8F0', fontWeight: '500' }}>{step.step}</span>
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{step.tool}</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{step.time}</span>
                                                        <span style={{ color: 'var(--neon-cyan)', fontWeight: '600', textAlign: 'right' }}>{step.cost}</span>
                                                    </div>
                                                ));
                                            } catch (e) {
                                                return <div style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>{breakdown.feature_costs}</div>;
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Process Info */}
                            {breakdown.ai_process_selected && (
                                <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(var(--neon-cyan-rgb), 0.05)', borderRadius: '6px', border: '1px solid rgba(var(--neon-cyan-rgb), 0.1)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Manufacturing Process</p>
                                    <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--neon-cyan)' }}>{breakdown.machine_selected || breakdown.ai_process_selected}</p>
                                    {breakdown.ai_reasoning && (
                                        <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>{breakdown.ai_reasoning}</p>
                                    )}
                                </div>
                            )}

                            {/* Summary Breakdown */}
                            {breakdown.breakdown && (
                                <div style={{ padding: '12px', background: 'var(--bg-panel)', borderRadius: '6px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>Summary</p>
                                    <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#CBD5E1', margin: 0, lineHeight: '1.6' }}>{breakdown.breakdown}</p>
                                </div>
                            )}

                            {/* Terms */}
                            {(breakdown.terms_validity || breakdown.terms_payment) && (
                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(var(--text-secondary), 0.05)', borderRadius: '6px' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Terms & Conditions</p>
                                    <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                                        {breakdown.terms_validity && <span>Valid for: <strong>{breakdown.terms_validity}</strong></span>}
                                        {breakdown.terms_payment && <span>Payment: <strong>{breakdown.terms_payment}</strong></span>}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <p>Detailed cost breakdown not available for this quote.</p>
                            <p style={{ fontSize: '14px', marginTop: '8px' }}>Total Price: <strong style={{ color: 'var(--neon-cyan)', fontSize: '20px' }}>{formatPrice(request.price)}</strong></p>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <CtaButton text="Close" onClick={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};

