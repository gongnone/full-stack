import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '../lib/trpc'
import { useState } from 'react'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'

export const Route = createFileRoute('/onboard/$token')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const { token } = Route.useParams()
  const { data, isLoading, error } = trpc.onboarding.validateInvite.useQuery({ token })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [recordingKey, setRecordingKey] = useState<string | null>(null)
  const [contentKey, setContentKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'voice' | 'content'>('voice')
  const [textContent, setTextContent] = useState('')
  const submitMutation = trpc.onboarding.submit.useMutation()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const uploadFile = async (blob: Blob, filename: string, type: 'voice' | 'content') => {
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Public upload endpoint constructed manually
      const url = `${import.meta.env.VITE_API_URL || ''}/api/upload/onboarding/${token}/${encodeURIComponent(filename)}`
      
      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-Type', blob.type)
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            if (type === 'voice') setRecordingKey(response.r2Key)
            else setContentKey(response.r2Key)
            resolve()
          } else {
            reject(new Error('Upload failed'))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(blob)
      })
      
    } catch (e) {
      console.error('Upload error:', e)
      alert('Failed to upload. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRecordingComplete = (blob: Blob) => {
    const filename = `voice-${Date.now()}.webm`
    uploadFile(blob, filename, 'voice')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadFile(file, file.name, 'content')
  }

  const handleTextSubmit = () => {
    if (!textContent.trim()) return
    const blob = new Blob([textContent], { type: 'text/plain' })
    uploadFile(blob, `text-input-${Date.now()}.txt`, 'content')
  }

  const handleSubmit = async () => {
    setIsSubmitted(true)
    try {
      await submitMutation.mutateAsync({
        token,
        recordingKey: recordingKey || undefined,
        contentKey: contentKey || undefined,
      })
    } catch (e) {
      console.error(e)
      setIsSubmitted(false)
      alert('Submission failed. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1419] text-[#E7E9EA]">
        Loading...
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1419] text-[#E7E9EA]">
        <div className="text-center p-6 bg-[#1A1F26] rounded-lg border border-[#2A3038] max-w-md animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-[#00D26A]/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#00D26A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Analyzing your brand...</h1>
          <p className="text-[#8B98A5]">
            Thanks! We've received your inputs. We're now processing your Brand DNA. 
            Your agency will reach out with the results soon.
          </p>
        </div>
      </div>
    )
  }

  if (error || !data?.valid) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F1419] text-[#E7E9EA]">
        <div className="text-center p-6 bg-[#1A1F26] rounded-lg border border-[#2A3038]">
          <h1 className="text-2xl font-bold text-[#F4212E] mb-4">Invalid Invitation</h1>
          <p className="text-[#8B98A5]">This link is invalid or has expired.</p>
          <p className="text-[#8B98A5] mt-2">Please ask your agency for a new invitation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-[#E7E9EA] p-4 font-sans">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold mb-2">Welcome, {data.clientName}</h1>
        <p className="text-[#8B98A5] mb-8">Let's capture your brand voice.</p>
        
        {/* Tabs */}
        <div className="flex mb-6 border-b border-[#2A3038]">
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'voice' ? 'text-[#1D9BF0] border-b-2 border-[#1D9BF0]' : 'text-[#8B98A5] hover:text-[#E7E9EA]'}`}
          >
            Voice Recorder
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'content' ? 'text-[#1D9BF0] border-b-2 border-[#1D9BF0]' : 'text-[#8B98A5] hover:text-[#E7E9EA]'}`}
          >
            Upload Content
          </button>
        </div>
        
        {/* Voice Recorder Section */}
        {activeTab === 'voice' && (
          <div className="bg-[#1A1F26] p-6 rounded-lg border border-[#2A3038] mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#E7E9EA]">Record Your Voice</h2>
            <p className="text-[#8B98A5] mb-6 text-sm">
              Tell us about the customers you love working with — and the ones who drive you crazy. 
              Speak naturally for about 2 minutes.
            </p>
            
            {!recordingKey ? (
              <div className={isUploading ? 'opacity-50 pointer-events-none' : ''}>
                <VoiceRecorder 
                  onComplete={handleRecordingComplete}
                  onError={(err) => console.error(err)}
                  maxDuration={120} // 2 minutes
                  autoStopDuration={120}
                />
                {isUploading && (
                  <div className="mt-4 text-center">
                    <div className="w-full bg-[#2A3038] rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#1D9BF0] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-[#8B98A5]">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-[#0F1419] rounded border border-[#00D26A]/30">
                <div className="flex items-center justify-center gap-2 text-[#00D26A] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Voice Captured</span>
                </div>
                <p className="text-sm text-[#8B98A5]">Your recording has been uploaded successfully.</p>
                <button 
                  onClick={() => setRecordingKey(null)}
                  className="mt-3 text-xs text-[#1D9BF0] hover:underline"
                >
                  Record again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content Upload Section */}
        {activeTab === 'content' && (
          <div className="bg-[#1A1F26] p-6 rounded-lg border border-[#2A3038] mb-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#E7E9EA]">Upload Existing Content</h2>
            <p className="text-[#8B98A5] mb-6 text-sm">
              Already have content that sounds like you? Upload PDFs or paste text here.
            </p>

            {!contentKey ? (
              <div className={isUploading ? 'opacity-50 pointer-events-none' : 'space-y-6'}>
                {/* File Upload */}
                <div className="border-2 border-dashed border-[#2A3038] rounded-lg p-6 text-center hover:border-[#1D9BF0] transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-[#1D9BF0] mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#E7E9EA] font-medium">Click to upload PDF or Doc</p>
                  <p className="text-xs text-[#8B98A5] mt-1">Max 10MB</p>
                </div>

                <div className="text-center text-[#8B98A5] text-xs uppercase tracking-widest font-bold">OR</div>

                {/* Text Area */}
                <div>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste your best content here..."
                    className="w-full h-32 bg-[#0F1419] border border-[#2A3038] rounded-lg p-3 text-[#E7E9EA] text-sm focus:border-[#1D9BF0] focus:outline-none"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!textContent.trim()}
                    className="mt-2 w-full py-2 bg-[#2A3038] text-[#E7E9EA] rounded font-medium hover:bg-[#3A4048] transition-colors disabled:opacity-50"
                  >
                    Submit Text
                  </button>
                </div>

                {isUploading && (
                  <div className="mt-4 text-center">
                    <div className="w-full bg-[#2A3038] rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#1D9BF0] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-[#8B98A5]">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-4 bg-[#0F1419] rounded border border-[#00D26A]/30">
                <div className="flex items-center justify-center gap-2 text-[#00D26A] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Content Uploaded</span>
                </div>
                <p className="text-sm text-[#8B98A5]">Your content has been received.</p>
                <button 
                  onClick={() => setContentKey(null)}
                  className="mt-3 text-xs text-[#1D9BF0] hover:underline"
                >
                  Upload more
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Next Steps Placeholder */}
        {(recordingKey || contentKey) && (
          <div className="text-center animate-fade-in pb-10">
            <button 
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="px-8 py-3 bg-[#1D9BF0] text-white rounded-full font-bold hover:bg-[#1A8CD8] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitMutation.isPending ? 'Processing...' : 'Analyze My Brand DNA →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
