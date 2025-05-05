// grade map
const gradingSystems = {
    UGC: {
        "A+": 4.0,
        "A": 3.75,
        "A-": 3.5,
        "B+": 3.25,
        "B": 3.0,
        "B-": 2.75,
        "C+": 2.5,
        "C": 2.25,
        "D": 2.0,
        "F": 0.0
    },
    NSU: {
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D+": 1.3,
        "D": 1.0,
        "F": 0.0
    },
    Custom: {}
};
// default grade map
let gradeMap = {
    ...gradingSystems.UGC
};

// sidebar drop down toggle function
function toggleDropdown() {
    const menu = document.getElementById("gradingDropdown");

    if (menu.classList.contains("scale-y-0")) {
        menu.classList.remove("scale-y-0", "opacity-0");
        menu.classList.add("scale-y-100", "opacity-100");
    } else {
        menu.classList.add("scale-y-0", "opacity-0");
        menu.classList.remove("scale-y-100", "opacity-100");
    }
}

// dropdown grading system select
function selectGradingSystem(system) {
    gradeMap = {
        ...gradingSystems[system]
    };
    toggleDropdown();
    updateCourseDropdowns();
    updateGradingInfo(system);
}
let customGrading = [];

// handle the custom grading form
function openCustomGrading() {
    const container = document.getElementById("customGradesContainer");
    container.innerHTML = "";

    customGrading.forEach(({
        letter,
        point
    }) => {
        const row = createCustomGradeRow(letter, point);
        container.appendChild(row);
    });

    document.getElementById("customModal").classList.remove("hidden");
}

function closeCustomGrading() {
    document.getElementById("customModal").classList.add("hidden");
}

function createCustomGradeRow(letter = "", point = "") {
    const div = document.createElement("div");
    div.className = "flex gap-2 items-center";

    div.innerHTML = `
      <input type="text" placeholder="Letter Grade" value="${letter}" class="w-1/2 p-2 border rounded uppercase" maxlength="3">
      <input type="number" placeholder="Point" value="${point}" min="0" max="4" step="0.01" class="w-1/2 p-2 border rounded">
      <button onclick="this.parentElement.remove()" class="text-red-500 text-lg ml-2">&#x2715;</button>
    `;

    return div;
}

function addCustomGradeRow() {
    const container = document.getElementById("customGradesContainer");
    container.appendChild(createCustomGradeRow());
}

function saveCustomGrading() {
    const container = document.getElementById("customGradesContainer");
    const rows = container.querySelectorAll("div");

    const newMap = {};
    for (const row of rows) {
        const inputs = row.querySelectorAll("input");
        const letter = inputs[0].value.trim().toUpperCase();
        const point = parseFloat(inputs[1].value);

        if (letter && !isNaN(point) && point >= 0 && point <= 4) {
            newMap[letter] = point;
        }
    }

    gradingSystems.Custom = newMap;
    gradeMap = {
        ...newMap
    };
    customGrading = Object.entries(newMap).map(([letter, point]) => ({
        letter,
        point
    }));

    closeCustomGrading();
    updateCourseDropdowns();
    updateGradingInfo("Custom");
}

function updateGradingInfo(systemName) {
    const label = document.getElementById("currentSystemLabel");
    const list = document.getElementById("gradingList");

    label.textContent = systemName;
    list.innerHTML = "";

    Object.entries(gradeMap)
        .sort((a, b) => b[1] - a[1]) // highest grade first
        .forEach(([grade, point]) => {
            const row = document.createElement("div");
            row.className = "flex justify-between items-center bg-gray-100 px-3 py-2 rounded shadow-sm";

            row.innerHTML = `
          <span class="text-gray-800 font-medium">${grade}</span>
          <span class="text-gray-600 font-semibold">${point.toFixed(2)}</span>
        `;

            list.appendChild(row);
        });
}

function updateCourseDropdowns() {
    const courseRows = document.querySelectorAll("#coursesContainer select");

    courseRows.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = Object.keys(gradeMap)
            .map(grade => `<option value="${grade}">${grade}</option>`)
            .join("");

        if (gradeMap[currentValue]) {
            select.value = currentValue;
        }
    });
}

function addCourse() {
    const container = document.getElementById("coursesContainer");

    const div = document.createElement("div");
    div.className = "flex flex-col md:flex-row gap-4 items-center";

    div.innerHTML = `
        <input type="text" placeholder="Course Title" class="p-3 border rounded-md w-full md:w-1/3">
        <input type="number" min="0" step="0.5" placeholder="Credit" class="p-3 border rounded-md w-full md:w-1/3 credit-input">
        <select class="p-3 border rounded-md w-full md:w-1/3">
        ${Object.keys(gradeMap).map(g => `<option>${g}</option>`).join("")}
        </select>
        <button type="button" class="text-red-500 hover:text-red-700 p-2" onclick="removeCourse(this)" title="Remove Course">
        &#x2715;
        </button>
    `;

    container.appendChild(div);
}

function removeCourse(button) {
    const row = button.parentElement;
    row.remove();
}

function calculateCgpa() {
    let prevCredits = parseFloat(document.getElementById("prevCredits").value);
    let currentCgpa = parseFloat(document.getElementById("currentCgpa").value);

    prevCredits = isNaN(prevCredits) ? 0 : prevCredits;
    currentCgpa = isNaN(prevCredits * currentCgpa) ? 0 : prevCredits * currentCgpa;

    let totalCredit = prevCredits;
    let multipliedCredit = currentCgpa;

    const courseRows = document.getElementById("coursesContainer").children;
    for (const row of courseRows) {
        const inputs = row.querySelectorAll("input, select");
        const credit = parseFloat(inputs[1].value);
        const grade = inputs[2].value;

        if (!isNaN(credit) && grade in gradeMap) {
            multipliedCredit += (credit * gradeMap[grade]);
            totalCredit += credit;
        }
    }

    const cgpa = totalCredit === 0 ? 0 : (multipliedCredit / totalCredit).toFixed(2);

    // Update Result Display
    document.getElementById("totalCredits").textContent = totalCredit.toFixed(2);
    document.getElementById("finalCgpa").textContent = cgpa;
}

// CGPA Live Validation
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("currentCgpa").addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (val > 4.0) e.target.value = 4.0;
        if (val < 0) e.target.value = 0;
    });

    // Add one course row on load
    addCourse();
});
document.getElementById("sidebarBackdrop").addEventListener("click", toggleSidebar);