# TekVision Agent Desktop Automation Test

This repository contains a Playwright-based automation suite for the Mock Agent Desktop. It validates end-to-end workflows, handles dynamic data injection via API, and identifies several UI/logical defects.

##  Getting Started

### Prerequisites

* **Node.js**: Latest LTS version.

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-folder>

# Install dependencies
npm install
npx playwright install

```

### Running the Tests

The suite supports dynamic environment switching to verify bug fixes.

**1. Run against the default environment (Buggy version: `/desktop`)**
Expect 5 passed scenarios and 1 specific failure (Badge count bug).

```bash
npx playwright test --headed

```

**2. Run against the fixed environment (Fixed version: `/desktopv2`)**
Expect all tests to pass.

```powershell
# Windows PowerShell
$env:DESKTOP_PATH="/desktopv2"; npx playwright test --headed

```

---

##  Automation Strategy & Coverage

The test suite (`tests/desktop.spec.ts`) implements a **Data-Driven Testing (DDT)** approach to ensure high efficiency and coverage:

* **Full Scenario Matrix**: Covers all 5 preset scenarios (Billing, VIP, Unauthenticated, etc.) in a single loop.
* **Data Integrity Validation**: Instead of hardcoding UI values, the suite verifies that the `Account ID` and `Journey Name` injected via the API payload are correctly rendered on the respective UI tabs.
* **Dynamic Interaction**:
* Automates the **Agent Status** transition to "Ready".
* Handles the **Chat Invitation** acceptance.
* Simulates **Live Chat Messaging** and validates the system's "echo" response behavior.


* **State-Specific Logic**: Includes logic to switch between "Interaction Information" and "Customer Profile" tabs to verify data visibility, particularly for **Unauthenticated** sessions.

---

## 🐛 Bug Report

| ID | Title | Method | Expected | Actual |
| --- | --- | --- | --- | --- |
| **001** | **Badge Count Freeze** | **Auto** | Badge should show total count (e.g. 40). | Frozen at "35 messages" in `/desktop`. |
| **002** | **Text Overflow** | Manual | Long strings should wrap within bubbles. | Text breaks UI container/bubble. |
| **003** | **Shortcut Mismatch** | Manual | `Shift+Enter` should create a new line. | Inserts a space instead. |
| **004** | **Offline Guardrail** | Manual | Block status change during active chat. | Allowed to go Offline while chatting. |

---

## 📊 Summary Report

* **Features Tested**: API run creation, Agent Status handling, Profile data rendering (Auth vs. Unauth), Live chat messaging, and Message count accuracy.
* **Bug Discovery**: Successfully identified 1 critical data bug via automation and 3 UI/UX defects via exploratory testing.
* **Environment Parity**: Confirmed that Defect #001 is resolved in `/desktopv2`, while others persist, indicating areas for further refinement.

