import React from 'react';
import {
    ArrowLeft as LucideArrowLeft,
    Upload as LucideUpload,
    FileText as LucideFileText,
    Settings as LucideSettings,
    File as LucideFile,
    ShieldCheck as LucideShieldCheck,
    Globe as LucideGlobe,
    Scale as LucideScale,
    Zap as LucideZap,
    Code2 as LucideCode2,
    Wrench as LucideWrench,
    Twitter as LucideTwitter,
    Github as LucideGithub,
    Linkedin as LucideLinkedin,
    Search as LucideSearch,
    MapPin as LucideMapPin,
    Star as LucideStar,
    Download as LucideDownload,
    Eye as LucideEye,
    Building as LucideBuilding,
    X as LucideX,
    UserCircle2 as LucideUserCircle,
    Box as LucideBox,
    Archive as LucideArchive,
    Video as LucideVideo,
    DollarSign as LucideDollarSign,
    Cog as LucideCog,
    Nut as LucideNut,
    Drill as LucideDrill,
    CircleDot as LucideCircleDot,
    Cylinder as LucideCylinder,
    Factory as LucideFactory,
    PieChart as LucidePieChart,
    Sparkles as LucideSparkles,
    TrendingUp as LucideTrendingUp,
    AlertTriangle as LucideAlertTriangle
} from 'lucide-react';

// Wrapper components maintain backward compatibility with existing code

// Icon wrapper components - map old names to Lucide icons
export const ArrowLeftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideArrowLeft style={{ width: '24px', height: '24px', ...style }} />
);

export const UploadIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideUpload style={{ width: '48px', height: '48px', ...style }} />
);

export const QuoteIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideFileText style={{ width: '48px', height: '48px', ...style }} />
);

export const ManufactureIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSettings style={{ width: '48px', height: '48px', ...style }} />
);

export const FileIcon = () => (
    <LucideFile style={{ width: '48px', height: '48px' }} />
);

export const ShieldCheckIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideShieldCheck style={{ width: '48px', height: '48px', ...style }} />
);

export const GlobeAltIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideGlobe style={{ width: '48px', height: '48px', ...style }} />
);

export const ScaleIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideScale style={{ width: '48px', height: '48px', ...style }} />
);

export const LightningBoltIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideZap style={{ width: '48px', height: '48px', ...style }} />
);

export const ZapIcon = LightningBoltIcon;

export const SparklesIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSparkles style={{ width: '48px', height: '48px', ...style }} />
);

export const CodeBracketIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCode2 style={{ width: '32px', height: '32px', ...style }} />
);

export const WrenchScrewdriverIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideWrench style={{ width: '32px', height: '32px', ...style }} />
);

export const CubeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideBox style={{ width: '24px', height: '24px', ...style }} />
);

export const GithubIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideGithub style={{ width: '24px', height: '24px', ...style }} />
);

export const LinkedInIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideLinkedin style={{ width: '24px', height: '24px', ...style }} />
);

export const TwitterIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideTwitter style={{ width: '24px', height: '24px', ...style }} />
);

export const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideSearch style={style} />
);

export const LocationMarkerIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideMapPin style={style} />
);

export const StarIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideStar style={style} fill="currentColor" />
);

export const BuildingOfficeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideBuilding style={style} />
);

export const XMarkIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideX style={style} />
);

export const ChartPieIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucidePieChart style={style} />
);

export const UserCircleIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideUserCircle style={style} />
);

export const CogIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCog style={style} />
);

export const ArchiveBoxIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideArchive style={style} />
);

export const DocumentTextIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideFileText style={style} />
);

export const VideoCameraIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideVideo style={style} />
);

export const DownloadIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideDownload style={style} />
);

export const EyeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideEye style={style} />
);

export const TrendingUpIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideTrendingUp style={style} />
);

export const AlertTriangleIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideAlertTriangle style={style} />
);

export const NutIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideNut style={style} />
);

export const DrillIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideDrill style={style} />
);

export const CircleDotIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCircleDot style={style} />
);

export const CylinderIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCylinder style={style} />
);

export const CogWheelIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideCog style={style} />
);

export const DollarSignIcon = ({ style }: { style?: React.CSSProperties }) => (
    <LucideDollarSign style={style} />
);

// Default icon style for components that use iconStyle
export const iconStyle = { width: '48px', height: '48px', color: 'currentColor', marginBottom: '16px' };
