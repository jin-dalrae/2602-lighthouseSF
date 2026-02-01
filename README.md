# Lighthouse SF — City Intelligence Platform

> **A 9-Agent Autonomous Urban Analytics System powered by Google Gemini 2.5 & Veo 3.1**

![Status](https://img.shields.io/badge/System-Online-emerald) ![Agents](https://img.shields.io/badge/Agents-9_Active-blue) ![AI](https://img.shields.io/badge/Model-Gemini_2.5_Pro-purple)

## 📖 Executive Summary

**Lighthouse SF** is a next-generation urban intelligence platform designed to predict city dynamics before they become crises. Unlike traditional dashboards that display static historical data, Lighthouse utilizes a mesh of **9 autonomous AI agents** to actively fetch, cross-reference, and debate data from Public Safety, Infrastructure, and Land Use sources.

The system features **Marathon Orchestrator**, a logic loop that ensures no signal is lost by tracking issues over time, and a **Video Agent** that converts complex data reports into cinematic executive briefs using **Veo 3.1**.

---

## 🏗 System Architecture

The platform operates on a **3x3 Agent Grid**, covering three critical domains with three distinct intelligence sources per domain.

| Domain | 📊 Data Agent (SODA) | 📰 News Agent (Scraper) | 🏛 Gov Agent (Legistar) |
| :--- | :--- | :--- | :--- |
| **Public Safety (PS)** | Police Incidents, Fire Calls | NBC Bay Area, SF Chronicle | Safety Committee Agendas |
| **Infrastructure (IU)** | 311 Cases, Potholes | SFPUC Alerts, Transit News | Budget & Finance Files |
| **Land Use (LZ)** | Building Permits, Housing | Development News | Land Use Committee |

### The 9-Stage Pipeline

1.  **Parallel Fetch**: All 9 agents simultaneously query SF Open Data (SODA), external news APIs, and government legislative portals.
2.  **Analysis**: Each agent uses **Gemini 2.5 Flash** to extract trends and anomalies from raw payloads.
3.  **Consolidation**: Three "Area Consolidators" (AI Nodes) merge findings for their specific domain (e.g., PS Consolidator merges Crime Data + Safety News).
4.  **Cross-Area Roundtable**: A rigorous debate phase where domains cross-check for conflicts (e.g., *Does this road closure block fire trucks?*).
5.  **Issue Card Generation**: The **Master Orchestrator** synthesizes the debate into actionable "Issue Cards" with severity scores and 10-year forecasts.
6.  **Visualization**: A Chart Agent dynamically generates React Recharts configurations based on the data.
7.  **Marathon Loop**: The system checks past issues against fresh data, auto-escalating worsening trends.
8.  **Video Synthesis**: The **Video Agent** creates a 30s photorealistic video brief using **Veo 3.1** and **Imagen** to communicate priority issues to stakeholders.

---

## 🧠 Key Innovations

### 1. Marathon Orchestrator (The "Memory")
Most dashboards forget a problem once the data refreshes. Marathon **remembers**.
*   **Tracks** issues over weeks/months.
*   **Escalates** items that are stagnant or worsening.
*   **Resolves** items only when data confirms the fix.

### 2. Cross-Area Reasoning
Lighthouse detects second-order effects that humans miss.
*   *Example:* A spike in **Zoning Permits** (Land Use) combined with **Traffic Complaints** (Infrastructure) predicts a future **Emergency Response Delay** (Public Safety).

### 3. Generative Executive Briefs
Stakeholders don't always have time to read JSON logs.
*   **Video Agent** analyzes the top critical issue.
*   Generates a storyboard and prompts **Veo 3.1** to create a high-definition video narrative of the situation (e.g., "Drone shot of flooding in Mission District").

---

## 🛠 Tech Stack

*   **Frontend**: React 19, Tailwind CSS, Lucide Icons.
*   **AI Core**: Google GenAI SDK (`@google/genai`).
    *   **Reasoning**: Gemini 1.5 Pro / 2.5 Pro.
    *   **Speed**: Gemini 2.5 Flash.
    *   **Video**: Veo 3.1 (`veo-3.1-fast-generate-preview`).
    *   **Grounding**: Google Search Grounding for live news verification.
*   **Data Sources**: SF Open Data API (SODA), Custom News Agent APIs.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Google Cloud Project with Vertex AI / Gemini API enabled.
*   **Veo 3.1 Access**: Required for video generation features.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set your API Key:
    *   The app uses `process.env.API_KEY` injected by the environment or prompts the user via the AI Studio overlay for Veo.
4.  Run the development server:
    ```bash
    npm start
    ```

---

## 🔮 Future Roadmap

*   **Real-time Sensor Integration**: IoT feeds from traffic cameras.
*   **Budget Impact Analysis**: correlating infrastructure spend with repair velocity.
*   **Citizen Feedback Loop**: AI analysis of social media sentiment regarding city services.

---

*Lighthouse SF — Illuminating the future of the city.*
