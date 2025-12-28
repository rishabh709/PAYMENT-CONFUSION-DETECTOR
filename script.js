/**********************************************************
 * CONFIG
 **********************************************************/
const CALIBRATION_FILE = "cd.json";
const DWELL_TIME = 3000;

const CONFUSION_WINDOW = 3000;
const MIN_VISIBLE_TIME = 5000;
const TOOLTIP_MARGIN = 8;

const GAZE_DOT_SIZE = 100;

// Tracking thresholds
const REVISIT_THRESHOLD = 2;  // Number of visits to trigger auto-expand
const STRUGGLE_DWELL_TIME = 5000; // Dwell time threshold for struggle
const EXTERNAL_HELP_TIME = 15000;
const CHARGES_DWELL_TIME = 3000; // Dwell (ms) required to auto-expand charges

/**********************************************************
 * STATE
 **********************************************************/
let gazeDot;
let lastSection = null;
let enterTime = 0;
let isTrackingActive = false;
let consentGiven = false;

// section -> timestamps[]
const sectionHistory = new Map();

// section -> [tooltip elements]
const sectionTooltips = new Map();

// Track dwell time per section
const dwellTimeMap = new Map();

// Track revisit count per section
const revisitCountMap = new Map();

// Track if section is struggling
const strugglingMap = new Map();

// Inactivity tracking for escalation button
let lastActivityTime = Date.now();
let inactivityTimer = null;
let escalationShown = false;

// Collapsible summary tracking
let summaryExpanded = false;

/**********************************************************
 * SECTION DEFINITIONS
 **********************************************************/
const SECTIONS = {
    items: {
        selector: ".card h3:contains('Items'), .item",
        tooltips: [
            "These are the products in your cart.",
            "Review item details like size, color, and price before paying."
        ]
    },
    summary: {
        selector: ".summary",
        tooltips: [
            "This is your order summary.",
            "It shows subtotal, discounts, and final amount."
        ]
    },
    paymentMethods: {
        selector: ".payments button",
        tooltips: [
            "Choose your preferred payment method.",
            "Visa, Mastercard, and PayPal are supported."
        ]
    },
    checkoutDetails: {
        anchors: [
            {
                selector: "input[placeholder='Cardholder Name']",
                text: "Name as printed on your card.",
                position: "right"
            },
            {
                selector: "input[placeholder='Card Number']",
                text: "16-digit number on the front of your card.",
                position: "right"
            },
            {
                selector: "input[placeholder='Expiry']",
                text: "Expiration date of your card.",
                position: "left"
            },
            {
                selector: "input[placeholder='CVC']",
                text: "3-digit security code on the back of your card.",
                position: "right"
            },
            {
                selector: ".pay-btn",
                text: "Click Pay Now to complete your payment.",
                position: "bottom"
            }
        ]
    }


};

/**********************************************************
 * START BUTTON & CONSENT HANDLING
 **********************************************************/
function initConsentModal() {
    const modal = document.getElementById("consentModal");
    const acceptBtn = document.getElementById("acceptConsent");
    const declineBtn = document.getElementById("declineConsent");

    acceptBtn.onclick = () => {
        consentGiven = true;
        modal.classList.add("hidden");
        startTrackingInit();
    };

    declineBtn.onclick = () => {
        modal.classList.add("hidden");
        alert("Tracking disabled. You can enable it anytime by clicking the start button.");
    };
}

document.getElementById("startTracking").onclick = async () => {
    if (!consentGiven) {
        document.getElementById("consentModal").classList.remove("hidden");
    } else {
        startTrackingInit();
    }
};

async function startTrackingInit() {
    isTrackingActive = true;
    document.getElementById("startTracking").style.background = "#1ed637ff";
    document.getElementById("startTracking").innerText = "Tracking On";
    document.getElementById("trackingIndicator").classList.add("active");
    await initEyeTracking();
}

