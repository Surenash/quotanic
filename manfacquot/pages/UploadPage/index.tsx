import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFileViewer } from '../../contexts/FileViewerContext';
import { api, setTokens, getTokens, clearTokens } from '../../utils/api';
import { useCurrency } from '../../utils/currency';
import { styles, bg_deep_space, text_primary, text_secondary, border_color, border_color_strong, neon_cyan, neon_magenta, neon_orange } from '../../types/theme';
import CtaButton from '../../components/CtaButton';
import Notification from '../../components/Notification';
import CheckboxGroup from '../../components/CheckboxGroup';
import ManufacturerSettingsPage from '../../components/ManufacturerSettings';
import Viewer, { ErrorBoundary } from '../../components/Viewer';
import { ViewPreset } from '../../types/types';
import {
    ArrowLeftIcon, UploadIcon, QuoteIcon, ManufactureIcon, FileIcon, ShieldCheckIcon,
    GlobeAltIcon, ScaleIcon, LightningBoltIcon, SparklesIcon, CodeBracketIcon,
    WrenchScrewdriverIcon, CubeIcon, GithubIcon, LinkedInIcon, TwitterIcon,
    SearchIcon, LocationMarkerIcon, StarIcon, BuildingOfficeIcon, XMarkIcon,
    ChartPieIcon, UserCircleIcon, CogIcon, ArchiveBoxIcon, DocumentTextIcon,
    VideoCameraIcon, DownloadIcon, EyeIcon, iconStyle
} from "../../components/icons";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '') + '/api';
const MEDIA_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

import {
    PRODUCTION_VOLUMES, CERTIFICATIONS, MACHINING_PROCESSES, SHEET_METAL_PROCESSES, CASTING_PROCESSES, FORGING_PROCESSES,
    INJECTION_MOLDING_PROCESSES, ADDITIVE_PROCESSES, WELDING_JOINING_PROCESSES, MATERIALS_METALS, MATERIALS_PLASTICS,
    MATERIALS_COMPOSITES, MATERIALS_OTHERS, SURFACE_FINISHES, POST_PROCESSING_ASSEMBLY, FILE_FORMATS, INCOTERMS,
    SPECIAL_CAPABILITIES, ORDER_STATUSES, ALL_CAPABILITIES_GROUPS, ALL_CAPABILITIES_FLAT
} from '../../utils/constants';

import * as Components from '../../components';

