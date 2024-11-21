const fs = require("fs");
const filePath = "./sales-data.csv";

// Read and load file content
let fileContent = fs.readFileSync(filePath, "utf-8");

// Remove the header row and split the data into rows
const rows = [];
let currentLine = "";
for (let i = 0; i < fileContent.length; i++) {
  if (fileContent[i] === "\n") {
    rows.push(currentLine);
    currentLine = "";
  } else {
    currentLine += fileContent[i];
  }
}
rows.shift(); // Remove the header

// Custom function to extract 'YYYY-MM' from a date string
function getYearMonth(dateString) {
  const dateParts = dateString.split("-");
  const year = dateParts[0];
  const month = parseInt(dateParts[1], 10);
  return year + "-" + month;
}

// Compute the total sales from data rows
function calculateOverallSales(data) {
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    const columns = parseRow(data[i]);
    if (columns.length < 5) continue; // Skip incomplete rows
    total += parseFloat(columns[4]);
  }
  return total;
}

// Compute month-wise sales totals
function calculateMonthlySales(data) {
  const monthlySales = {};
  for (let i = 0; i < data.length; i++) {
    const columns = parseRow(data[i]);
    if (columns.length < 5) continue;

    const month = getYearMonth(columns[0]);
    const sales = parseFloat(columns[4]);
    if (!monthlySales[month]) {
      monthlySales[month] = 0;
    }
    monthlySales[month] += sales;
  }
  return monthlySales;
}

// Identify the most popular item by quantity sold for each month
function findTopItemsByMonth(data) {
  const itemCounts = {};
  for (let i = 0; i < data.length; i++) {
    const columns = parseRow(data[i]);
    if (columns.length < 5) continue;

    const month = getYearMonth(columns[0]);
    const item = columns[1];
    const quantity = parseInt(columns[3]);

    if (!itemCounts[month]) {
      itemCounts[month] = {};
    }
    if (!itemCounts[month][item]) {
      itemCounts[month][item] = 0;
    }
    itemCounts[month][item] += quantity;
  }

  const topItems = {};
  for (const month in itemCounts) {
    let maxQuantity = 0;
    let topItem = "";
    for (const item in itemCounts[month]) {
      if (itemCounts[month][item] > maxQuantity) {
        maxQuantity = itemCounts[month][item];
        topItem = item;
      }
    }
    topItems[month] = topItem;
  }
  return topItems;
}

// Find the item generating the most revenue for each month
function findHighestRevenueItems(data) {
  const itemRevenues = {};
  for (let i = 0; i < data.length; i++) {
    const columns = parseRow(data[i]);
    if (columns.length < 5) continue;

    const month = getYearMonth(columns[0]);
    const item = columns[1];
    const revenue = parseFloat(columns[4]);

    if (!itemRevenues[month]) {
      itemRevenues[month] = {};
    }
    if (!itemRevenues[month][item]) {
      itemRevenues[month][item] = 0;
    }
    itemRevenues[month][item] += revenue;
  }

  const highestRevenueItems = {};
  for (const month in itemRevenues) {
    let maxRevenue = 0;
    let topItem = "";
    for (const item in itemRevenues[month]) {
      if (itemRevenues[month][item] > maxRevenue) {
        maxRevenue = itemRevenues[month][item];
        topItem = item;
      }
    }
    highestRevenueItems[month] = topItem;
  }
  return highestRevenueItems;
}

// Calculate order statistics for the most popular item by month
function calculateOrderStats(data) {
  const popularItems = findTopItemsByMonth(data);
  const orderStats = {};

  const ordersByMonth = {};
  for (let i = 0; i < data.length; i++) {
    const columns = parseRow(data[i]);
    if (columns.length < 5) continue;

    const month = getYearMonth(columns[0]);
    const item = columns[1];
    const quantity = parseInt(columns[3]);

    if (popularItems[month] === item) {
      if (!ordersByMonth[month]) {
        ordersByMonth[month] = [];
      }
      ordersByMonth[month].push(quantity);
    }
  }

  for (const month in ordersByMonth) {
    const orders = ordersByMonth[month];
    let minOrders = orders[0];
    let maxOrders = orders[0];
    let sumOrders = 0;

    for (let i = 0; i < orders.length; i++) {
      if (orders[i] < minOrders) minOrders = orders[i];
      if (orders[i] > maxOrders) maxOrders = orders[i];
      sumOrders += orders[i];
    }
    const avgOrders = sumOrders / orders.length;
    orderStats[month] = { min: minOrders, max: maxOrders, avg: avgOrders };
  }
  return orderStats;
}

// Parse a row into an array of columns (manual implementation)
function parseRow(row) {
  const columns = [];
  let value = "";
  for (let j = 0; j < row.length; j++) {
    if (row[j] === ",") {
      columns.push(value.trim());
      value = "";
    } else {
      value += row[j];
    }
  }
  columns.push(value.trim()); // Add the last column
  return columns;
}

// Display results
function displayResults() {
  console.log("Total Sales:", calculateOverallSales(rows));
  console.log("Monthly Sales Totals:", calculateMonthlySales(rows));
  console.log("Top Items by Month:", findTopItemsByMonth(rows));
  console.log("Highest Revenue Items by Month:", findHighestRevenueItems(rows));
  console.log("Order Stats for Top Items by Month:", calculateOrderStats(rows));
}

// Call the displayResults function
displayResults();