// Tracking indicator pause/resume
document.getElementById("trackingIndicator").onclick = () => {
    if (isTrackingActive) {
        isTrackingActive = false;
        document.getElementById("trackingIndicator").classList.remove("active");
        document.getElementById("trackingIndicator").title = "Click to resume tracking";
        document.getElementById("startTracking").style.background = "#ff9800";
        document.getElementById("startTracking").innerText = "Tracking Paused";
        webgazer.pause();
    } else {
        isTrackingActive = true;
        document.getElementById("trackingIndicator").classList.add("active");
        document.getElementById("trackingIndicator").title = "Click to pause tracking";
        document.getElementById("startTracking").style.background = "#1ed637ff";
        document.getElementById("startTracking").innerText = "Tracking On";
        webgazer.resume();
    }
};

// Human escalation button
document.getElementById("escalateButton").onclick = () => {
    alert("Thank you for reaching out! Our team will contact you shortly. In the meantime, here's what you might find helpful:\n\n• Try hovering over form fields\n• We can auto-expand collapsed sections for you\n• Email us at support@halelua.com");
};

/**********************************************************
 * INACTIVITY & ESCALATION TRACKING
 **********************************************************/
function resetInactivityTimer() {
    lastActivityTime = Date.now();
    
    // Clear existing timer
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Hide escalation button if shown
    if (escalationShown) {
        document.getElementById("escalateButton").classList.add("hidden");
        escalationShown = false;
    }
    
    // Set new timer for 10 minutes
    inactivityTimer = setTimeout(() => {
        if (!escalationShown) {
            document.getElementById("escalateButton").classList.remove("hidden");
            escalationShown = true;
            console.log("[ESCALATION] User inactive for 15 seconds. Showing chat option.");
        }
    }, EXTERNAL_HELP_TIME);
}

/**********************************************************
 * INIT WEBGAZER
 **********************************************************/
async function initEyeTracking() {
    webgazer.setRegression("ridge");
    webgazer.setTracker("clmtrackr");
    webgazer.setGazeListener(onGaze);
    webgazer.begin();

    webgazer.showVideo(false);
    webgazer.showPredictionPoints(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);

    createGazeDot();
}

/**********************************************************
 * LOAD CALIBRATION FILE
 **********************************************************/
async function loadCalibrationFromFile() {
    try {
        const res = await fetch(CALIBRATION_FILE);
        if (!res.ok) throw new Error();
        const data = await res.json();
        applyCalibrationData(data);
    } catch { }
}

/**********************************************************
 * APPLY CALIBRATION
 **********************************************************/
function applyCalibrationData(calibration) {
    if (!calibration.gazeData) return;
    const regression = webgazer.getRegression();
    calibration.gazeData.forEach(p =>
        regression.addData({ clientX: p.x, clientY: p.y }, p.x, p.y)
    );
}

/**********************************************************
 * GAZE LISTENER
 **********************************************************/
function onGaze(data) {
    if (!data || !isTrackingActive) return;
    moveDot(data.x, data.y);
    detectSection(data.x, data.y);
    // Reset inactivity timer on eye movement (shows progress)
    resetInactivityTimer();
}

/**********************************************************
 * GAZE DOT
 **********************************************************/
function createGazeDot() {
    gazeDot = document.createElement("div");
    gazeDot.id = "gaze-dot";
    gazeDot.style.cssText = `
        width:${GAZE_DOT_SIZE}px;
        height:${GAZE_DOT_SIZE}px;
        border-radius:50%;
        // background:red;
        position:fixed;
        transform:translate(-50%,-50%);
        pointer-events:none;
        z-index:9999;
    `;
    document.body.appendChild(gazeDot);
}

function moveDot(x, y) {
    gazeDot.style.left = x + "px";
    gazeDot.style.top = y + "px";
}

/**********************************************************
 * SECTION DETECTION
 **********************************************************/