export const UploadPage = ({ isInternal = false }: { isInternal?: boolean }) => {
    const { isAuthenticated, user, setLoginReasonMessage, setPendingUploadData } = useAuth();
    const navigate = useNavigate();
    const targetManufacturerId = new URLSearchParams(useLocation().search).get("manufacturer");
    const [formData, setFormData] = useState({
        designName: '',
        material: '',
        quantity: '',
        manufacturingProcess: '',
        surfaceFinish: 'None',
        tolerances: '',
        postProcessing: [],
        additionalInstructions: '',
        requiredCertifications: '',
        shippingDestination: '',
        targetPrice: '',
        urgency: 'standard',
        packaging: 'standard',
        inspectionRequirements: [] as string[],
        requiresEngineeringReview: false,
    });
    const [file, setFile] = useState<File | null>(null);
    const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supportingFilesInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePostProcessingChange = (option: string) => {
        setFormData(prev => {
            const { postProcessing } = prev;
            const newPostProcessing = postProcessing.includes(option)
                ? postProcessing.filter(item => item !== option)
                : [...postProcessing, option];
            return { ...prev, postProcessing: newPostProcessing };
        });
    };

    const handleInspectionChange = (option: string) => {
        setFormData(prev => {
            const { inspectionRequirements } = prev;
            const newReqs = inspectionRequirements.includes(option)
                ? inspectionRequirements.filter(item => item !== option)
                : [...inspectionRequirements, option];
            return { ...prev, inspectionRequirements: newReqs };
        });
    };

    const handleDragOver = (e: React.DragEvent) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(true); 
    };

    const handleDragLeave = (e: React.DragEvent) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(false); 
    };

    const handleDrop = (e: React.DragEvent) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragging(false); 
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { 
            setFile(e.dataTransfer.files[0]); 
            setError(''); 
            e.dataTransfer.clearData(); 
        } 
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
        if (e.target.files && e.target.files.length > 0) { 
            setFile(e.target.files[0]); 
            setError(''); 
        } 
    };

    const handleSupportingFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSupportingFiles(prev => [...prev, ...Array.from(e.target.files)]);
            if (e.target) e.target.value = null; // Allow selecting the same file again
        }
    };

    const removeSupportingFile = (indexToRemove: number) => {
        setSupportingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleDirectUpload = async () => {
        setLoading(true);
        try {
            // 1. Upload Primary CAD File
            const uploadUrlResponse = await api.getUploadUrl(file.name, file.type);
            const { upload_url, s3_file_key, use_local } = uploadUrlResponse;

            if (use_local) {
                // Local storage fallback for dev
                const reader = new FileReader();
                const fileData = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Prepare supporting files for local storage
                const supportingFilesData = await Promise.all(supportingFiles.map(async (f) => {
                    const r = new FileReader();
                    const d = await new Promise((res, rej) => {
                        r.onload = () => res(r.result);
                        r.onerror = rej;
                        r.readAsDataURL(f);
                    });
                    return { name: f.name, data: d, type: f.type };
                }));

                const designData = {
                    design_name: formData.designName,
                    s3_file_key,
                    file_data: fileData,
                    file_name: file.name,
                    material: formData.material,
                    quantity: parseInt(formData.quantity) || 1,
                    manufacturing_process: formData.manufacturingProcess,
                    surface_finish: formData.surfaceFinish,
                    tolerances: formData.tolerances,
                    post_processing: formData.postProcessing,
                    additional_instructions: formData.additionalInstructions,
                    required_certifications: formData.requiredCertifications,
                    shipping_destination: formData.shippingDestination,
                    target_price: formData.targetPrice,
                    urgency: formData.urgency,
                    packaging: formData.packaging,
                    inspection_requirements: formData.inspectionRequirements,
                    requires_engineering_review: formData.requiresEngineeringReview,
                    is_internal: isInternal,
                    use_local_storage: true,
                    supporting_files_data: supportingFilesData
                };

                await api.createDesign(designData);
                navigate('/dashboard');
                return;
            }

            // --- S3 PRODUCTION FLOW ---
            
            // Upload primary file
            await api.uploadFileToS3(upload_url, file);

            // Upload supporting files
            const supportingS3Keys = [];
            for (const sFile of supportingFiles) {
                const sUrlResp = await api.getUploadUrl(sFile.name, sFile.type);
                await api.uploadFileToS3(sUrlResp.upload_url, sFile);
                supportingS3Keys.push(sUrlResp.s3_file_key);
            }

            const designData = {
                design_name: formData.designName,
                s3_file_key,
                supporting_files: supportingS3Keys, // Pass keys to backend
                material: formData.material,
                quantity: parseInt(formData.quantity) || 1,
                manufacturing_process: formData.manufacturingProcess,
                surface_finish: formData.surfaceFinish,
                tolerances: formData.tolerances,
                post_processing: formData.postProcessing,
                additional_instructions: formData.quantity.includes('-') 
                    ? `[Qty: ${formData.quantity}] ${formData.additionalInstructions}`
                    : formData.additionalInstructions,
                required_certifications: formData.requiredCertifications,
                shipping_destination: formData.shippingDestination,
                target_price: formData.targetPrice,
                urgency: formData.urgency,
                packaging_requirements: formData.packaging,
                inspection_requirements: formData.inspectionRequirements,
                requires_engineering_review: formData.requiresEngineeringReview,
                is_internal: isInternal
            };

            const newDesign = await api.createDesign(designData);
            
            if (targetManufacturerId) {
                try {
                    await api.generateQuotes(newDesign.id, targetManufacturerId);
                } catch (quoteErr) {
                    console.error("Quote generation failed:", quoteErr);
                }
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Upload failed. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!file) {
            setError('Please select a primary CAD file to upload.');
            return;
        }
        if (!formData.designName || !formData.manufacturingProcess || !formData.material || !formData.quantity) {
            setError('Please fill all required fields (*).');
            return;
        }
        setLoading(true);

        // If user is already authenticated, upload directly
        if (isAuthenticated && user) {
            await handleDirectUpload();
        } else {
            // Otherwise, proceed to login flow
            setLoginReasonMessage({ file, supportingFiles, ...formData });
        }
    };

    const dropzoneStyle: React.CSSProperties = { 
        ...styles.uploadDropzone, 
        ...(isDragging ? styles.uploadDropzoneActive : {}),
        position: 'relative', // Ensure overlay is positioned correctly
    };

    const inputOverlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
        zIndex: 10,
    };

    return (
        <div style={styles.uploadPageContainer}>
            <div style={styles.dashboardHeader}>
                <h1 style={styles.dashboardTitle}>
                    {isInternal ? "Internal Design Analysis" : "Get an Instant Quote"}
                </h1>
            </div>
            <p style={{ ...styles.loginSubtitle, textAlign: 'left', marginTop: '-16px', marginBottom: '32px' }}>
                {isInternal 
                    ? "Upload a design to generate an internal quotation and FBM analysis." 
                    : "Step 1 of 2: Specify design details and upload your CAD file."}
            </p>

            <form onSubmit={handleSubmit}>
                {error && <p style={styles.loginError}>{error}</p>}
                
                <div style={styles.uploadLayout}>
                    <div style={styles.uploadDropzoneWrapper}>
                        <label style={styles.label}>Primary CAD File (.stl, .step, .iges, .igs, .stp) *</label>
                        
                        <div 
                            style={{ ...dropzoneStyle, cursor: !file ? 'pointer' : 'default' }} 
                            onDragEnter={e => e.stopPropagation()} 
                            onDragOver={handleDragOver} 
                            onDragLeave={handleDragLeave} 
                            onDrop={handleDrop} 
                        >
                            {!file ? (
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}
                                        accept=".stl,.step,.iges,.igs,.stp" 
                                    />
                                    <UploadIcon style={{ ...iconStyle, width: '64px', height: '64px', color: 'var(--text-secondary)' }} />
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Drag & drop file here</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>or click to browse</p>
                                </label>
                            ) : (
                                <div style={styles.uploadFileInfo}>
                                    <FileIcon />
                                    <p style={styles.uploadFileName}>{file.name}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                    <CtaButton 
                                        text="Clear" 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }} 
                                        type="button" 
                                        className="button-small"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.uploadFormFields}>
                        <div style={styles.formGroup}>
                            <label htmlFor="designName" style={styles.label}>Design Name *</label>
                            <input 
                                type="text" 
                                id="designName" 
                                name="designName" 
                                value={formData.designName} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                required 
                                placeholder="e.g., Main Housing Unit" 
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="quantity" style={styles.label}>Quantity *</label>
                            <input 
                                type="text" 
                                id="quantity" 
                                name="quantity" 
                                value={formData.quantity} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                required 
                                list="quantity-options" 
                                placeholder="e.g., 25 or select a range" 
                            />
                            <datalist id="quantity-options">
                                <option value="1-10 (Prototypes)" />
                                <option value="11-50 (Small Batch)" />
                                <option value="51-250 (Low Volume)" />
                                <option value="251-1000 (Medium Volume)" />
                                <option value="1000+ (High Volume)" />
                            </datalist>
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="manufacturingProcess" style={styles.label}>Manufacturing Process *</label>
                            <select 
                                id="manufacturingProcess" 
                                name="manufacturingProcess" 
                                value={formData.manufacturingProcess} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                required
                            >
                                <option value="">Select a process...</option>
                                {ALL_CAPABILITIES_GROUPS.map(group => (
                                    <optgroup label={group.title} key={group.title}>
                                        {group.processes.map(process => (
                                            <option key={process} value={process}>{process}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="material" style={styles.label}>Material *</label>
                            <select 
                                id="material" 
                                name="material" 
                                value={formData.material} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                required
                            >
                                <option value="">Select a material...</option>
                                <optgroup label="Plastics">{MATERIALS_PLASTICS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>
                                <optgroup label="Metals">{MATERIALS_METALS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>
                                <optgroup label="Composites">{MATERIALS_COMPOSITES.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>
                                <optgroup label="Other">{MATERIALS_OTHERS.map(m => <option key={m} value={m}>{m}</option>)}</optgroup>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="surfaceFinish" style={styles.label}>Surface Finish</label>
                            <select 
                                id="surfaceFinish" 
                                name="surfaceFinish" 
                                value={formData.surfaceFinish} 
                                onChange={handleInputChange} 
                                style={styles.input}
                            >
                                <option value="None">None</option>
                                {SURFACE_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="tolerances" style={styles.label}>Tolerances (if any)</label>
                            <input 
                                type="text" 
                                id="tolerances" 
                                name="tolerances" 
                                value={formData.tolerances} 
                                onChange={handleInputChange} 
                                style={styles.input} 
                                placeholder="e.g., ±0.05mm" 
                            />
                        </div>

                        <fieldset style={{ ...styles.fieldset, marginTop: '24px', padding: '24px', backgroundColor: 'transparent', border: `1px solid var(--border-color)` }}>
                            <legend style={{ ...styles.legend, padding: '0 8px' }}>Supporting Information (Optional)</legend>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Supporting Documents & Models</label>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '-4px 0 8px 0' }}>
                                    Add technical drawings (PDF, DXF), secondary models, or other relevant files.
                                </p>
                                
                                <input 
                                    type="file" 
                                    id="supporting-files-input"
                                    multiple 
                                    ref={supportingFilesInputRef} 
                                    onChange={handleSupportingFilesChange} 
                                    style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }} 
                                    accept=".pdf,.dxf,.step,.stp,.iges,.igs,.zip,.rar,.sldprt,.dwg" 
                                    onClick={(e) => e.stopPropagation()}
                                />

                                <div 
                                    style={{ ...styles.button, ...styles.buttonSecondary, cursor: 'pointer', display: 'inline-block' }} 
                                    className="hover-lift"
                                    onClick={() => supportingFilesInputRef.current?.click()}
                                >
                                    Add Files
                                </div>

                                {supportingFiles.length > 0 && (
                                    <div style={styles.supportingFileList}>
                                        {supportingFiles.map((f, index) => {
                                            const ext = f.name.split('.').pop()?.toLowerCase();
                                            let Icon = DocumentTextIcon;
                                            if (ext === 'pdf') Icon = DocumentTextIcon;
                                            else if (ext === 'dwg' || ext === 'dxf') Icon = CubeIcon;
                                            else if (['step', 'stp', 'iges', 'igs', 'stl'].includes(ext || '')) Icon = CubeIcon;
                                            
                                            return (
                                                <div key={`${f.name}-${index}`} style={styles.supportingFileItem}>
                                                    <Icon style={{ width: '20px', height: '20px', color: ext === 'pdf' ? '#ef4444' : '#3b82f6', flexShrink: 0, marginRight: '8px' }} />
                                                    <span style={styles.supportingFileName} title={f.name}>{f.name}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeSupportingFile(index)} 
                                                        style={styles.supportingFileRemoveBtn} 
                                                        aria-label={`Remove ${f.name}`}
                                                    >
                                                        <XMarkIcon style={{ width: '16px', height: '16px' }} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="urgency" style={styles.label}>Urgency</label>
                                <select id="urgency" name="urgency" value={formData.urgency} onChange={handleInputChange} style={styles.input}>
                                    <option value="standard">Standard Lead Time</option>
                                    <option value="urgent">Urgent (Premium)</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="packaging" style={styles.label}>Packaging</label>
                                <select id="packaging" name="packaging" value={formData.packaging} onChange={handleInputChange} style={styles.input}>
                                    <option value="standard">Standard Packaging</option>
                                    <option value="custom">Custom / Branded</option>
                                    <option value="export">Export Crate (Fumigated)</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Quality Control & Inspection</label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {['Standard Inspection', 'CMM Report', 'Material Certificate', 'Hardness Test'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleInspectionChange(opt)}
                                            style={{
                                                ...styles.chip,
                                                backgroundColor: formData.inspectionRequirements.includes(opt) ? styles.chipActive.backgroundColor : styles.chip.backgroundColor,
                                                color: formData.inspectionRequirements.includes(opt) ? styles.chipActive.color : styles.chip.color,
                                                border: formData.inspectionRequirements.includes(opt) ? styles.chipActive.border : styles.chip.border
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ ...styles.formGroup, marginTop: '16px' }}>
                                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.requiresEngineeringReview}
                                        onChange={(e) => setFormData(prev => ({ ...prev, requiresEngineeringReview: e.target.checked }))}
                                        style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    Requires Engineering Review
                                </label>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 26px' }}>
                                    Check if design has complex geometries, tight tolerances (&lt;±0.05mm), or critical applications
                                </p>
                            </div>

                            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                                <label htmlFor="additionalInstructions" style={styles.label}>Additional Instructions</label>
                                <textarea id="additionalInstructions" name="additionalInstructions" value={formData.additionalInstructions} onChange={handleInputChange} style={{ ...styles.input, height: '100px', resize: 'vertical' }} placeholder="Any specific requirements..." />
                            </div>
                            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                                <label htmlFor="requiredCertifications" style={styles.label}>Required Certifications</label>
                                <input type="text" id="requiredCertifications" name="requiredCertifications" value={formData.requiredCertifications} onChange={handleInputChange} style={styles.input} placeholder="e.g., ISO 9001, Material Certs" />
                            </div>
                            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                                <label htmlFor="shippingDestination" style={styles.label}>Shipping Destination</label>
                                <input type="text" id="shippingDestination" name="shippingDestination" value={formData.shippingDestination} onChange={handleInputChange} style={styles.input} placeholder="e.g., Austin, TX, USA" />
                            </div>
                            <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                                <label htmlFor="targetPrice" style={styles.label}>Target Price per Part</label>
                                <input type="text" id="targetPrice" name="targetPrice" value={formData.targetPrice} onChange={handleInputChange} style={styles.input} placeholder="e.g., $15.50 (optional)" />
                            </div>
                        </fieldset>

                        <div style={{ marginTop: '32px' }}>
                            <CtaButton
                                text={loading ? "Processing..." : (isAuthenticated ? (isInternal ? "Run Internal Analysis" : (targetManufacturerId ? "Request Quote" : "Upload Design")) : "Proceed to Login")}
                                primary
                                type="submit"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
