import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Database, 
  RefreshCw, 
  Info, 
  Layers, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import { 
  parseCSVText, 
  validateGeolocatedBlackspotsDataset, 
  getSampleBlackspotsCSV, 
  getSampleMorthCSV 
} from '../services/dataValidator';
import { useJourney } from '../context/JourneyContext';
import { MORTH_METADATA } from '../services/morthDataService';
import { BLACKSPOT_DATASET_METADATA } from '../services/blackspotDataService';

export function DatasetImportModal({ isOpen, onClose }) {
  const { 
    importBlackspotsData, 
    resetDatasetsToOfficial, 
    hotspots, 
    datasetSourceInfo 
  } = useJourney();

  const [activeTab, setActiveTab] = useState('blackspots'); // 'blackspots' | 'morth_state' | 'metadata'
  const [csvTextInput, setCsvTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setValidationResult(null);
    setSuccessMessage(null);

    try {
      const text = await file.text();
      setCsvTextInput(text);
      const parsed = await parseCSVText(text);

      if (activeTab === 'blackspots') {
        const validated = validateGeolocatedBlackspotsDataset(parsed.data);
        setValidationResult(validated);
      } else {
        // State CSV
        const validated = validateGeolocatedBlackspotsDataset(parsed.data);
        setValidationResult(validated);
      }
    } catch (err) {
      setValidationResult({
        success: false,
        errors: [`Failed to read file: ${err.message}`],
        warnings: [],
        validRecords: [],
        summary: null,
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleValidateText = async () => {
    if (!csvTextInput.trim()) {
      setValidationResult({
        success: false,
        errors: ['Please paste CSV text or select a file to import.'],
        warnings: [],
        validRecords: [],
        summary: null,
      });
      return;
    }

    setIsProcessing(true);
    setValidationResult(null);
    setSuccessMessage(null);

    try {
      const parsed = await parseCSVText(csvTextInput);
      const validated = validateGeolocatedBlackspotsDataset(parsed.data);
      setValidationResult(validated);
    } catch (err) {
      setValidationResult({
        success: false,
        errors: [`CSV Parse Error: ${err.message}`],
        warnings: [],
        validRecords: [],
        summary: null,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToApplication = () => {
    if (!validationResult || !validationResult.validRecords || validationResult.validRecords.length === 0) {
      return;
    }

    const count = validationResult.validRecords.length;
    importBlackspotsData(validationResult.validRecords, {
      sourceName: 'User Imported & Validated Dataset',
      importedAt: new Date().toISOString(),
      recordCount: count,
      geographicCoverage: validationResult.summary?.geographicCoverage || 'Multistate',
    });

    setSuccessMessage(`Successfully applied ${count} verified records into SafeRoad AI dashboard!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1400);
  };

  const downloadSampleTemplate = (type) => {
    const content = type === 'blackspots' ? getSampleBlackspotsCSV() : getSampleMorthCSV();
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saferoad_${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreOfficial = () => {
    resetDatasetsToOfficial();
    setSuccessMessage('Restored official MoRTH & NHAI benchmark datasets successfully!');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-charcoal-900 border border-charcoal-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-750 bg-charcoal-950/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Dataset Management &amp; Validation Hub
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  PHASE 1 &amp; 2 INTEGRATED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official MoRTH statistics &amp; geolocated National Highway blackspot validation pipeline
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-charcoal-750 bg-charcoal-950/40 text-xs">
          <button
            onClick={() => { setActiveTab('blackspots'); setValidationResult(null); }}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'blackspots'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Geolocated Blackspots CSV</span>
          </button>

          <button
            onClick={() => { setActiveTab('metadata'); setValidationResult(null); }}
            className={`pb-3 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'metadata'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Dataset Provenance &amp; Coverage</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-300">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <strong className="font-semibold">{successMessage}</strong>
            </div>
          )}

          {activeTab === 'blackspots' && (
            <div className="space-y-4">
              
              {/* Upload Drag & Drop Area */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-charcoal-950 border border-dashed border-charcoal-700">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-white font-semibold text-xs">
                    <FileSpreadsheet className="w-4 h-4 text-brand-orange" />
                    <span>Upload CSV File or Paste Data</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports columns: <code className="text-slate-300">lat, lng, name, accidents, fatalities, state, district, highway</code>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs text-white font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-brand-orange" />
                    <span>Choose CSV File</span>
                  </button>

                  <button
                    onClick={() => downloadSampleTemplate('blackspots')}
                    className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs text-slate-300 font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Direct CSV Input (or paste custom records):</span>
                  <button
                    onClick={() => setCsvTextInput(getSampleBlackspotsCSV())}
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    Insert Sample Format
                  </button>
                </div>
                <textarea
                  value={csvTextInput}
                  onChange={(e) => setCsvTextInput(e.target.value)}
                  placeholder="id,name,state,district,highway,road_type,lat,lng,accidents,fatalities,grievous_injuries,primary_cause..."
                  rows={4}
                  className="w-full bg-charcoal-950 border border-charcoal-750 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-orange/50 transition-colors"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleValidateText}
                    disabled={isProcessing || !csvTextInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-light text-white font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Validating...' : 'Validate Dataset'}
                  </button>
                </div>
              </div>

              {/* Validation Summary Card */}
              {validationResult && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-750 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {validationResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <h4 className="font-bold text-white text-xs">
                          {validationResult.success ? 'Dataset Validation Passed' : 'Validation Failed / Errors Found'}
                        </h4>
                      </div>

                      {validationResult.summary && (
                        <span className="text-xs font-mono text-cyan-400 font-bold">
                          {validationResult.summary.validRecordsCount} Valid Records
                        </span>
                      )}
                    </div>

                    {/* Summary Metrics */}
                    {validationResult.summary && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-charcoal-800 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Processed Rows:</span>
                          <strong className="text-white font-mono">{validationResult.summary.totalRowsProcessed}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Valid Blackspots:</span>
                          <strong className="text-emerald-400 font-mono">{validationResult.summary.validRecordsCount}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Rejected Rows:</span>
                          <strong className={validationResult.summary.rejectedRowsCount > 0 ? 'text-red-400 font-mono' : 'text-slate-400 font-mono'}>
                            {validationResult.summary.rejectedRowsCount}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Geographic Extent:</span>
                          <strong className="text-cyan-300 truncate block text-[11px]">{validationResult.summary.geographicCoverage}</strong>
                        </div>
                      </div>
                    )}

                    {/* Errors List */}
                    {validationResult.errors.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-1">
                        <strong className="block text-red-200">Validation Errors:</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {validationResult.errors.slice(0, 6).map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                          {validationResult.errors.length > 6 && (
                            <li>...and {validationResult.errors.length - 6} additional row errors</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Warnings List */}
                    {validationResult.warnings.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                        <strong className="block text-amber-300">Validation Warnings:</strong>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {validationResult.warnings.slice(0, 4).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Apply Button */}
                    {validationResult.success && validationResult.validRecords.length > 0 && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleApplyToApplication}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Import &amp; Apply {validationResult.validRecords.length} Records</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-750 space-y-3 text-xs leading-relaxed">
                <div className="flex items-center space-x-2 text-white font-bold text-sm">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Official Dataset Provenance &amp; Scientific Integrity</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <p>
                    <strong>Phase 1 Macro Dataset:</strong> Sourced from official annual statistical publications of the 
                    <em> Transport Research Wing (TRW), Ministry of Road Transport and Highways (MoRTH), Government of India</em>. 
                    Includes all 36 Indian States and Union Territories covering reporting periods 2018–2022.
                  </p>
                  <p>
                    <strong>Phase 2 Geolocated Micro Dataset:</strong> Governed by the 
                    <em> MoRTH &amp; NHAI Protocol for Identification of Black Spots on National Highways</em>. 
                    A blackspot is strictly defined as a 500-meter National Highway stretch with &ge; 5 accidents or &ge; 10 fatalities over 3 consecutive calendar years.
                  </p>
                  <p>
                    <strong>Non-Double-Counting Architecture:</strong> In accordance with scientific road safety standards, 
                    state-level macro totals are <em>never</em> arithmetically added to point-level blackspot records. Macro statistics power state rankings and national summaries, whereas geolocated records power spatial risk buffers, clustering, and route intersections.
                  </p>
                </div>

                <div className="pt-3 border-t border-charcoal-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">MoRTH Source URL:</span>
                    <a href={MORTH_METADATA.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                      <span>{MORTH_METADATA.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Open Government Data Portal:</span>
                    <a href={MORTH_METADATA.openDataUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                      <span>{MORTH_METADATA.openDataUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Survey Protocol Standard:</span>
                    <span className="text-slate-200">{BLACKSPOT_DATASET_METADATA.surveyStandard}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">License Model:</span>
                    <span className="text-slate-200 font-mono">{MORTH_METADATA.license}</span>
                  </div>
                </div>
              </div>

              {/* Data Limitations Disclosure */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Documented Limitations &amp; Coverage Boundaries:</span>
                </div>
                <p className="leading-relaxed text-[11.5px]">
                  Individual GPS-level incident coordinates in India are currently restricted to notified National Highway blackspots, expressways, and municipal police audit registries. Locations without plotted blackspots indicate an absence of notified highway blackspot records in the published registry, <em>not</em> an absence of road accidents. Macro state statistics provide complete census coverage.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-charcoal-750 bg-charcoal-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <span>Currently Active:</span>
            <strong className="text-white font-mono">{hotspots.length} Verified Blackspots</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRestoreOfficial}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-slate-300 font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Official MoRTH &amp; NHAI Registry</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