function detectSection(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return;

    const section = getSectionFromElement(el);
    if (!section) return;

    // We'll auto-expand charges only after a short dwell on the charges area

    if (section !== lastSection) {
        // Track dwell time for last section
        if (lastSection) {
            const dwellTime = performance.now() - enterTime;
            trackDwellTime(lastSection, dwellTime);
            trackRevisit(lastSection);
        }
        
        lastSection = section;
        enterTime = performance.now();
        return;
    }

    const currentDwell = performance.now() - enterTime;
    // If gaze is inside the charges section and dwell exceeds threshold, expand
    if (section === "summary" && el.closest("#chargesSection") && currentDwell > CHARGES_DWELL_TIME) {
        expandCharges();
    }
    
    if (currentDwell > DWELL_TIME) {
        detectSectionConfusion(section);
    }
    
    // Check for struggle (extended dwell time)
    if (currentDwell > STRUGGLE_DWELL_TIME) {
        detectStruggle(section);
    }
}

function getSectionFromElement(el) {
    if (el.closest(".item")) return "items";
    if (el.closest(".summary")) return "summary";
    if (el.closest(".payments")) return "paymentMethods";
    if (el.closest(".checkout")) return "checkoutDetails";
    return null;
}

/**********************************************************
 * COLLAPSIBLE SUMMARY HANDLING
 **********************************************************/
function initCollapsibleSummary() {
    const chargesSection = document.getElementById("chargesSection");
    const chargesToggle = document.getElementById("chargesToggle");

    // Toggle on click
    chargesToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCharges();
    });
}

function toggleCharges() {
    const chargesSection = document.getElementById("chargesSection");
    
    if (chargesSection.classList.contains("collapsed")) {
        chargesSection.classList.remove("collapsed");
        console.log("[CHARGES] Expanded");
    } else {
        chargesSection.classList.add("collapsed");
        console.log("[CHARGES] Collapsed");
    }
}

function expandCharges() {
    const chargesSection = document.getElementById("chargesSection");
    if (chargesSection.classList.contains("collapsed")) {
        chargesSection.classList.remove("collapsed");
        console.log("[CHARGES] Auto-expanded on gaze");
    }
}

/**********************************************************
 * DWELL TIME TRACKING
 **********************************************************/
function trackDwellTime(section, dwellTime) {
    const current = dwellTimeMap.get(section) || 0;
    dwellTimeMap.set(section, current + dwellTime);
    console.log(`[DWELL] ${section}: ${(dwellTimeMap.get(section)/1000).toFixed(1)}s total`);
    
    // Send to analytics
    sendAnalyticsEvent('dwellTime', { section, dwellTime });
}

/**********************************************************
 * REVISIT TRACKING
 **********************************************************/
function trackRevisit(section) {
    const count = (revisitCountMap.get(section) || 0) + 1;
    revisitCountMap.set(section, count);
    console.log(`[REVISIT] ${section}: ${count} visits`);
    
    // If revisit threshold is hit and user is struggling, auto-expand
    if (count >= REVISIT_THRESHOLD && strugglingMap.get(section)) {
        autoExpandSection(section);
    }
}

/**********************************************************
 * STRUGGLE DETECTION & AUTO-EXPAND
 **********************************************************/
function detectStruggle(section) {
    if (strugglingMap.get(section)) return; // Already marked as struggling
    
    strugglingMap.set(section, true);
    console.log(`[STRUGGLE] ${section}: User is struggling, marked for auto-expand`);
    
    // If already revisited enough, expand now
    if ((revisitCountMap.get(section) || 0) >= REVISIT_THRESHOLD) {
        autoExpandSection(section);
    }
}

function autoExpandSection(section) {
    console.log(`[AUTO-EXPAND] Expanding ${section}`);
    
    // Send to analytics
    sendAnalyticsEvent('helpTriggered', { section, beforeDwellTime: performance.now() - enterTime });
    
    // Show help tooltips
    showSectionTooltips(section);
    
    // Visual feedback
    highlightSection(section);
}

function highlightSection(section) {
    const anchorEl = getSectionAnchor(section);
    if (anchorEl) {
        anchorEl.classList.add("viewed");
        setTimeout(() => anchorEl.classList.remove("viewed"), 3000);
    }
}

