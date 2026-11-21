
// Select HTML elements
const expenseForm = document.getElementById("expenseForm");

const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseDateInput = document.getElementById("expenseDate");

const expenseList = document.getElementById("expenseList");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const sortFilter = document.getElementById("sortFilter");

const totalSpent = document.getElementById("totalSpent");
const monthlySpent = document.getElementById("monthlySpent");
const expenseCount = document.getElementById("expenseCount");

const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const formHeading = document.getElementById("formHeading");

const budgetForm = document.getElementById("budgetForm");
const budgetInput = document.getElementById("budgetInput");

let editingExpenseId = null;

// Load saved information
let expenses = JSON.parse(localStorage.getItem("myExpenses")) || [];

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;

const today = new Date();

document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-NP", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

expenseDateInput.value = getTodayDate();


// Return today's date
function getTodayDate() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Format Nepali currency
function formatMoney(amount) {

    return "NPR " + amount.toLocaleString("en-NP", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


// Save expenses
function saveExpenses() {

    localStorage.setItem(
        "myExpenses",
        JSON.stringify(expenses)
    );

}


// Save budget
function saveBudget() {

    localStorage.setItem(
        "monthlyBudget",
        String(monthlyBudget)
    );

}


// Get current month's expenses
function getCurrentMonthExpenses() {

    const month = today.getMonth();
    const year = today.getFullYear();

    return expenses.filter(expense => {

        const date = new Date(expense.date + "T00:00:00");

        return date.getMonth() === month &&
               date.getFullYear() === year;

    });

}


// Update summary cards
function updateSummary() {

    const total = expenses.reduce((sum, expense) => {

        return sum + expense.amount;

    }, 0);


    const monthTotal = getCurrentMonthExpenses()
        .reduce((sum, expense) => sum + expense.amount, 0);


    totalSpent.textContent = formatMoney(total);

    monthlySpent.textContent = formatMoney(monthTotal);

    expenseCount.textContent = expenses.length;


    // Update budget information
    document.getElementById("budgetSpent").textContent =
        `${formatMoney(monthTotal)} spent`;


    if (monthlyBudget > 0) {

        const percentage =
            (monthTotal / monthlyBudget) * 100;

        const progressWidth =
            Math.min(percentage, 100);

        document.getElementById("budgetLimit").textContent =
            `of ${formatMoney(monthlyBudget)}`;

        const progress =
            document.getElementById("budgetProgress");

        progress.style.width = `${progressWidth}%`;

        if (percentage >= 100) {

            document.getElementById("budgetMessage").textContent =
                "You have reached or passed your monthly budget.";

            progress.classList.add("over-budget");

        } else {

            document.getElementById("budgetMessage").textContent =
                `${percentage.toFixed(1)}% of your monthly budget used.`;

            progress.classList.remove("over-budget");

        }

    } else {

        document.getElementById("budgetLimit").textContent =
            "No budget set";

        document.getElementById("budgetProgress").style.width = "0%";

        document.getElementById("budgetMessage").textContent =
            "Set a monthly budget to track your spending.";

    }

}


// Search, filter and sort expenses
function getVisibleExpenses() {

    const selectedCategory = categoryFilter.value;

    const searchText =
        searchInput.value.trim().toLowerCase();

    const sortOrder = sortFilter.value;


    let visibleExpenses = expenses.filter(expense => {

        const matchesCategory =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        const matchesSearch =
            expense.name.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;

    });


    if (sortOrder === "newest") {

        visibleExpenses.sort((a, b) =>
            b.date.localeCompare(a.date)
        );

    } else if (sortOrder === "oldest") {

        visibleExpenses.sort((a, b) =>
            a.date.localeCompare(b.date)
        );

    } else if (sortOrder === "highest") {

        visibleExpenses.sort((a, b) =>
            b.amount - a.amount
        );

    } else if (sortOrder === "lowest") {

        visibleExpenses.sort((a, b) =>
            a.amount - b.amount
        );

    }

    return visibleExpenses;

}


// Display expenses
function displayExpenses() {

    const visibleExpenses = getVisibleExpenses();

    expenseList.innerHTML = "";


    if (visibleExpenses.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.className = "empty-message";

        emptyMessage.textContent =
            expenses.length === 0
            ? "No expenses added yet."
            : "No expenses match your search or filter.";

        expenseList.appendChild(emptyMessage);

    }


    visibleExpenses.forEach(expense => {

        const row = document.createElement("article");

        row.className = "expense-row";


        const details = document.createElement("div");

        details.className = "expense-details";


        const title = document.createElement("p");

        title.className = "expense-title";

        title.textContent = expense.name;


        const info = document.createElement("p");

        info.className = "expense-info";

        info.textContent =
            `${expense.category} · ${formatDate(expense.date)}`;


        details.append(title, info);


        const actions = document.createElement("div");

        actions.className = "expense-actions";


        const amount = document.createElement("span");

        amount.className = "expense-value";

        amount.textContent = formatMoney(expense.amount);


        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.className = "action-button";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {

            startEditing(expense.id);

        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className = "action-button delete";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {

            deleteExpense(expense.id);

        });


        actions.append(amount, editButton, deleteButton);

        row.append(details, actions);

        expenseList.appendChild(row);

    });


    document.getElementById("visibleCount").textContent =
        `Showing ${visibleExpenses.length} of ${expenses.length} expenses`;

}


// Format date
function formatDate(dateText) {

    return new Date(dateText + "T00:00:00")
        .toLocaleDateString("en-NP", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

}


// Add or update expense
expenseForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const name = expenseNameInput.value.trim();

    const amount = Number(expenseAmountInput.value);

    const category = expenseCategoryInput.value;

    const date = expenseDateInput.value;


    if (
        name === "" ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        date === ""
    ) {

        document.getElementById("formMessage").textContent =
            "Please enter valid expense details.";

        return;

    }


    if (editingExpenseId === null) {

        // Create a new expense
        expenses.push({

            id: Date.now(),

            name: name,

            amount: amount,

            category: category,

            date: date

        });

        document.getElementById("formMessage").textContent =
            "Expense added successfully.";

    } else {

        // Update an existing expense
        expenses = expenses.map(expense => {

            if (expense.id === editingExpenseId) {

                return {
                    ...expense,
                    name,
                    amount,
                    category,
                    date
                };

            }

            return expense;

        });

        document.getElementById("formMessage").textContent =
            "Expense updated successfully.";

    }


    saveExpenses();

    updateSummary();

    displayExpenses();

    resetExpenseForm();

});


// Edit expense
function startEditing(id) {

    const expense = expenses.find(item => item.id === id);

    if (!expense) return;


    editingExpenseId = id;

    expenseNameInput.value = expense.name;

    expenseAmountInput.value = expense.amount;

    expenseCategoryInput.value = expense.category;

    expenseDateInput.value = expense.date;


    formHeading.textContent = "Edit expense";

    submitButton.textContent = "Save changes";

    cancelEditButton.classList.remove("hidden");

    document.getElementById("formMessage").textContent =
        "Make your changes and save them.";

    expenseNameInput.focus();

}


// Delete expense
function deleteExpense(id) {

    const confirmed = confirm("Delete this expense?");

    if (!confirmed) return;


    expenses = expenses.filter(expense => {

        return expense.id !== id;

    });


    saveExpenses();

    updateSummary();

    displayExpenses();


    if (editingExpenseId === id) {

        resetExpenseForm();

    }

}


// Reset form
function resetExpenseForm() {

    expenseForm.reset();

    expenseDateInput.value = getTodayDate();

    editingExpenseId = null;

    formHeading.textContent = "New expense";

    submitButton.textContent = "Add expense";

    cancelEditButton.classList.add("hidden");

}


// Cancel editing
cancelEditButton.addEventListener("click", function() {

    resetExpenseForm();

    document.getElementById("formMessage").textContent = "";

});


// Open budget form
document.getElementById("editBudgetButton")
    .addEventListener("click", function() {

        budgetInput.value = monthlyBudget || "";

        budgetForm.classList.toggle("hidden");

    });


// Cancel budget form
document.getElementById("cancelBudgetButton")
    .addEventListener("click", function() {

        budgetForm.classList.add("hidden");

    });


// Save monthly budget
budgetForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newBudget = Number(budgetInput.value);

    if (!Number.isFinite(newBudget) || newBudget <= 0) {

        alert("Enter a budget greater than zero.");

        return;

    }

    monthlyBudget = newBudget;

    saveBudget();

    updateSummary();

    budgetForm.classList.add("hidden");

});


