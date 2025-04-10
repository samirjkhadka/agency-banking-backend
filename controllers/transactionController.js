exports.getTransactions = (req, res) => {
  // Mocked data — replace with DB later
  const transactions = [
    {
      id: 1,
      date: new Date(),
      type: "Deposit",
      amount: 5000,
      customerName: "John Doe",
    },
    {
      id: 2,
      date: new Date(),
      type: "Withdrawal",
      amount: 2000,
      customerName: "Jane Smith",
    },
  ];
  res.json({ transactions });
};