/**********************************************************
 * CONFUSION DETECTION (SECTION LEVEL)
 **********************************************************/
function detectSectionConfusion(section) {
    const now = Date.now();
    const history = sectionHistory.get(section) || [];
    const recent = history.filter(t => now - t <= CONFUSION_WINDOW);
    recent.push(now);
    sectionHistory.set(section, recent);

    if (recent.length >= 2) {
        console.log(`[CONFUSION] ${section}: Confusion detected`);
        sendAnalyticsEvent('confusionEvent', { section });
        showSectionTooltips(section);
        sectionHistory.set(section, []);
    }
} function positionTooltipExplicit(tooltip, rect, position) {
    const BASE_OFFSET = 10;
    const RIGHT_EXTRA_GAP = 23; // 👈 increase right-side gap here

    let x, y;

    switch (position) {
        case "right":
            x = rect.right + BASE_OFFSET + RIGHT_EXTRA_GAP;
            y = rect.top + (rect.height - tooltip.offsetHeight) / 2;
            break;

        case "left":
            x = rect.left - tooltip.offsetWidth - BASE_OFFSET;
            y = rect.top + (rect.height - tooltip.offsetHeight) / 2;
            break;

        case "bottom":
            x = rect.left + (rect.width - tooltip.offsetWidth) / 2;
            y = rect.bottom + BASE_OFFSET;
            break;
    }

    /* Clamp to viewport */
    if (x < 8) x = 8;
    if (x + tooltip.offsetWidth > window.innerWidth)
        x = window.innerWidth - tooltip.offsetWidth - 8;

    if (y < 8) y = 8;
    if (y + tooltip.offsetHeight > window.innerHeight)
        y = window.innerHeight - tooltip.offsetHeight - 8;

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}



/**********************************************************
 * SHOW ALL TOOLTIPS FOR A SECTION
 **********************************************************/
function showSectionTooltips(sectionKey) {
    if (activeSectionKey === sectionKey) return;

    hideAllSectionTooltips();

    const created = [];

    // Special handling for checkout details (field-level anchors)
    if (sectionKey === "checkoutDetails") {
        SECTIONS.checkoutDetails.anchors.forEach(def => {
            const el = document.querySelector(def.selector);
            if (!el) return;

            const rect = el.getBoundingClientRect();

            const tooltip = document.createElement("div");
            tooltip.className = "tooltip visible";
            tooltip.textContent = def.text;
            document.body.appendChild(tooltip);

            positionTooltipExplicit(tooltip, rect, def.position);
            created.push(tooltip);
        });
    }


    else {
        // Existing section-level behavior
        const anchorEl = getSectionAnchor(sectionKey);
        if (!anchorEl) return;

        const rect = anchorEl.getBoundingClientRect();
        const tips = SECTIONS[sectionKey].tooltips;

        tips.forEach((text, i) => {
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip visible";
            tooltip.textContent = text;
            document.body.appendChild(tooltip);

            positionTooltipNearSection(tooltip, rect, sectionKey, i);
            created.push(tooltip);
        });
    }

    sectionTooltips.set(sectionKey, created);
    activeSectionKey = sectionKey;

    setTimeout(() => {
        if (activeSectionKey === sectionKey) {
            hideAllSectionTooltips();
        }
    }, MIN_VISIBLE_TIME);
}
function positionTooltipBesideElement(tooltip, rect, placeRight) {
    const offset = 10;

    let x = placeRight
        ? rect.right + offset           // RIGHT
        : rect.left - tooltip.offsetWidth - offset; // LEFT

    let y = rect.top + (rect.height - tooltip.offsetHeight) / 2;

    // Clamp horizontally
    if (x < 8) x = rect.right + offset;
    if (x + tooltip.offsetWidth > window.innerWidth)
        x = rect.left - tooltip.offsetWidth - offset;

    // Clamp vertically
    if (y < 8) y = 8;
    if (y + tooltip.offsetHeight > window.innerHeight)
        y = window.innerHeight - tooltip.offsetHeight - 8;

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}


