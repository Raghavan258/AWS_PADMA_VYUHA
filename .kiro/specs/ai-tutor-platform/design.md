# Design Document: AI Tutor Platform

## Overview

The AI Tutor Platform is a cloud-based educational system that transforms static PDF textbooks into engaging video lessons. The architecture follows a client-server model with a React frontend and Flask backend, leveraging AWS services (Textract, Bedrock, Polly, S3) for AI-powered content processing and storage. The system processes PDFs through a multi-stage pipeline: text extraction, AI script generation, visual slide creation, speech synthesis, and video assembly.

The design emphasizes modularity, allowing each processing stage to operate independently while maintaining data flow integrity. Error handling is implemented at each stage to ensure graceful degradation and clear user feedback.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ File Upload  │  │   Progress   │  │    Video     │         │
│  │  Component   │  │   Tracker    │  │   Download   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST API
┌────────────────────────────┴────────────────────────────────────┐
│                       Flask Backend                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Layer (Flask Routes)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Processing Orchestrator                         │  │
│  │  - Job Management                                         │  │
│  │  - Status Tracking                                        │  │
│  │  - Error Handling                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   PDF    │ │  Script  │ │  Image   │ │  Video   │         │
│  │  Parser  │ │Generator │ │Generator │ │Assembler │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      AWS Services                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Textract │ │ Bedrock  │ │  Polly   │ │    S3    │          │
│  │          │ │(Claude+  │ │          │ │          │          │
│  │          │ │ Titan)   │ │          │ │          │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. Student uploads PDF via React frontend
2. Frontend sends PDF to Flask backend via multipart/form-data POST
3. Backend validates and stores PDF temporarily
4. PDF Parser extracts text using Amazon Textract
5. Script Generator creates teaching script using Bedrock Claude 3.5
6. Image Generator creates visual slides using Bedrock Titan
7. Speech Synthesizer converts script to audio using Polly
8. Video Assembler combines images and audio using MoviePy
9. Storage Service uploads final video to S3
10. Backend returns presigned S3 URL to frontend
11. Frontend displays download link to student

## Components and Interfaces

### Frontend Components

#### FileUploadComponent
```typescript
interface FileUploadProps {
  onUploadStart: (file: File) => void;
  onUploadComplete: (jobId: string) => void;
  onUploadError: (error: Error) => void;
}

interface FileUploadState {
  selectedFile: File | null;
  selectedLanguage: 'hindi' | 'telugu' | 'english';
  isUploading: boolean;
  validationError: string | null;
}

// Methods
validateFile(file: File): boolean
uploadFile(file: File, language: string): Promise<string>
```

#### ProgressTrackerComponent
```typescript
interface ProgressTrackerProps {
  jobId: string;
  onComplete: (videoUrl: string) => void;
  onError: (error: Error) => void;
}

interface ProcessingStatus {
  jobId: string;
  stage: 'extracting' | 'generating_script' | 'generating_images' | 
         'synthesizing_audio' | 'assembling_video' | 'uploading' | 
         'completed' | 'failed';
  progress: number;
  estimatedTimeRemaining: number;
  errorMessage?: string;
}

// Methods
pollStatus(jobId: string): Promise<ProcessingStatus>
```

#### VideoDownloadComponent
```typescript
interface VideoDownloadProps {
  videoUrl: string;
  fileName: string;
}

// Methods
downloadVideo(url: string): void
```

### Backend Components

#### API Layer
```python
class APIRoutes:
    """Flask routes for handling HTTP requests"""
    
    def upload_pdf() -> Response:
        """
        POST /api/upload
        Accepts: multipart/form-data (pdf_file, language)
        Returns: {"job_id": str, "status": str}
        """
        pass
    
    def get_status(job_id: str) -> Response:
        """
        GET /api/status/<job_id>
        Returns: ProcessingStatus JSON
        """
        pass
    
    def get_video(job_id: str) -> Response:
        """
        GET /api/video/<job_id>
        Returns: {"video_url": str, "expires_at": str}
        """
        pass
```

#### ProcessingOrchestrator
```python
class ProcessingOrchestrator:
    """Coordinates the multi-stage video generation pipeline"""
    
    def __init__(self, job_manager: JobManager):
        self.job_manager = job_manager
        self.pdf_parser = PDFParser()
        self.script_generator = ScriptGenerator()
        self.image_generator = ImageGenerator()
        self.speech_synthesizer = SpeechSynthesizer()
        self.video_assembler = VideoAssembler()
        self.storage_service = StorageService()
    
    def process_pdf(self, pdf_path: str, language: str, job_id: str) -> str:
        """
        Orchestrates the complete PDF-to-video pipeline
        Returns: S3 URL of generated video
        Raises: ProcessingError on any stage failure
        """
        pass
    
    def update_job_status(self, job_id: str, stage: str, progress: float) -> None:
        """Updates job status in the job manager"""
        pass
```

#### PDFParser
```python
class PDFParser:
    """Extracts text content from PDF files using Amazon Textract"""
    
    def __init__(self, textract_client):
        self.textract_client = textract_client
    
    def extract_text(self, pdf_path: str) -> ExtractedContent:
        """
        Extracts and organizes text from PDF
        Returns: ExtractedContent with text organized by pages
        Raises: ExtractionError if Textract fails
        """
        pass
    
    def _organize_by_pages(self, textract_response: dict) -> List[str]:
        """Organizes extracted text blocks by page order"""
        pass
```

