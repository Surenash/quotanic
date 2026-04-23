import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero, HowItWorks, ValueProposition, ForWhom, SocialProof } from '../../components';

export const LandingPageContent = () => {
    const navigate = useNavigate();
    return (
        <div>
            <Hero />
            <ValueProposition />
            <HowItWorks />
            <ForWhom />
            <SocialProof />
        </div>
    );
};
