# PAYMENT CONFUSION DETECTOR

# 🎯 Payment Confusion Detector

A real-time **eye-tracking system** that detects user confusion during online payment checkout and provides intelligent, context-aware help to improve conversion rates and user experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Analytics Dashboard](#analytics-dashboard)
- [How It Works](#how-it-works)
- [Contributing](#contributing)

---

## 🔍 Overview

**Payment Confusion Detector** is an innovative solution designed to reduce cart abandonment and improve checkout experience by:

1. **Detecting user confusion** in real-time using eye-tracking technology
2. **Auto-expanding help tooltips** when users struggle with form fields
3. **Tracking user behavior** across checkout sections
4. **Providing human escalation** when needed
5. **Analyzing patterns** through a comprehensive analytics dashboard

This tool is perfect for e-commerce platforms, payment processors, and UX researchers who want to understand and optimize the checkout experience.

---

## ✨ Key Features

### 1. **Eye Tracking with WebGazer** 👁️
- Real-time gaze detection using camera
- Privacy-focused (no images stored)
- Smooth tracking with visual gaze dot indicator
- Automatic calibration support

### 2. **Confusion Detection** 🚨
- Detects when users repeatedly look at the same section
- Monitors dwell time (how long users look at each area)
- Triggers automatic help when confusion is detected
- Tracks confusion events for analytics

### 3. **Smart Auto-Expand Help** 💡
- Context-aware tooltips for each checkout section:
  - **Items**: Product details guidance
  - **Summary**: Order breakdown explanation
  - **Payment Methods**: Payment option information
  - **Checkout Details**: Field-by-field input help
- Only shows help when user is actually struggling
- Auto-hides after optimal viewing time

### 4. **Dwell Time & Revisit Tracking** ⏱️
- Measures how long users spend on each section
- Counts how many times users revisit sections
- Identifies patterns that indicate confusion
- Cumulative tracking for session analysis

### 5. **Human Escalation Button** 🎧
- Non-intrusive escalation option
- Appears after inactivity detection
- Provides support contact information
- Always accessible to users

### 6. **Tracking Controls** 🎛️
- Eye icon indicator (Gray = Off, Green = Active)
- Pause/Resume tracking anytime
- Consent modal for privacy compliance
- Start/Stop button with clear status

### 7. **Comprehensive Analytics Dashboard** 📊
- Real-time metrics visualization
- Gaze heatmap showing focus areas
- Help impact analysis (before/after)
- Dwell time breakdowns by section
- Revisit pattern analysis
- Event timeline and logging
- Data export capabilities

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Page structure and markup
- **CSS3** - Styling and responsive design
- **JavaScript (Vanilla)** - Core logic and interactivity

### Eye Tracking
- **[WebGazer.js](https://webgazer.cs.brown.edu/)** - Real-time gaze detection
- **CLMTrackr** - Face tracking for gaze estimation
- **Ridge Regression** - Gaze calibration

### Data Visualization
- **Canvas API** - Heatmap rendering
- **Charts.js** - Data visualization (for advanced analytics)
- **LocalStorage** - Session data persistence

### Icons & UI
- **Font Awesome 6.4** - Icon library
- **Responsive Design** - Mobile-friendly interface

---

## 📦 Installation & Setup

### Prerequisites
- Modern web browser with camera access (Chrome, Firefox, Edge, Safari)
- Camera/webcam connected to your device
- Basic knowledge of HTTP servers

### Step 1: Clone or Download the Project

```bash
# Clone the repository
git clone https://github.com/yourusername/payment-confusion-detector.git
cd payment-confusion-detector
```

### Step 2: Set Up a Local Server

Since WebGazer requires HTTPS or localhost, you need to run a local server:

#### Option A: Using Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option B: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8000
```

#### Option C: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Step 3: Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

### Step 4: Grant Camera Permissions

1. When prompted, allow the application to access your camera
2. Click the "I Agree" button on the consent modal
3. Click "Start Tracking" to begin eye tracking
4. The eye indicator in the corner should turn green

---

## 🚀 How to Use

### For End Users (Checkout Page)

1. **Start Tracking**: Click the "Tracking Off" button in the top-left
2. **Grant Permissions**: Allow camera access when prompted
3. **Consent**: Click "I Agree" to confirm tracking consent
4. **Browse Checkout**: Navigate through the payment form normally
5. **Get Help**: Tooltips will automatically appear if you seem confused
6. **Need Help?**: Click the "Would you like to chat?" button anytime
7. **Pause Tracking**: Click the eye icon to pause and resume

### For Developers / Analysts

#### View Analytics
- Click the chart icon (📊) in the bottom-right corner
- Open `analytics.html` in a new tab
- Monitor real-time metrics and user behavior
- Export session data as JSON

#### Access Console Logs
- Open DevTools (F12 or Cmd+Option+I)
- Monitor console logs for debugging:
  - `[DWELL]` - Dwell time tracking
  - `[REVISIT]` - Section revisits
  - `[CONFUSION]` - Confusion events
  - `[STRUGGLE]` - Struggle detection
  - `[AUTO-EXPAND]` - Help triggered
  - `[CHARGES]` - Collapsible section toggles

#### Calibrate Eye Tracking
- Click and drag across the page to calibrate
- WebGazer will improve accuracy with more data points
- Alternatively, load pre-calibrated data from `cd.json`

---

## 📁 Project Structure

```
payment-confusion-detector/
├── index.html              # Main checkout page
├── script.js               # Core eye-tracking and logic
├── style.css               # Styling and layout
├── analytics.html          # Analytics dashboard page
├── analytics.js            # Analytics visualization logic
├── analytics.css           # Analytics dashboard styles
├── cd.json                 # Calibration data (optional)
├── data.json               # Sample session data
├── README.md               # This file
├── FEATURES.md             # Detailed feature documentation
└── ANALYTICS.md            # Analytics system documentation
```

### File Descriptions

| File | Purpose |
|------|---------|
| `index.html` | Main checkout UI with payment form, tooltip system, and tracking controls |
| `script.js` | Eye tracking listener, confusion detection, auto-expand logic, state management |
| `style.css` | Modern responsive styling for checkout and eye-tracking UI |
| `analytics.html` | Dashboard page for viewing metrics and heatmaps |
| `analytics.js` | Data visualization and analytics computation |
| `analytics.css` | Dashboard styling with gradient backgrounds and charts |
| `cd.json` | Stores calibration data for improved gaze accuracy |
| `data.json` | Sample session data for testing analytics |

---

## ⚙️ Configuration

Edit constants in `script.js` to customize behavior:

```javascript
// Timing Thresholds
const DWELL_TIME = 3000;              // ms before confusion detection
const STRUGGLE_DWELL_TIME = 5000;     // ms before struggle detection
const EXTERNAL_HELP_TIME = 15000;     // ms before escalation button shows
const CHARGES_DWELL_TIME = 3000;      // ms before charges section auto-expands

// Tracking Thresholds
const REVISIT_THRESHOLD = 2;          // visits before help triggers
const CONFUSION_WINDOW = 3000;        // ms window for confusion detection

// Visual Settings
const GAZE_DOT_SIZE = 100;            // pixel size of gaze indicator
const TOOLTIP_MARGIN = 8;             // spacing between stacked tooltips
const MIN_VISIBLE_TIME = 5000;        // ms tooltips stay visible
```

---

## 📊 Analytics Dashboard

### Metrics Tracked

| Metric | Description |
|--------|-------------|
| **Avg. Time to Complete** | Average checkout duration (seconds) |
| **Confusion Events** | Total number of confusion detections |
| **Conversion Rate** | Percentage of users who completed payment |
| **Sessions Tracked** | Total number of tracking sessions |
| **Dwell Time** | Time spent per section (breakdown) |
| **Revisit Count** | How many times each section was revisited |
| **Help Impact** | Before/after metrics when help was shown |

### Visualizations

1. **Gaze Heatmap** - Shows where users looked most
2. **Dwell Time Chart** - Bar chart of time per section
3. **Revisit Table** - Detailed section-by-section analysis
4. **Help Impact Cards** - Conversion improvement metrics
5. **Event Timeline** - Chronological log of all events

### Exporting Data

Click "Export Report" on the analytics dashboard to download session data as JSON for further analysis.

---

## 🧠 How It Works

### Eye Tracking Pipeline

```
Camera Feed
    ↓
WebGazer (gaze detection)
    ↓
onGaze() callback
    ↓
detectSection() → Identify which section user is looking at
    ↓
trackDwellTime() → Measure time spent
    ↓
trackRevisit() → Count visits to section
    ↓
detectSectionConfusion() → Check for rapid re-entry
    ↓
detectStruggle() → Extended dwell + revisit = struggle
    ↓
autoExpandSection() → Show helpful tooltips
    ↓
showSectionTooltips() → Display context-aware help
```

### Confusion Detection Algorithm

Confusion is detected when:
1. **Dwell Time Exceeded**: User looks at section > 5 seconds
2. **AND Revisit Threshold**: User has revisited section ≥ 2 times
3. **OR Rapid Re-entry**: User re-enters section within 3-second window

When triggered → Auto-expand help tooltips with visual highlight

### Help Display Strategy

- **Context-aware**: Different tooltips for each checkout section
- **Non-intrusive**: Only shows when user needs it
- **Auto-dismiss**: Hides after optimal viewing time (5 seconds)
- **Persistent**: Stays visible if user is still looking
- **Escalation**: "Chat with team" button appears if no interaction

---

## 🔒 Privacy & Consent

- **Consent Modal**: Required before any tracking begins
- **No Image Storage**: Camera feed is processed in real-time only
- **Local Storage**: All data stored on user's device
- **User Control**: Pause/resume tracking anytime
- **GDPR Compliant**: Transparent data practices

---

## 🐛 Troubleshooting

### Camera Not Working
- Check browser permissions (Settings → Privacy)
- Ensure HTTPS or localhost (WebGazer requirement)
- Try a different browser
- Restart browser and reload page

### Inaccurate Gaze Tracking
- Ensure good lighting conditions
- Position camera 50-70cm from face
- Calibrate by clicking around the page
- Clear browser cache and reload

### Tooltips Not Showing
- Check console (F12) for errors
- Verify gaze detection is active (green eye icon)
- Ensure you're meeting dwell/revisit thresholds
- Check style.css for tooltip visibility settings

### Analytics Data Missing
- Verify browser supports LocalStorage
- Check Private/Incognito mode (disables storage)
- Open analytics.html in same window or popup
- Export data while tracking is active

---

## 📈 Performance Metrics

- **Gaze Detection**: ~30 FPS (60ms latency)
- **Memory Usage**: ~50-100 MB (with video stream)
- **Bundle Size**: ~150 KB (HTML/CSS/JS only)
- **Browser Support**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+

---

## 🙋 Support & Questions

For issues, questions, or feature requests:
- **Email**: support@halelua.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/payment-confusion-detector/issues)
- **Documentation**: See FEATURES.md and ANALYTICS.md

---

## 🎓 References & Resources

- [WebGazer.js Documentation](https://webgazer.cs.brown.edu/)

---

## 🚀 What's Next?

- [ ] Integrate with real payment gateway
- [ ] Add heatmap-driven UI redesign suggestions
- [ ] Implement predictive help (show before confusion)
- [ ] Build mobile app version
- [ ] Add accessibility features
- [ ] Create API for third-party integration

---

**Made with ❤️ for better checkout experiences**

Last Updated: December 2025