// Search and filter events
categoryFilter.addEventListener("change", displayExpenses);

searchInput.addEventListener("input", displayExpenses);

sortFilter.addEventListener("change", displayExpenses);


// Export expenses as CSV
document.getElementById("exportButton")
    .addEventListener("click", function() {

        if (expenses.length === 0) {

            alert("There are no expenses to export yet.");

            return;

        }


        const headings = [
            "Name",
            "Amount (NPR)",
            "Category",
            "Date"
        ];


        const rows = expenses.map(expense => {

            return [
                expense.name,
                expense.amount,
                expense.category,
                expense.date
            ];

        });


        const csvContent = [headings, ...rows]

            .map(row => {

                return row.map(value => {

                    return `"${String(value).replaceAll('"', '""')}"`;

                }).join(",");

            }).join("\n");


        const file = new Blob(
            [csvContent],
            { type: "text/csv;charset=utf-8;" }
        );


        const downloadUrl = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = downloadUrl;

        link.download = "my-expenses.csv";

        link.click();

        URL.revokeObjectURL(downloadUrl);

});


// Clear all expenses
document.getElementById("clearAllButton")
    .addEventListener("click", function() {

        if (expenses.length === 0) {

            alert("There are no expenses to clear.");

            return;

        }


        const confirmed = confirm(
            "Are you sure you want to delete all expenses?"
        );

        if (!confirmed) return;


        expenses = [];

        saveExpenses();

        updateSummary();

        displayExpenses();

        resetExpenseForm();

});


// Initial page load
updateSummary();

displayExpenses();
