import React, { useState } from 'react';
import { Copy, Download, RefreshCw, History, Rocket, Eye, Edit3, X, FileText } from 'lucide-react';
import { generateValuePropositions as generateWithGemini } from '../api/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const VPGenApp = () => {
  // Default prompt template with HTML formatting for React Quill
  const defaultPromptTemplate = `<p>Generate 3 compelling value propositions for a company in the <strong>[INDUSTRY]</strong> industry that is facing the challenge of <strong>[CHALLENGE]</strong>.</p>

<p><strong>Company Details:</strong></p>
<ul>
  <li>Company Name: <strong>[COMPANY_NAME]</strong></li>
  <li>Goal: <strong>[GOAL]</strong></li>
  <li>Target Client Context: <strong>[CLIENT_CONTEXT]</strong></li>
  <li>Desired Tone: <strong>[TONE]</strong></li>
</ul>

<p><strong>Requirements:</strong></p>
<ol>
  <li>Each value proposition should be 1-2 sentences long</li>
  <li>Focus on the specific industry and challenge mentioned</li>
  <li>Incorporate the company's goal</li>
  <li>Use the specified tone</li>
  <li>Make them compelling and benefit-focused</li>
  <li>Avoid generic statements - be specific to the industry and challenge</li>
</ol>

<p>Format the response as 3 separate value propositions, each clearly labeled as "Draft 1:", "Draft 2:", and "Draft 3:".</p>`;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    industry: '',
    customIndustry: '',
    challenge: '',
    customChallenge: '',
    goal: '',
    companyName: '',
    clientContext: '',
    tone: ''
  });
  
  const [generatedPropositions, setGeneratedPropositions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(defaultPromptTemplate);
  const [formErrors, setFormErrors] = useState({});
  const [showPromptSection, setShowPromptSection] = useState(false);

  const industries = [
    'Healthcare & Pharmaceuticals',
    'Retail & E-Commerce',
    'Banking & Financial Services',
    'Manufacturing & Supply Chain',
    'Information Technology & Software',
    'Education & EdTech',
    'Energy & Utilities',
    'Government & Public Sector',
    'Hospitality & Travel',
    'Logistics & Transportation',
    'Media & Entertainment',
    'Other'
  ];

  const challenges = [
    'High Operational Costs',
    'Poor Customer Retention / Churn',
    'Legacy Systems / Slow Digital Adoption',
    'Compliance & Regulatory Risks',
    'Low Employee Engagement',
    'Inefficient Operations',
    'Limited Market Expansion',
    'Scaling Issues',
    'Product / Service Differentiation',
    'Competition Pressure',
    'Budget Constraints',
    'Other'
  ];

  const tones = ['Formal', 'Persuasive', 'Friendly', 'Data-Driven'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.industry) {
      errors.industry = 'Industry is required';
    } else if (formData.industry === 'Other' && !formData.customIndustry.trim()) {
      errors.customIndustry = 'Please specify your custom industry';
    }
    
    if (!formData.challenge) {
      errors.challenge = 'Challenge is required';
    } else if (formData.challenge === 'Other' && !formData.customChallenge.trim()) {
      errors.customChallenge = 'Please specify your custom challenge';
    }
    
    if (!formData.goal.trim()) {
      errors.goal = 'Goal is required';
    }
    
    if (!formData.tone) {
      errors.tone = 'Tone is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateValuePropositions = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Pass custom prompt if available
      const apiData = {
        ...formData,
        customPrompt: customPrompt.trim() || null
      };
      
      const propositions = await generateWithGemini(apiData);
      setGeneratedPropositions(propositions);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        inputs: { ...formData },
        customPrompt: customPrompt.trim() || null,
        propositions: propositions
      };
      setHistory(prev => [newHistoryItem, ...prev]);
      
      setCurrentStep(2);
    } catch (error) {
      console.error('Error generating value propositions:', error);
      alert('Error generating value propositions. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetCustomPrompt = () => {
    setCustomPrompt(defaultPromptTemplate);
  };

  const downloadTemplateFile = () => {
    const templateContent = `VPGen - Value Proposition Generator Template

This template shows you how to create effective prompts for generating value propositions.

BASIC TEMPLATE:
Generate 3 compelling value propositions for a company in the [INDUSTRY] industry that is facing the challenge of [CHALLENGE].

Company Details:
- Company Name: [COMPANY_NAME]
- Goal: [GOAL]
- Target Client Context: [CLIENT_CONTEXT]
- Desired Tone: [TONE]

Requirements:
1. Each value proposition should be 1-2 sentences long
2. Focus on the specific industry and challenge mentioned
3. Incorporate the company's goal
4. Use the specified tone
5. Make them compelling and benefit-focused
6. Avoid generic statements - be specific to the industry and challenge

Format the response as 3 separate value propositions, each clearly labeled as "Draft 1:", "Draft 2:", and "Draft 3:".

AVAILABLE PLACEHOLDERS:
- [INDUSTRY] - Will be replaced with the selected industry
- [CHALLENGE] - Will be replaced with the selected challenge
- [COMPANY_NAME] - Will be replaced with the company name
- [GOAL] - Will be replaced with the company's goal
- [CLIENT_CONTEXT] - Will be replaced with the client context
- [TONE] - Will be replaced with the selected tone

CUSTOMIZATION TIPS:
1. You can modify the requirements to focus on specific aspects
2. Add industry-specific terminology or examples
3. Include additional context or constraints
4. Specify different output formats if needed
5. Add emotional or psychological triggers

EXAMPLE CUSTOM PROMPTS:

For B2B Focus:
"Create 3 professional value propositions for [COMPANY_NAME] in the [INDUSTRY] sector addressing [CHALLENGE]. Focus on ROI, efficiency gains, and long-term partnerships. Use a [TONE] tone while emphasizing measurable business outcomes."

For Startup Focus:
"Generate 3 innovative value propositions for [COMPANY_NAME], a startup in [INDUSTRY] tackling [CHALLENGE]. Emphasize disruption, scalability, and competitive advantages. Use a [TONE] tone that appeals to early adopters and investors."

For Enterprise Focus:
"Develop 3 enterprise-grade value propositions for [COMPANY_NAME] in [INDUSTRY] solving [CHALLENGE]. Highlight security, compliance, integration capabilities, and enterprise support. Use a [TONE] tone suitable for C-level decision makers."

Remember: The more specific and contextual your prompt, the better the generated value propositions will be!`;

    const blob = new Blob([templateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vpgen-prompt-template.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('Copy failed', err);
      alert('Failed to copy. Please copy manually.');
    }
  };

  const downloadAsDOCX = () => {
    // Create DOCX content with proper formatting
    const industry = formData.industry === 'Other' ? formData.customIndustry : formData.industry;
    const challenge = formData.challenge === 'Other' ? formData.customChallenge : formData.challenge;
    
    const docContent = `VALUE PROPOSITION REPORT
Generated by VPGen 🚀
Date: ${new Date().toLocaleDateString()}

INPUT PARAMETERS:
Industry: ${industry}
Challenge: ${challenge}
Goal: ${formData.goal}
Company Name: ${formData.companyName || 'Not specified'}
Client Context: ${formData.clientContext || 'Not specified'}
Tone: ${formData.tone}

GENERATED VALUE PROPOSITIONS:

Draft 1:
${generatedPropositions[0] || ''}

Draft 2:
${generatedPropositions[1] || ''}

Draft 3:
${generatedPropositions[2] || ''}

---
Generated using VPGen - Value Proposition Generator
For more information, visit our platform.`;

    // Create blob with proper DOCX MIME type
    const blob = new Blob([docContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpgen-report-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearForm = () => {
    setFormData({
      industry: '',
      customIndustry: '',
      challenge: '',
      customChallenge: '',
      goal: '',
      companyName: '',
      clientContext: '',
      tone: ''
    });
    setCustomPrompt(defaultPromptTemplate);
    setFormErrors({});
  };

  const viewHistoryItem = (item) => {
    setViewingHistoryItem(item);
  };

  const closeHistoryView = () => {
    setViewingHistoryItem(null);
  };

  const canGenerate = formData.industry && formData.challenge && formData.goal && formData.tone;

  // Prompt Customization Modal (shared across all views)
  const PromptModal = () => (
    showPromptModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="text-xl font-semibold">Customize AI Prompt</h2>
            <button
              onClick={() => setShowPromptModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="mb-6">
              <div className="">
                <ReactQuill
                  value={customPrompt}
                  onChange={setCustomPrompt}
                  placeholder="Enter your custom prompt here. You can use placeholders like [INDUSTRY], [CHALLENGE], [GOAL], [COMPANY_NAME], [CLIENT_CONTEXT], [TONE] which will be replaced with actual values."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ]
                  }}
                />
              </div>
              {/* <p className="text-xs text-gray-500 mt-2">
                Use the rich text editor above to customize your prompt. The default template is pre-filled for your convenience.
              </p> */}
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong>  you can use the placeholders like [INDUSTRY], [CHALLENGE], [GOAL], [COMPANY_NAME], [CLIENT_CONTEXT], [TONE] which will be replaced with actual values. <span className='text-red-500'>To get proper output don't remove the placeholders.</span>
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 p-3 border-t bg-gray-50">
            <button
              onClick={resetCustomPrompt}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-sm transition-colors"
            >
              Reset to Default
            </button>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowPromptModal(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )
  );

  // History Detail View Modal
  if (viewingHistoryItem) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {/* <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div> */}
              {/* <span className="text-xl font-semibold">VPGen 🚀</span> */}
              <img src="./Logo.png" alt="" className='site_logo' />
            </div>
            <button
              onClick={closeHistoryView}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              ← Back to Results
            </button>
          </div>

          {/* History Detail */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Historical Generation</h2>
              <span className="text-sm text-gray-500">{viewingHistoryItem.timestamp}</span>
            </div>
            
            {/* Input Parameters */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Industry:</span> {viewingHistoryItem.inputs.industry === 'Other' ? viewingHistoryItem.inputs.customIndustry : viewingHistoryItem.inputs.industry}</div>
                <div><span className="font-medium">Challenge:</span> {viewingHistoryItem.inputs.challenge === 'Other' ? viewingHistoryItem.inputs.customChallenge : viewingHistoryItem.inputs.challenge}</div>
                <div><span className="font-medium">Goal:</span> {viewingHistoryItem.inputs.goal}</div>
                <div><span className="font-medium">Tone:</span> {viewingHistoryItem.inputs.tone}</div>
                {viewingHistoryItem.inputs.companyName && (
                  <div><span className="font-medium">Company Name:</span> {viewingHistoryItem.inputs.companyName}</div>
                )}
                {viewingHistoryItem.inputs.clientContext && (
                  <div className="md:col-span-2"><span className="font-medium">Client Context:</span> {viewingHistoryItem.inputs.clientContext}</div>
                )}
              </div>
            </div>

            {/* Generated Propositions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Generated Value Propositions</h3>
              <div className="space-y-4">
                {viewingHistoryItem.propositions.map((proposition, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-gray-900">Draft {index + 1}</h4>
                      <button
                        onClick={() => copyToClipboard(proposition, index)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedIndex === index ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{proposition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <PromptModal />
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {/* <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div> */}
              {/* <span className="text-xl font-semibold">VPGen 🚀</span> */}
              <img src="./Logo.png" alt="" className='site_logo' />
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              ← Back to Form
            </button>
          </div>

          {/* Generated Propositions */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6 border">
            <h2 className="text-2xl font-semibold mb-6">Generated Value Propositions</h2>
            
            <div className="space-y-6">
              {generatedPropositions.map((proposition, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Draft {index + 1}</h3>
                    <button
                      onClick={() => copyToClipboard(proposition, index)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedIndex === index ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{proposition}</p>
                </div>
              ))}
            </div>

            {/* Custom Prompt Section */}
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-3">
                {/* <h3 className="text-lg font-medium text-gray-900 mb-3 md:mb-0">Customize AI Prompt</h3> */}
                <div className='mb-3 md:mb-2'>

                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={showPromptSection}
                    onChange={(e) => setShowPromptSection(e.target.checked)}
                  />
                  <span className="text-sm">Customize AI Prompt</span>
                </label>
                </div>
                {showPromptSection && 
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <button
                        onClick={downloadTemplateFile}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                        title="Download prompt template guide"
                      >
                        <FileText className="w-4 h-4" />
                        Template Guide
                      </button>
                      <button
                        onClick={() => setShowPromptModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-sm transition-colors btn btn-outline btn-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                        {customPrompt ? 'Edit Prompt' : 'Customize Prompt'}
                      </button>
                    </div>
                  }
              </div>
              {showPromptSection && (
                <>
                  {customPrompt && (
                    <div className="bg-gray-100 p-3 rounded-sm">
                      <p className="text-sm text-gray-600 mb-2">Custom prompt preview:</p>
                      <div className="text-sm text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: customPrompt }} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={generateValuePropositions}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              
              <button
                onClick={downloadAsDOCX}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download DOCX
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8 border">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <History className="w-5 h-5" />
                Generation History
              </h3>
              <div className="space-y-4">
                {history.slice(0, 3).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-2">{item.timestamp}</div>
                        <div className="text-sm">
                          <span className="font-medium">Industry:</span> {item.inputs.industry === 'Other' ? item.inputs.customIndustry : item.inputs.industry} | 
                          <span className="font-medium"> Challenge:</span> {item.inputs.challenge === 'Other' ? item.inputs.customChallenge : item.inputs.challenge}
                        </div>
                      </div>
                      <button
                        onClick={() => viewHistoryItem(item)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors ml-4"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <PromptModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          {/* <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div> */}
          {/* <span className="text-xl font-semibold">VPGen 🚀</span> */}
          <img src="./Logo.png" alt="" className='site_logo' />
        </div>

        {/* Progress */}
        {/* <div className="flex items-center justify-between mb-8">
          <span className="text-sm text-gray-600">Step 1 of 2</span>
          <span className="text-sm text-gray-600">50%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '50%' }}></div>
        </div> */}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border">
          <h1 className="text-2xl font-semibold mb-2">Create Your Value Proposition</h1>
          <p className="text-gray-600 mb-8">Fill in the details below to generate a powerful value proposition.</p>

          <div className="space-y-6">
            {/* Industry and Challenge Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    formErrors.industry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select an industry...</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {formData.industry === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom industry"
                    value={formData.customIndustry}
                    onChange={(e) => handleInputChange('customIndustry', e.target.value)}
                    className={`w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.customIndustry ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                {formErrors.industry && <p className="text-sm text-red-500 mt-1">{formErrors.industry}</p>}
                {formErrors.customIndustry && <p className="text-sm text-red-500 mt-1">{formErrors.customIndustry}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challenge <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.challenge}
                  onChange={(e) => handleInputChange('challenge', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a challenge...</option>
                  {challenges.map(challenge => (
                    <option key={challenge} value={challenge}>{challenge}</option>
                  ))}
                </select>
                {formData.challenge === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom challenge"
                    value={formData.customChallenge}
                    onChange={(e) => handleInputChange('customChallenge', e.target.value)}
                    className={`w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      formErrors.customChallenge ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                {formErrors.challenge && <p className="text-sm text-red-500 mt-1">{formErrors.challenge}</p>}
                {formErrors.customChallenge && <p className="text-sm text-red-500 mt-1">{formErrors.customChallenge}</p>}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Increase user engagement by 20%"
                value={formData.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {formErrors.goal && <p className="text-sm text-red-500">{formErrors.goal}</p>}
            </div>

            {/* Company Name and Tone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a tone...</option>
                  {tones.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
                {formErrors.tone && <p className="text-sm text-red-500">{formErrors.tone}</p>}
              </div>
            </div>

            {/* Client Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Context</label>
              <textarea
                placeholder="Describe your target client..."
                rows={4}
                value={formData.clientContext}
                onChange={(e) => handleInputChange('clientContext', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            {/* Custom Prompt Section */}
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-3">
                {/* <h3 className="text-lg font-medium text-gray-900 mb-3 md:mb-0">Customize AI Prompt</h3> */}
                <div className='mb-3 md:mb-2'>

                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={showPromptSection}
                    onChange={(e) => setShowPromptSection(e.target.checked)}
                  />
                  <span className="text-sm">Customize AI Prompt</span>
                </label>
                </div>
                {showPromptSection && 
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <button
                        onClick={downloadTemplateFile}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                        title="Download prompt template guide"
                      >
                        <FileText className="w-4 h-4" />
                        Template Guide
                      </button>
                      <button
                        onClick={() => setShowPromptModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-sm transition-colors btn btn-outline btn-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                        {customPrompt ? 'Edit Prompt' : 'Customize Prompt'}
                      </button>
                    </div>
                  }
              </div>
              {showPromptSection && (
                <>
                  {customPrompt && (
                    <div className="bg-gray-100 p-3 rounded-sm">
                      <p className="text-sm text-gray-600 mb-2">Custom prompt preview:</p>
                      <div className="text-sm text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: customPrompt }} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={clearForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
            <button
              onClick={generateValuePropositions}
              disabled={!canGenerate || isGenerating}
              className="px-6 py-3 bg-purple-600 text-white rounded-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Value Proposition'}
            </button>
            
          </div>
                  </div>
        </div>

        <PromptModal />
      </div>
    );
  };

export default VPGenApp;