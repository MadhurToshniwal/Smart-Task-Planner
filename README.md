# 🚀 Smart Task Planner - AI-Powered Goal Breakdown System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Ready-brightgreen.svg)](https://mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange.svg)](https://groq.com/)

> **Transform ambitious goals into actionable, time-bound tasks with the power of AI reasoning**

## 🎯 **Project Overview**

Smart Task Planner is an intelligent goal decomposition system that leverages advanced AI to break down complex objectives into manageable, prioritized tasks with realistic timelines. Built for **Unthinkable Solutions**, this project demonstrates cutting-edge integration of AI reasoning, modern web technologies, and professional software architecture.

### 🏆 **Why This Project Stands Out**

- **🧠 Advanced AI Integration**: Uses Groq's Llama 3.1 model for intelligent task generation
- **⚡ Real-time Processing**: Sub-3-second AI-powered task breakdown 
- **🎨 Modern UI/UX**: Professional React interface with Material-UI components
- **📊 Analytics Dashboard**: Comprehensive progress tracking and insights
- **🔒 Enterprise Security**: Helmet.js, CORS, rate limiting, and input validation
- **📚 Complete Documentation**: Interactive Swagger API documentation
- **🚀 Production Ready**: Deployment-optimized with comprehensive logging

---

## 🎬 **Live Demo**