#### ScriptGenerator
```python
class ScriptGenerator:
    """Generates teaching scripts using Amazon Bedrock Claude 3.5"""
    
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client
        self.model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    
    def generate_script(self, content: ExtractedContent) -> TeachingScript:
        """
        Creates pedagogically structured teaching script
        Returns: TeachingScript with segments organized from basic to complex
        Raises: GenerationError if Bedrock fails
        """
        pass
    
    def _create_prompt(self, content: ExtractedContent) -> str:
        """Creates instruction prompt for Claude"""
        pass
    
    def _segment_script(self, raw_script: str) -> List[ScriptSegment]:
        """Divides script into logical segments for slide generation"""
        pass
```

#### ImageGenerator
```python
class ImageGenerator:
    """Generates visual slides using Amazon Bedrock Titan"""
    
    def __init__(self, bedrock_client):
        self.bedrock_client = bedrock_client
        self.model_id = "amazon.titan-image-generator-v1"
    
    def generate_images(self, script: TeachingScript) -> List[GeneratedImage]:
        """
        Creates visual slides for each script segment
        Returns: List of images with segment associations
        Raises: GenerationError if critical image generation fails
        """
        pass
    
    def _create_image_prompt(self, segment: ScriptSegment) -> str:
        """Extracts key concepts and creates image generation prompt"""
        pass
    
    def _get_placeholder_image(self) -> bytes:
        """Returns default placeholder image for failed generations"""
        pass
```

#### SpeechSynthesizer
```python
class SpeechSynthesizer:
    """Converts text to speech using Amazon Polly"""
    
    def __init__(self, polly_client):
        self.polly_client = polly_client
        self.voice_mapping = {
            'hindi': 'Aditi',
            'telugu': 'Aditi',  # Polly uses same voice for Indian languages
            'english': 'Joanna'
        }
    
    def synthesize_speech(self, script: TeachingScript, language: str) -> List[AudioSegment]:
        """
        Converts script segments to audio in specified language
        Returns: List of audio segments synchronized with script segments
        Raises: SynthesisError if Polly fails
        """
        pass
    
    def _configure_voice_parameters(self, language: str) -> dict:
        """Configures natural-sounding voice parameters"""
        pass
```

#### VideoAssembler
```python
class VideoAssembler:
    """Assembles images and audio into video using MoviePy"""
    
    def __init__(self):
        self.temp_dir = "/tmp/video_assembly"
    
    def assemble_video(self, images: List[GeneratedImage], 
                      audio: List[AudioSegment]) -> str:
        """
        Creates MP4 video from synchronized images and audio
        Returns: Path to generated video file
        Raises: AssemblyError if video creation fails
        """
        pass
    
    def _create_clip(self, image: GeneratedImage, audio: AudioSegment) -> VideoClip:
        """Creates a single video clip from image and audio"""
        pass
    
    def _concatenate_clips(self, clips: List[VideoClip]) -> VideoClip:
        """Concatenates clips in pedagogical sequence"""
        pass
    
    def _encode_video(self, final_clip: VideoClip, output_path: str) -> None:
        """Encodes video as MP4 with H.264 codec"""
        pass
```

#### StorageService
```python
class StorageService:
    """Manages video storage and retrieval from Amazon S3"""
    
    def __init__(self, s3_client, bucket_name: str):
        self.s3_client = s3_client
        self.bucket_name = bucket_name
    
    def upload_video(self, video_path: str, student_id: str) -> str:
        """
        Uploads video to S3 with retry logic
        Returns: S3 object key
        Raises: StorageError if upload fails after retries
        """
        pass
    
    def generate_presigned_url(self, object_key: str, expiration: int = 604800) -> str:
        """
        Generates presigned URL valid for 7 days (604800 seconds)
        Returns: Presigned URL string
        """
        pass
    
    def _generate_object_key(self, student_id: str) -> str:
        """Generates unique S3 object key with timestamp"""
        pass
```

## Data Models

### ExtractedContent
```python
@dataclass
class ExtractedContent:
    """Text content extracted from PDF"""
    pages: List[str]  # Text content organized by page
    total_pages: int
    word_count: int
    extraction_timestamp: datetime
```

### TeachingScript
```python
@dataclass
class ScriptSegment:
    """Individual segment of teaching script"""
    segment_id: int
    text: str
    topic: str
    complexity_level: int  # 1 (basic) to 5 (complex)
    estimated_duration: float  # seconds

@dataclass
class TeachingScript:
    """Complete teaching script with segments"""
    segments: List[ScriptSegment]
    total_duration: float
    language: str
    generation_timestamp: datetime
```

### GeneratedImage
```python
@dataclass
class GeneratedImage:
    """Visual slide generated for script segment"""
    image_id: str
    segment_id: int
    image_data: bytes
    format: str  # 'png' or 'jpeg'
    width: int
    height: int
    generation_timestamp: datetime
```

### AudioSegment
```python
@dataclass
class AudioSegment:
    """Audio narration for script segment"""
    audio_id: str
    segment_id: int
    audio_data: bytes
    format: str  # 'mp3'
    duration: float  # seconds
    language: str
    synthesis_timestamp: datetime
```

### ProcessingJob
```python
@dataclass
class ProcessingJob:
    """Tracks video generation job status"""
    job_id: str
    student_id: str
    pdf_filename: str
    language: str
    status: str  # 'extracting', 'generating_script', etc.
    progress: float  # 0.0 to 1.0
    created_at: datetime
    updated_at: datetime
    video_url: Optional[str]
    error_message: Optional[str]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Input Validation Consistency
*For any* file upload attempt, if the file extension is not .pdf OR the file size exceeds 50MB, then the system should reject the upload and return a specific validation error message.
**Validates: Requirements 1.1, 1.4, 1.5**

### Property 2: Page Order Preservation
*For any* PDF with multiple pages, after text extraction and organization, the page order in the ExtractedContent should match the original PDF page sequence.
**Validates: Requirements 2.3**

### Property 3: Script Segmentation Completeness
*For any* Teaching_Script generated from extracted conte