/**********************************************************
 * STACKED TOOLTIP POSITIONING
 **********************************************************/
function positionTooltipStacked(tooltip, index) {
    tooltip.style.left = 20 + "px";
    tooltip.style.top = 120 + index * (tooltip.offsetHeight + TOOLTIP_MARGIN) + "px";
}

/**********************************************************
 * UTIL
 **********************************************************/
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}
function getSectionAnchor(sectionKey) {
    switch (sectionKey) {
        case "items":
            return document.querySelector(".card"); // items card
        case "summary":
            return document.querySelector(".summary");
        case "paymentMethods":
            return document.querySelector(".payments");
        case "checkoutDetails":
            return document.querySelector(".checkout");
        default:
            return null;
    }
}
function positionTooltipNearSection(tooltip, rect, sectionKey, index) {
    const spacing = TOOLTIP_MARGIN;
    let x, y;

    // Decide side
    const isRightColumn =
        sectionKey === "checkoutDetails" || sectionKey === "paymentMethods";

    if (isRightColumn) {
        // Place tooltips to the RIGHT of checkout
        x = rect.right + 12;
    } else {
        // Place tooltips to the LEFT of left-column sections
        x = rect.left - tooltip.offsetWidth - 12;
    }

    // Vertical stacking aligned with section top
    y = rect.top + index * (tooltip.offsetHeight + spacing);

    // Prevent overflow bottom
    if (y + tooltip.offsetHeight > window.innerHeight) {
        y = window.innerHeight - tooltip.offsetHeight - 12;
    }

    // Prevent overflow left
    if (x < 8) x = 8;

    // Prevent overflow right
    if (x + tooltip.offsetWidth > window.innerWidth) {
        x = window.innerWidth - tooltip.offsetWidth - 8;
    }

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}
let activeSectionKey = null;
function hideAllSectionTooltips() {
    for (const [sectionKey, tooltips] of sectionTooltips.entries()) {
        tooltips.forEach(t => t.remove());
    }
    sectionTooltips.clear();
    activeSectionKey = null;
}

/**********************************************************
 * INITIALIZATION
 **********************************************************/
document.addEventListener("DOMContentLoaded", () => {
    initConsentModal();
    initCollapsibleSummary();
    
    // Hide escalation button initially
    document.getElementById("escalateButton").classList.add("hidden");
    
    // Setup activity tracking
    setupActivityListeners();
    
    // Start inactivity timer
    resetInactivityTimer();
    
    // Add link to analytics dashboard
    addAnalyticsLink();
    
    console.log("Consent modal initialized. User must give consent before tracking.");
});

/**********************************************************
 * ANALYTICS BRIDGE
 **********************************************************/
function addAnalyticsLink() {
    const analyticsBtn = document.createElement("a");
    analyticsBtn.href = "analytics.html";
    analyticsBtn.className = "analytics-link";
    analyticsBtn.title = "View Analytics Dashboard";
    analyticsBtn.innerHTML = '<i class="fas fa-chart-line"></i>';
    document.body.appendChild(analyticsBtn);
}

function sendAnalyticsEvent(type, data) {
    try {
        // Send to analytics page if it's open
        window.opener?.postMessage({ type, ...data }, window.location.origin);
        window.parent?.postMessage({ type, ...data }, window.location.origin);
    } catch (e) {
        // Silently fail if no analytics window
    }
}

/**********************************************************
 * ACTIVITY LISTENERS
 **********************************************************/
function setupActivityListeners() {
    // Track form input
    document.addEventListener("input", resetInactivityTimer);
    
    // Track clicks
    document.addEventListener("click", (e) => {
        // Don't reset timer on escalation button click
        if (!e.target.closest("#escalateButton")) {
            resetInactivityTimer();
        }
    });
}


    // Toggle charges on total click (for breakdown)
    const totalDisplay = document.querySelector(".summary-total-display");
    if (totalDisplay) {
        totalDisplay.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleCharges();
        });
    }
