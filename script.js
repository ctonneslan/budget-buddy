const form = document.getElementById("add-expense-form");
const expensesList = document.getElementById("expenses");
const ctx = document.getElementById("spending-chart").getContext("2d");
const categoryFilter = document.getElementById("category-filter");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function populateCategoryFilter() {
  const categories = [...new Set(expenses.map((e) => e.category))];
  categoryFilter.innerHTML = '<option value="all">All</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterExpenses(category = "all") {
  let filtered = [...expenses];

  if (category !== "all") {
    filtered = filtered.filter((e) => e.category === category);
  }

  const start = startDateInput.value ? new Date(startDateInput.value) : null;
  const end = endDateInput.value ? new Date(endDateInput.value) : null;

  if (start) {
    filtered = filtered.filter((e) => new Date(e.date) >= start);
  }

  if (end) {
    filtered = filtered.filter((e) => new Date(e.date) <= end);
  }

  return filtered;
}

function renderExpenses() {
  expensesList.innerHTML = "";
  const filteredExpenses = filterExpenses(categoryFilter.value);

  filteredExpenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="expense-info">
        $${expense.amount.toFixed(2)} — ${expense.category} — ${expense.date}
      </div>
      <div class="expense-actions">
        <button onclick="editExpense(${index})" title="Edit">&#9998;</button>
        <button onclick="deleteExpense(${index})" title="Delete">&#10060;</button>
      </div>
    `;
    expensesList.appendChild(li);
  });

  updateChart(filteredExpenses);
}

function updateChart(expenseData = expenses) {
  const categoryTotals = {};
  expenseData.forEach(({ amount, category }) => {
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          label: "Spending by Category",
          data,
          backgroundColor: labels.map(() => getRandomColor()),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value.trim();
  const date = document.getElementById("date").value;

  if (!amount || !category || !date) {
    alert("Please fill in all fields correctly.");
    return;
  }

  expenses.push({ amount, category, date });
  saveExpenses();
  populateCategoryFilter();
  renderExpenses();
  form.reset();
});

window.editExpense = function (index) {
  const expense = expenses[index];
  const newAmount = parseFloat(prompt("Edit amount:", expense.amount));
  const newCategory = prompt("Edit category:", expense.category);
  const newDate = prompt("Edit date (YYYY-MM-DD):", expense.date);

  if (newAmount && newCategory && newDate) {
    expenses[index] = {
      amount: newAmount,
      category: newCategory.trim(),
      date: newDate,
    };
    saveExpenses();
    populateCategoryFilter();
    renderExpenses();
  } else {
    alert("Invalid input. Edit cancelled.");
  }
};

window.deleteExpense = function (index) {
  if (confirm("Delete this expense?")) {
    expenses.splice(index, 1);
    saveExpenses();
    populateCategoryFilter();
    renderExpenses();
  }
};

categoryFilter.addEventListener("change", renderExpenses);
startDateInput.addEventListener("change", renderExpenses);
endDateInput.addEventListener("change", renderExpenses);

// Initialize
populateCategoryFilter();
renderExpenses();
