# 📘 AI Textbook to Multilingual Video Lecture Generator

> **Transforming static textbooks into an intelligent, multilingual AI teacher.**
> *A submission for the "AI for Bharat" Hackathon Track.*

![Status](https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-AWS%20Bedrock%20%7C%20Polly%20%7C%20Lambda-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Language](https://img.shields.io/badge/Language-Python%20%7C%20React-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🚀 Project Overview

**Education should not be limited by language or learning style.**

This platform is an end-to-end **AI Pipeline** that takes a standard PDF textbook and automatically converts it into a structured, engaging, and **multilingual video lecture**. It simplifies complex concepts, generates visual aids, and narrates the lesson in native Indian languages, making high-quality education accessible to everyone.

### 🌟 What it enables students to do:
- **📄 Upload** any textbook chapter (PDF).
- **🧠 Automatically Extract** & structure the core topics.
- **✍️ Simplify** complex jargon into easy-to-understand scripts.
- **🎙️ Convert** text into natural speech (Hindi, Telugu, English).
- **🎥 Watch** a complete, AI-generated video lesson.

---

## 🎯 Problem vs. Solution

| The Problem ❌ | The Proposed Solution 💡 |
| :--- | :--- |
| **Static & Boring:** Textbooks are dense and non-interactive. | **Engaging Video:** Converts text into dynamic video lectures. |
| **Language Barrier:** Most high-quality technical books are only in English. | **Multilingual Support:** Auto-generates lectures in native languages (Hindi, Telugu). |
| **Lack of Guidance:** Students in rural areas lack access to expert teachers. | **AI Teacher:** Acts as an on-demand tutor that explains concepts clearly. |
| **Cognitive Overload:** Complex topics are hard to grasp without visuals. | **Visual Learning:** Auto-generates diagrams and slides for every topic. |

---

## 🧠 Core Features

| Feature | Description |
| :--- | :--- |
| **📄 Smart PDF Parsing** | Intelligent chapter detection and layout analysis using **Amazon Textract**. |
| **🧠 Concept Structuring** | Logically organizes content from "Basic" to "Advanced" using **Claude 3.5**. |
| **✍️ Script Simplification** | Turns academic text into conversational, student-friendly teaching scripts. |
| **🎨 AI Visuals** | Generates relevant diagrams & slide backgrounds using **Amazon Titan**. |
| **🎙️ Native Voice** | Neural Text-to-Speech in Indian languages via **Amazon Polly**. |
| **🎥 Auto-Editing** | Stitches visuals, audio, and text into a final `.mp4` video automatically. |

---

## 🏗 System Architecture


graph TD
    User[👩‍🎓 Student] -->|Uploads PDF| UI[💻 React Frontend]
    UI -->|POST Request| API[⚙️ Backend API]
    API -->|Store File| S3[📦 Amazon S3]
    
    subgraph "🤖 AI Processing Layer (AWS)"
        S3 -->|Trigger| Lambda[⚡ AWS Lambda]
        Lambda -->|Extract Text| Textract[📄 Amazon Textract]
        Lambda -->|Generate Script| Bedrock_Claude["🧠 Bedrock (Claude 3.5)"]
        Lambda -->|Generate Images| Bedrock_Titan["🎨 Bedrock (Titan)"]
        Lambda -->|Synthesize Audio| Polly[🎙️ Amazon Polly]
    end
    
    Textract & Bedrock_Claude & Bedrock_Titan & Polly -->|Assets| MoviePy[🎥 Video Renderer]
    MoviePy -->|Save Video| S3_Output[📦 S3 Output Bucket]
    S3_Output -->|Stream URL| UI
📌 For a deep dive into the technical design, check out design.md.

🛠 Technology Stack
🤖 AI & Machine Learning
Amazon Bedrock (Claude 3.5 Sonnet): Reasoning, summarization, and script generation.

Amazon Bedrock (Titan Image Generator): Creating educational diagrams and visuals.

Amazon Polly: Neural Text-to-Speech (Hindi, Telugu, English).

Amazon Textract: OCR and document structure analysis.

⚙️ Backend & Infrastructure
Python (Flask/FastAPI): Core application logic.

AWS Lambda: Serverless compute for event triggers.

MoviePy: Programmatic video editing and rendering.

Amazon S3: Secure object storage for PDFs and Videos.

🖥️ Frontend
React.js: Responsive user interface.

Tailwind CSS: Modern styling.

🇮🇳 Impact: AI for Bharat
This project is built with the vision of "Digital Inclusion":

Rural Empowerment: Brings high-quality education to villages where English proficiency might be low.

Cost-Effective: Reduces dependency on expensive coaching centers.

Scalable Learning: One AI model can teach millions of students simultaneously.

📂 Repository Structure
Bash
├── requirements.md   # Functional & Non-Functional Requirements
├── design.md         # System Architecture & Technical Design
├── backend/          # Flask API & Python Scripts
├── frontend/         # React.js Application
└── README.md         # Project Documentation
🔮 Future Roadmap
[ ] Assessment Module: Auto-generate quizzes and MCQs after every video.

[ ] Interactive Doubt Solving: A "Chat with Video" feature using RAG.

[ ] Offline Mode: Lightweight audio-only downloads for low-bandwidth areas.

[ ] 3D Models: Integration of 3D visualizations for engineering/medical topics.

🎯 Vision
"To transform every static textbook into an intelligent, multilingual AI teacher — delivering equitable, high-quality education across Bharat."

<div align="center">

Built with ❤️ by Team Padma Vyuha (IU-028)
Hack2Skill AI for Bharat Hackathon

</div>
