const pool = require("../config/db");

exports.depositCash = async (req, res) => {
  try {
    const { customer_id, amount } = req.body;
    const agent_Id = req.user.id;

    const check = await pool.query("SELECT * FROM customers WHERE id = $1", [
      customer_id,
    ]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (agent_id, customer_id, type, amount) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [agent_Id, customer_id, "deposit", amount]
    );
    res
      .status(201)
      .json({ message: "Deposit successful", transaction: result.rows[0] });
  } catch (err) {
    console.error("Deposit Error: ", err);
    res.status(500).json({ message: "Deposit failed" });
  }
};

exports.withdrawCash = async (req, res) => {
  try {
    const { customer_id, amount } = req.body;
    const agent_id = req.user.id;

    // Optional: Validate customer
    const check = await pool.query("SELECT * FROM customers WHERE id = $1", [
      customer_id,
    ]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Insert withdrawal
    const result = await pool.query(
      `INSERT INTO transactions (agent_id, customer_id, type, amount) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [agent_id, customer_id, "withdrawal", amount]
    );

    res
      .status(201)
      .json({ message: "Withdrawal successful", transaction: result.rows[0] });
  } catch (err) {
    console.error("Withdrawal error:", err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
};

exports.fundTransfer = async (req, res) => {
  try {
    const { from_customer_id, to_customer_id, amount } = req.body;
    const agent_id = req.user.id;

    if (from_customer_id === to_customer_id) {
      return res.status(400).json({ message: "Sender and receiver cannot be the same" });
    }

    // Validate both customers
    const fromCheck = await pool.query("SELECT * FROM customers WHERE id = $1", [from_customer_id]);
    const toCheck = await pool.query("SELECT * FROM customers WHERE id = $1", [to_customer_id]);

    if (fromCheck.rows.length === 0 || toCheck.rows.length === 0) {
      return res.status(404).json({ message: "One or both customers not found" });
    }

    // Begin transaction
    await pool.query("BEGIN");

    // Debit from sender
    await pool.query(
      `INSERT INTO transactions (agent_id, customer_id, type, amount)
       VALUES ($1, $2, 'transfer_debit', $3)`,
      [agent_id, from_customer_id, amount]
    );

    // Credit to receiver
    await pool.query(
      `INSERT INTO transactions (agent_id, customer_id, type, amount)
       VALUES ($1, $2, 'transfer_credit', $3)`,
      [agent_id, to_customer_id, amount]
    );

    await pool.query("COMMIT");

    res.status(201).json({ message: "Transfer completed" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Transfer error:", err);
    res.status(500).json({ message: "Transfer failed" });
  }
};

exports.payBill = async (req, res) => {
  try {
    const { customer_id, amount, bill_type } = req.body;
    const agent_id = req.user.id;

    const check = await pool.query("SELECT * FROM customers WHERE id = $1", [customer_id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (agent_id, customer_id, type, amount, bill_type)
       VALUES ($1, $2, 'bill_payment', $3, $4) RETURNING *`,
      [agent_id, customer_id, amount, bill_type]
    );

    res.status(201).json({
      message: `Bill payment successful for ${bill_type}`,
      transaction: result.rows[0]
    });
  } catch (err) {
    console.error("Bill payment error:", err);
    res.status(500).json({ message: "Bill payment failed" });
  }
};
