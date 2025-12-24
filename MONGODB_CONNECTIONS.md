# MongoDB Database Connections - All Pages

## ✅ ALL PAGES CONNECTED TO MONGODB

Every page that generates a reference ID or records data is now connected to MongoDB.

### 1. **Quiz Page** (`/quiz`)
- **API Route**: `/api/quiz/submit`
- **Model**: `QuizAttempt`
- **Data Saved**: 
  - Reference ID
  - Full Name
  - Institution
  - Score
  - Pass/Fail status
  - Certificate Type (QUIZ/PAR)
- **Status**: ✅ Connected

### 2. **Simulation Page** (`/simulation`)
- **API Route**: `/api/sim/complete`
- **Model**: `SimStat`
- **Data Saved**:
  - Reference ID
  - Scene ID
  - Category (bike/car/pedestrian/other)
  - Success status
  - Attempts count
  - Time taken (seconds)
- **Status**: ✅ Connected

### 3. **Events Page** (`/events`)
- **API Route**: `/api/events/create`
- **Model**: `Event`
- **Data Saved**:
  - Event ID (EVT-00001, etc.)
  - Reference ID (KRMR-RSM-2026-PDL-RHL-EVT-00001)
  - Title, Organiser details
  - Date, Location
  - Photos, Videos
- **Status**: ✅ Connected

### 4. **Certificates Page** (`/certificates`)
- **API Route**: `/api/certificates/create`
- **Model**: `Certificate`
- **Data Saved**:
  - Certificate ID
  - Type (ORG/PAR/QUIZ/SIM/VOL/SCH/COL/TOPPER)
  - Full Name, Institution
  - Reference ID
  - Appreciation text (if opted in)
- **Status**: ✅ Connected

### 5. **Organiser Registration** (`/organiser-register`)
- **API Route**: `/api/organisers/register`
- **Model**: `Organiser`
- **Data Saved**:
  - Temporary Organiser ID
  - Name, Organisation
  - Mobile Number
  - Event Location
  - Proposed Event Date
  - Event Type
  - Status (Pending Approval)
- **Status**: ✅ Connected

### 6. **Basics Page** (`/basics`)
- **API Route**: `/api/pages/complete`
- **Model**: `PageCompletion`
- **Data Saved**:
  - Reference ID (BASICS-xxx)
  - Page Type: "basics"
  - Completion status
  - Completion timestamp
- **Status**: ✅ Connected (NEW)

### 7. **Guides Page** (`/guides`)
- **API Route**: `/api/pages/complete`
- **Model**: `PageCompletion`
- **Data Saved**:
  - Reference ID (GUIDE-xxx)
  - Page Type: "guides"
  - Completion status
  - Completion timestamp
- **Status**: ✅ Connected (NEW)

### 8. **Prevention Page** (`/prevention`)
- **API Route**: `/api/pages/complete`
- **Model**: `PageCompletion`
- **Data Saved**:
  - Reference ID (PREVENT-xxx)
  - Page Type: "prevention"
  - Completion status
  - Completion timestamp
- **Status**: ✅ Connected (NEW)

## 📊 Database Models Summary

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `QuizAttempt` | Quiz submissions | referenceId, score, passed, certificateType |
| `SimStat` | Simulation completions | referenceId, sceneId, category, success |
| `Event` | Event logging | eventId, referenceId, title, date |
| `Certificate` | Certificate generation | certificateId, type, fullName, referenceId |
| `Organiser` | Organiser registrations | tempOrganiserId, finalOrganiserId, status |
| `PageCompletion` | Page completions | referenceId, pageType, completed |
| `SimulationPlay` | Simulation play tracking | type, createdAt |

## 🔄 Data Flow

1. **User completes activity** → Frontend generates/gets reference ID
2. **Frontend calls API** → `/api/[endpoint]`
3. **API connects to MongoDB** → `connectDB()`
4. **Data saved to model** → `Model.create()` or `Model.save()`
5. **Reference ID returned** → User can use for certificates

## ✅ Verification

All pages that generate reference IDs are now connected to MongoDB and save completion data. This ensures:
- All completions are tracked
- Reference IDs are stored in database
- Data can be used for certificates
- Analytics and statistics are accurate

