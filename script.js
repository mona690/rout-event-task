document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://mona690.github.io/api/db.json";

  const customerFilterInput = document.getElementById("customerFilter");
  const amountFilterInput = document.getElementById("amountFilter");
  const transactionsTableBody = document.querySelector(
    "#transactionsTable tbody"
  );
  const transactionGraph = document
    .getElementById("transactionGraph")
    .getContext("2d");

  let customers = [];
  let transactions = [];
  let filteredTransactions = [];

  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      customers = data.customers; // Access the customers array
      transactions = data.transactions; // Access the transactions array

      console.log("Customers:", customers);
      console.log("Transactions:", transactions);

      filteredTransactions = transactions;
      displayTable(filteredTransactions);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to load data. Please try again later.");
    }
  };

  const displayTable = (data) => {
    transactionsTableBody.innerHTML = "";
    data.forEach((transaction) => {
      const customer = customers.find(
        (cust) => parseInt(cust.id) === parseInt(transaction.customer_id)
      );
      if (customer) {
        const row = document.createElement("tr");
        row.classList.add("table-row");
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${transaction.date}</td>
            <td>${transaction.amount}</td>
          `;
        row.addEventListener("click", () => displayGraph(customer.id));
        transactionsTableBody.appendChild(row);
      } else {
        console.warn(`Customer with ID ${transaction.customer_id} not found`);
      }
    });
  };

  let currentChart;
  const displayGraph = (customerId) => {
    if (currentChart) {
      currentChart.destroy();
    }

    const customerTransactions = transactions.filter(
      (tr) => parseInt(tr.customer_id) === parseInt(customerId)
    );

    const dates = [...new Set(customerTransactions.map((tr) => tr.date))];
    const amounts = dates.map((date) => {
      return customerTransactions
        .filter((tr) => tr.date === date)
        .reduce((sum, tr) => sum + tr.amount, 0);
    });

    currentChart = new Chart(transactionGraph, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Transaction Amount",
            data: amounts,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
    });
  };

  customerFilterInput.addEventListener("input", () => {
    const filter = customerFilterInput.value.toLowerCase();
    filteredTransactions = transactions.filter((transaction) => {
      const customer = customers.find(
        (cust) => parseInt(cust.id) === parseInt(transaction.customer_id)
      );
      return customer && customer.name.toLowerCase().includes(filter);
    });
    displayTable(filteredTransactions);
  });

  amountFilterInput.addEventListener("input", () => {
    const filter = parseInt(amountFilterInput.value, 10);
    filteredTransactions = transactions.filter(
      (transaction) => transaction.amount >= filter
    );
    displayTable(filteredTransactions);
  });

  fetchData();
});