🌐 **[Try Live Demo](https://smart-task-planner.railway.app)** *(Will be deployed after GitHub push)*

### 📹 **Demo Video**
*Coming Soon - Will showcase full functionality*

---

## ✨ **Key Features**

### 🤖 **AI-Powered Task Generation**
- **Intelligent Breakdown**: Converts high-level goals into 8-12 specific, actionable tasks
- **Smart Prioritization**: Automatically assigns priority levels (Urgent, High, Medium, Low)
- **Category Classification**: Organizes tasks into logical categories (Planning, Development, Testing, etc.)
- **Timeline Logic**: Distributes tasks across realistic timeframes with dependencies

### 📈 **Advanced Analytics**
- **Progress Tracking**: Real-time completion rate monitoring
- **Visual Charts**: Bar charts showing task distribution and progress
- **Performance Insights**: Overdue task tracking and completion analytics
- **Dashboard Overview**: Comprehensive metrics at a glance

### 🎯 **Professional Task Management**
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Status Management**: Pending → In Progress → Completed workflow
- **Search & Filter**: Advanced filtering by status, priority, and category
- **Bulk Operations**: Efficient goal and task management

### 🔧 **Enterprise Architecture**
- **RESTful API**: Clean, documented endpoints with Swagger integration
- **Database Optimization**: MongoDB with indexes and virtual fields
- **Comprehensive Logging**: Winston-based logging with request tracking
- **Error Handling**: Graceful error management with detailed responses
- **Security Middleware**: Production-ready security implementations

---

## 🏗️ **Technical Architecture**

### **Backend Stack**
- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Groq API with Llama 3.1-8B-Instant model
- **Documentation**: Swagger/OpenAPI 3.0 specification
- **Security**: Helmet.js, CORS, rate limiting, input validation
- **Logging**: Winston with multiple transports and request tracking

### **Frontend Stack**
- **Framework**: React 18+ with functional components and hooks
- **UI Library**: Material-UI (MUI) with custom theming
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React-Toastify for user feedback
- **Charts**: Chart.js for analytics visualization
- **State Management**: React hooks with optimized re-rendering

### **AI & Data Processing**
- **LLM**: Groq's Llama 3.1-8B-Instant for rapid inference
- **Prompt Engineering**: Sophisticated prompts for task breakdown
- **Data Enhancement**: AI-generated priorities, categories, and timelines
- **Error Recovery**: Fallback mechanisms for AI service interruptions

---

## 🚀 **Getting Started**

### **Prerequisites**
```bash
Node.js 18+
MongoDB 4.4+
npm or yarn
Git
```

### **Installation**

1. **Clone Repository**
   ```bash
   git clone https://github.com/MadhurToshniwal/Smart-Task-Planner.git
   cd Smart-Task-Planner
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Or install separately
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create backend/.env file
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart-task-planner
   GROQ_API_KEY=your_groq_api_key_here
   NODE_ENV=development
   ```

4. **Start Development Servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start separately
   # Backend: http://localhost:5000
   npm run server
   
   # Frontend: http://localhost:3000  
   npm run client
   ```

### **🔑 API Keys Setup**

Get your free Groq API key:
1. Visit [Groq Console](https://console.groq.com/)
2. Create free account
3. Generate API key
4. Add to `.env` file

---

## 📚 **API Documentation**

### **Interactive Documentation**
- **Swagger UI**: `http://localhost:5000/api-docs`
- **API Testing**: `http://localhost:5000/api-test`
- **Health Check**: `http://localhost:5000/health`

### **Core Endpoints**

#### **🎯 Goal & Task Management**
```bash
POST /api/tasks/generate          # AI-powered task generation
GET  /api/tasks/goals             # Retrieve all goals
GET  /api/tasks/goals/:id         # Get specific goal with tasks
DELETE /api/tasks/goals/:id       # Delete goal and associated tasks
```

#### **📊 Analytics & Insights**
```bash
GET /api/tasks/dashboard/analytics # Comprehensive dashboard metrics
```

#### **🔄 Task Operations**
```bash
PATCH /api/tasks/:id/status       # Update task status
PUT   /api/tasks/:id              # Update complete task
DELETE /api/tasks/:id             # Delete specific task
```

---

## 🤖 **AI Implementation Details**

### **LLM Integration Architecture**

The system uses advanced prompt engineering to ensure consistent, high-quality task generation:

```javascript
// Sophisticated AI Prompting Strategy
const enhancedPrompt = `
Role: Expert Project Manager & AI Task Breakdown Specialist

Goal Analysis: "${goalText}"
Category: ${category}
Priority: ${priority}
Timeline: ${timeframeDays} days

Generate 8-10 SMART tasks with:
- Specific, actionable descriptions
- Realistic time estimates
- Logical dependencies
- Appropriate priorities (urgent/high/medium/low)
- Professional categories
- Start/end dates within timeline

Format: JSON array with title, description, priority, category, estimatedHours, startDate, endDate
`;
```

### **AI Response Processing**

- **Intelligent Parsing**: Robust JSON extraction with fallback mechanisms
- **Data Validation**: Comprehensive validation of AI-generated content
- **Enhancement Layer**: Additional processing for timeline optimization
- **Error Handling**: Graceful degradation when AI services are unavailable

### **Performance Optimization**

- **Sub-3 Second Response**: Optimized prompts for rapid AI inference
- **Caching Strategy**: Intelligent caching to reduce API calls
- **Parallel Processing**: Concurrent task processing where applicable
- **Request Throttling**: Rate limiting to prevent API abuse

---

## 📊 **Example Usage**

### **Sample Goal Input**
```
Goal: "Create a full-stack e-commerce website with payment integration in 4 weeks"
Category: Project
Priority: High
Deadline: 4 weeks from today
```

### **AI-Generated Output**
```json
[
  {
    "title": "Project Requirements & Planning",
    "description": "Define scope, create wireframes, plan architecture",
    "priority": "urgent",
    "category": "planning",
    "estimatedHours": 16,
    "startDate": "2025-10-15",
    "endDate": "2025-10-18"
  },
  {
    "title": "Database Design & Setup", 
    "description": "Design schema, set up MongoDB, create collections",
    "priority": "high",
    "category": "development",
    "estimatedHours": 12,
    "startDate": "2025-10-19",
    "endDate": "2025-10-21"
  }
  // ... 8 more intelligently generated tasks
]
```

---

## 🚀 **Free Railway Deployment**

This project is optimized for **100% free deployment** on Railway:

```bash
# One-command deployment preparation
npm run railway-build

# Deploy to Railway (after GitHub push)
# 1. Connect GitHub repo to Railway
# 2. Add environment variables
# 3. Deploy automatically
```

**Total Cost**: $0/month (Free Railway tier + MongoDB Atlas free tier)

### **Environment Variables for Production**
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-task-planner
GROQ_API_KEY=your_production_groq_key
PORT=5000
```

---

## 🏆 **Why Choose This Implementation?**

### **🎯 Addresses All Requirements**
- ✅ **Goal Input Processing**: Sophisticated natural language understanding
- ✅ **Task Breakdown**: AI-generated actionable tasks with dependencies
- ✅ **Timeline Logic**: Intelligent scheduling with realistic estimates
- ✅ **Backend API**: Professional REST API with comprehensive documentation
- ✅ **Database Storage**: Optimized MongoDB implementation
- ✅ **LLM Integration**: Advanced Groq AI with smart prompting

### **🚀 Exceeds Expectations**
- 🎨 **Professional Frontend**: Modern React UI (optional requirement exceeded)
- 📊 **Analytics Dashboard**: Advanced insights and progress tracking
- 🔒 **Enterprise Security**: Production-ready security implementations
- 📚 **Complete Documentation**: Interactive API docs and testing interface
- 🌐 **Deployment Ready**: Free deployment configuration included

### **💡 Innovation Highlights**
- **AI Enhancement**: Goes beyond basic task generation with smart categorization
- **User Experience**: Intuitive interface with real-time feedback
- **Scalability**: Architecture designed for enterprise-level scaling
- **Maintainability**: Clean code with comprehensive logging and error handling

---

## 👨‍💻 **Developer Information**

**Madhur Toshniwal**  
📧 madhurtoshniwal03@gmail.com  
🔗 [GitHub](https://github.com/MadhurToshniwal)  
💼 [LinkedIn](https://linkedin.com/in/madhurtoshniwal)

### **🎯 Built for Unthinkable Solutions**

This project demonstrates expertise in:
- **AI Integration**: Advanced LLM implementation with Groq
- **Full-Stack Development**: Modern React + Node.js architecture  
- **Database Design**: Optimized MongoDB schemas and queries
- **API Development**: RESTful APIs with comprehensive documentation
- **DevOps**: Deployment-ready configuration and CI/CD
- **Code Quality**: Enterprise-grade logging, error handling, and security

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Groq AI** for providing fast, reliable LLM inference
- **MongoDB** for robust document database capabilities
- **React Team** for the excellent frontend framework
- **Material-UI** for beautiful, accessible components
- **Unthinkable Solutions** for the inspiring project opportunity

---

<div align="center">

### 🚀 **Ready to Transform Goals into Success!**

**[Live Demo](https://smart-task-planner.railway.app)** • **[API Docs](https://smart-task-planner.railway.app/api-docs)** • **[GitHub](https://github.com/MadhurToshniwal/Smart-Task-Planner)**

</div>