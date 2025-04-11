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
