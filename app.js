const express = require("express");
const cors = require("cors");
require("dotenv").config();


const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const customerRoutes = require("./routes/customerRoutes");
const agentRoutes = require("./routes/agentRoutes");
const analyticsRoutes = require("./routes/analyticsRoute");
const reportRoutes = require("./routes/reportRoutes");
const billPaymentRoutes = require("./routes/billPaymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/bill", billPaymentRoutes);

module.exports = app;
