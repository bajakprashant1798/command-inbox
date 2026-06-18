# Mail Command Inbox

> AI-powered Gmail & Google Calendar Command Center built with Corsair.

Mail Command Inbox is a modern productivity workspace that combines Gmail, Google Calendar, AI-powered workflows, and agent automation into a single command-driven experience.

Instead of switching between multiple applications and performing repetitive actions manually, users can manage email, schedule meetings, send follow-ups, and automate workflows through natural language commands.

Built for the **Corsair Command Center Builder Hackathon**, this project demonstrates how Corsair can be used to create a Superhuman-style productivity experience powered by Gmail, Google Calendar, AI agents, and intelligent workflow automation.

---

# 🚀 Problem

Managing communication and scheduling is still fragmented.

Users often need to:

- Switch between Gmail and Google Calendar
- Manually check availability before scheduling meetings
- Send repetitive follow-up emails
- Perform the same workflows repeatedly
- Navigate multiple screens for simple actions

These inefficiencies create unnecessary friction throughout the workday.

---

# 💡 Solution

Mail Command Inbox combines Gmail, Google Calendar, AI command execution, and agent automation into a unified workspace.

Users can type commands like:

```text
Schedule a meeting with john@example.com tomorrow at 4 PM
and send a confirmation email.
```

The system automatically:

1. Understands intent using AI
2. Checks calendar availability
3. Detects scheduling conflicts
4. Suggests alternative free slots
5. Creates calendar events
6. Sends emails
7. Displays execution status

---

# ✨ Features

## 📧 Gmail Workspace

- Inbox management
- Thread previews
- Email search
- Draft creation
- Email sending
- AI-assisted workflows

## 📅 Google Calendar Workspace

- Upcoming events dashboard
- Agenda view
- Event creation
- Event updates
- Availability checking
- Conflict detection

## 🤖 AI Command Center

Natural language workflow execution.

Examples:

```text
Schedule a meeting tomorrow at 3 PM
```

```text
Send an email to team@example.com
```

```text
Schedule a meeting and send a confirmation email
```

Features:

- Structured action previews
- Editable workflow actions
- Multi-step execution
- Execution status tracking

## 🧠 Smart Scheduling

Before creating meetings the system:

- Checks availability
- Detects conflicts
- Suggests alternative time slots
- Allows users to accept recommendations

## 💬 MCP Agent Chat

AI workspace assistant powered by Corsair MCP.

The agent can:

- Read inbox data
- Access calendar information
- Discover available operations
- Execute Gmail workflows
- Execute Calendar workflows
- Perform multi-step workspace actions

## 🔐 Authentication

- Google Sign-In
- Protected routes
- Secure session management
- Multi-user support

## 🏢 Multi-Tenancy

Each user gets an isolated workspace.

Tenant isolation is handled through:

```ts
corsair.withTenant(user.email)
```

This allows every user to connect their own Gmail and Calendar account independently.

---

# ⚡ Corsair Features Used

### Gmail Integration

- Read inbox messages
- Search emails
- Draft emails
- Send emails
- Thread operations

### Google Calendar Integration

- Event creation
- Event management
- Availability checking
- Scheduling workflows

### MCP Integration

Used to power the AI Agent Chat experience.

Available tools include:

- `list_operations`
- `get_schema`
- `run_script`
- `corsair_setup`

### Multi-Tenancy

Each authenticated user receives an isolated workspace using Corsair tenants.

### OAuth Management

Corsair securely manages Gmail and Google Calendar authorization flows.

### Local Data Caching

Corsair synchronizes Gmail and Calendar data locally, enabling fast access without repeatedly querying Google APIs.

---

# 🏗 Architecture

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Backend

- Next.js App Router
- Route Handlers
- Server Components

## Database

- Neon PostgreSQL
- Prisma ORM

## AI

- Gemini 2.5 Flash
- OpenAI Agents SDK

## Integrations

- Corsair
- Gmail
- Google Calendar
- MCP

## Deployment

- Vercel

---

# 🔄 Workflow Example

### User Command

```text
Schedule a meeting with john@example.com tomorrow at 4 PM
and send a confirmation email.
```

### Processing Flow

```text
User Command
      ↓
Gemini Structured Parsing
      ↓
Availability Check
      ↓
Conflict Detection
      ↓
Action Preview
      ↓
User Confirmation
      ↓
Calendar Event Creation
      ↓
Email Sent
      ↓
Execution Status
```

---

# 🛠 Local Development

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=

CORSAIR_KEK=

AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

GEMINI_API_KEY=
OPENAI_API_KEY=
```

## Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

## Run Development Server

```bash
npm run dev
```

---

# ✅ Verification

Type checking:

```bash
npx tsc --noEmit
```

Production build:

```bash
npm run build
```

---

# 🎯 Hackathon Requirements Covered

- ✅ Gmail Integration through Corsair
- ✅ Google Calendar Integration through Corsair
- ✅ AI Command Center
- ✅ Natural Language Scheduling
- ✅ Email Workflow Automation
- ✅ MCP Agent Chat
- ✅ Multi-Tenant Architecture
- ✅ Google Authentication
- ✅ Availability Checking
- ✅ Conflict Detection
- ✅ Local Data Access through Corsair Cache

---

# 🔮 Future Improvements

- Real-time Gmail webhooks
- Real-time Calendar webhooks
- AI Priority Inbox
- Keyboard shortcuts
- Global command palette
- Semantic email search
- Vector database search
- Team collaboration workflows
- Workspace analytics

---

# 🏆 Built For

**Corsair Command Center Builder Hackathon**

Built using Corsair's Gmail, Google Calendar, MCP, OAuth, Multi-Tenancy, and Local Caching capabilities to create a modern AI-powered productivity workspace.