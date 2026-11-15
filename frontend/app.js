
const colors = {
    critical: "#A34F40",
    high: "#C18B4B",
    medium: "#A49A78",
    low: "#78836A",
    sage: "#78836A",
    clay: "#B77B62",
    ochre: "#C18B4B",
    stone: "#99978A"
};

// Display today's date
document.getElementById("current-date").textContent =
    new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

// Create a reusable donut chart
function createDonutChart(elementId, labels, values, chartColors) {
    const canvas = document.getElementById(elementId);

    return new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 7,
                spacing: 4
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "73%",

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18,
                        color: "#777365",
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Load incidents from our FastAPI backend
async function loadDashboard() {
    try {
        const response = await fetch("/incidents");

        if (!response.ok) {
            throw new Error("Could not load incidents");
        }

        const incidents = await response.json();

        // Update statistic cards
        document.getElementById("total-incidents").textContent =
            incidents.length;

        document.getElementById("critical-incidents").textContent =
            incidents.filter(i => i.severity === "Critical").length;

        document.getElementById("high-incidents").textContent =
            incidents.filter(i => i.severity === "High").length;

        document.getElementById("open-incidents").textContent =
            incidents.filter(i => i.status === "Open").length;

        // Count incidents by severity
        const severityLabels = ["Critical", "High", "Medium", "Low"];

        const severityValues = severityLabels.map(level =>
            incidents.filter(i => i.severity === level).length
        );

        createDonutChart(
            "severity-chart",
            severityLabels,
            severityValues,
            [
                colors.critical,
                colors.high,
                colors.medium,
                colors.low
            ]
        );

        // Count incidents by category
        const categoryLabels = [
            "Unauthorized Access",
            "Failed Login",
            "Phishing",
            "Malware"
        ];

        const categoryValues = categoryLabels.map(category =>
            incidents.filter(i => i.category === category).length
        );

        createDonutChart(
            "category-chart",
            categoryLabels,
            categoryValues,
            [
                colors.sage,
                colors.clay,
                colors.ochre,
                colors.stone
            ]
        );

        // Display recent incidents
        const table = document.getElementById("incident-table");

        document.getElementById("record-count").textContent =
            `${incidents.length} records`;

        if (incidents.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No incidents to display yet.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = incidents.map(incident => `
            <tr>
                <td>${escapeHTML(incident.title)}</td>
                <td>${escapeHTML(incident.category)}</td>
                <td>
                    <span class="severity-label severity-${incident.severity.toLowerCase()}">
                        ${escapeHTML(incident.severity)}
                    </span>
                </td>
                <td>
                    <span class="status-label">
                        ${escapeHTML(incident.status)}
                    </span>
                </td>
            </tr>
        `).reverse().join("");

    } catch (error) {
        console.error("Dashboard error:", error);
        document.getElementById("incident-table").innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    Unable to load incidents. Check the server connection.
                </td>
            </tr>
        `;
    }
}

// Safely display text received from the API
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

loadDashboard();
