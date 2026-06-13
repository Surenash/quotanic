export type FeatureFeature = {
    id: string;
    name: string;
    type: 'hole' | 'pocket' | 'thread' | 'chamfer' | 'face' | 'external';
    toolType: string;
    toolDiameter: number;
    depth: number;
    time: string;
    costContribution: string;
    isWarning?: boolean;
    warningMessage?: string;
};

export type SetupStage = {
    id: string;
    name: string;
    cutVolume: string;
    features: FeatureFeature[];
};

export type SmartViewDesignData = {
    designId: string;
    designName: string;
    material: string;
    dimensions: string;
    volume: string;
    weight: string;
    totalTime: string;
    totalCost: string;
    setups: SetupStage[];
    warnings: { featureId: string; message: string; severity: 'high' | 'medium' | 'low' }[];
};

export const sampleSmartViewData: SmartViewDesignData = {
    designId: 'D-101',
    designName: 'Main Housing V2',
    material: 'Aluminum 6061-T6',
    dimensions: '150.0 x 100.0 x 40.0 mm',
    volume: '23,450 cu mm',
    weight: '0.62 kg',
    totalTime: '45.2 mins',
    totalCost: '$124.50',
    setups: [
        {
            id: 'setup-1',
            name: 'Setup 1 - Top Face',
            cutVolume: '10,200 cu mm',
            features: [
                {
                    id: 'feat-face-1',
                    name: 'Face Milling',
                    type: 'face',
                    toolType: 'Face Mill',
                    toolDiameter: 50,
                    depth: 2,
                    time: '2.5 mins',
                    costContribution: '$5.00'
                },
                {
                    id: 'feat-pocket-1',
                    name: 'Main Cavity Pocket',
                    type: 'pocket',
                    toolType: 'End Mill',
                    toolDiameter: 12,
                    depth: 25,
                    time: '15.0 mins',
                    costContribution: '$35.00',
                    isWarning: true,
                    warningMessage: 'Deep cut radiused. Depth to Tool Diameter ratio > 2.0'
                },
                {
                    id: 'feat-hole-1',
                    name: 'M6 Threaded Hole (x4)',
                    type: 'thread',
                    toolType: 'Tap',
                    toolDiameter: 6,
                    depth: 15,
                    time: '4.2 mins',
                    costContribution: '$8.50'
                }
            ]
        },
        {
            id: 'setup-2',
            name: 'Setup 2 - Bottom Intersect',
            cutVolume: '8,400 cu mm',
            features: [
                {
                    id: 'feat-hole-2',
                    name: 'Locating Pin Hole (x2)',
                    type: 'hole',
                    toolType: 'Drill',
                    toolDiameter: 8,
                    depth: 10,
                    time: '1.5 mins',
                    costContribution: '$3.00'
                },
                {
                    id: 'feat-chamfer-1',
                    name: 'Edge Chamfers',
                    type: 'chamfer',
                    toolType: 'Chamfer Mill',
                    toolDiameter: 10,
                    depth: 1,
                    time: '3.0 mins',
                    costContribution: '$6.50'
                }
            ]
        }
    ],
    warnings: [
        {
            featureId: 'feat-pocket-1',
            message: 'Deep cut radiused. Depth to Tool Diameter ratio > 2.0 (High chatter risk)',
            severity: 'medium'
        }
    ]
};
