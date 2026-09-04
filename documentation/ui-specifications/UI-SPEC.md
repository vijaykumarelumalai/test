# Granular UI/UX Specification - VK Traders
**Document Version:** 1.0.0  
**Target Platform:** Mobile PWA + Responsive Desktop Dashboard  
**Date:** 2026-09-04  

---

## SCREEN 1: Super Admin Command Center (Dashboard)
* **Purpose:** Centralized oversight of active worker counts, monthly expenditures, today's attendance roster with inline marking, visual cash-flow charts, and recent activity streams. Matches client visual reference mockup.
* **Entry Points:** Direct navigation upon Super Admin authentication (`/admin/dashboard`).

### 1. Top KPI Metric Cards (5 Cards)
1. **Total Labour Count:**
   * Style: Primary Blue card with worker group icon.
   * Metric: Dynamic count of active workers (e.g. `128`), trend indicator (e.g. `↑ 5% vs last month`).
2. **Permanent Labour:**
   * Style: Emerald Green card with single user icon.
   * Metric: Count of permanent workers (e.g. `78`), trend indicator (`↑ 3% vs last month`).
3. **Temporary Labour:**
   * Style: Amber/Orange card with clock/worker icon.
   * Metric: Count of temporary workers (e.g. `50`), trend indicator (`↑ 8% vs last month`).
4. **Amount Paid to Labour (Current Month):**
   * Style: Purple/Violet card with Indian Rupee (₹) icon.
   * Metric: Gross wages earned this month (e.g. `₹4,75,000`), trend indicator (`↑ 12% vs last month`).
5. **Total Advances & Loans:**
   * Style: Crimson/Rose Red card with hand-holding-cash icon.
   * Metric: Sum of unsettled cash advances and active loans (e.g. `₹1,20,000`), trend indicator (`↓ 5% vs last month`).

### 2. Mark Attendance (Today) Widget
* **Header Controls:**
  * Title: "Mark Attendance (Today)" with calendar icon.
  * Date Picker: Displays active date (defaults to Today, e.g. `Mon, 16 Jun 2025`), allows selecting any date.
  * Search Input: Placeholder `"Search labour by name, ID, or mobile..."`.
  * Filter Dropdown: Options: `All Labour`, `Permanent Only`, `Temporary Only`, `Construction Site A`, `Site B`.
  * Quick Bulk Button: `"Mark All Present"` shortcut.
* **Roster Table Columns:**
  * `[Checkbox]`: Multi-select for bulk status changes.
  * `#`: Row index.
  * `Labour ID`: Formatted bold badge (e.g. `VK-001`, `VK-002`).
  * `Name`: Worker full name with avatar initials.
  * `Type`: Pill badge (`Permanent` in light green, `Temporary` in light orange).
  * `Department/Site`: e.g. "Construction Site A".
  * `Attendance Action Buttons`:
    * `Present`: Green button (solid when selected, outline when unselected).
    * `Absent`: Red button (solid when selected, outline when unselected).
    * `Half Day`: Yellow/Amber button (solid when selected, outline when unselected).
* **Footer Action:**
  * Save Button: Primary Blue `"Save Attendance"`, loading state `"Saving..."`, disabled when no unsaved changes.
  * Pagination: Page controls `Showing 1 to 5 of 128 labours`.

### 3. Analytics Charts (Right Column)
* **Attendance Overview (Today):**
  * Donut/radial chart with center total `128 Total`.
  * Legend: `Present` (Green count), `Absent` (Red count), `Half Day` (Amber count).
* **Payment & Advances (This Month):**
  * Two-column comparison bar chart: Blue bar (`Amount Paid ₹4,75,000`) vs Red bar (`Advances ₹1,20,000`).

### 4. Bottom Activity Feeds (3 Cards)
* **Recent Labour Added:** Table showing `#`, `Name`, `Type`, `Date`. Link: `"View All →"`.
* **Recent Payments:** Table showing `#`, `Name`, `Amount (₹)`, `Date`. Link: `"View All →"`.
* **Pending Advances:** Table showing `#`, `Name`, `Amount (₹)`, `Date`. Link: `"View All →"`.

---

## SCREEN 2: Labour Directory & Onboarding Modal
* **Purpose:** Register workers, auto-generate sequential `VK-XXX` ID, auto-assign default PIN, and trigger Tamil/English welcome message.
* **Add Worker Modal Fields:**
  * `Full Name`: Text input (Required, min 2 chars).
  * `Mobile Number`: Tel input (Required, exactly 10 digits).
  * `Worker Type`: Segmented control (`Permanent` / `Temporary`).
  * `Department / Site`: Dropdown with text add option.
  * `Daily Wage Rate (₹)`: Number input (Required, e.g. `800`).
  * `Joining Date`: Date picker (Defaults to today).
  * `Emergency Contact`: Optional 10-digit number.
* **Post-Submit Confirmation & Bilingual SMS Card:**
  * Modal displays:
    * Assigned Labour ID: `VK-005`
    * Generated PIN: `4567` (last 4 digits)
    * **English Message:** "You are onboarded as a permanent worker at VK Traders. Welcome to the VK Traders family!..."
    * **Tamil Message:** "நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள்..."
    * Action 1: `"Copy Message"`
    * Action 2: `"Open WhatsApp"` (Direct `wa.me` deep link pre-filled with phone & message).

---

## SCREEN 3: Worker Mobile Self-Service Portal
* **Purpose:** Mobile-optimized read-only view for individual labourers to verify their attendance and wages anywhere, anytime.
* **Authentication:** Clean mobile PIN pad: Mobile Phone Number + 4-digit PIN.
* **Dashboard Elements:**
  * Worker Header: Worker Photo/Initials, Name, `VK-001`, `Permanent Labour`, VK Traders Badge.
  * Month Selector: Previous / Current Month carousel.
  * 4 Summary Metric Cards:
    1. Days Worked: `22.5 Days` (Present + Half Days).
    2. Gross Earned: `₹18,000`.
    3. Total Advances Deducted: `₹3,000`.
    4. Net Balance Payable: `₹15,000` (highlighted in prominent green card).
  * Interactive Calendar / List:
    * Displays day-by-day status: Green badge for Present, Yellow for Half-Day, Red for Absent.
    * Displays the recorded daily wage earned for that day.
  * Advances History List: Date, Amount, Reason.
