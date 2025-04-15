const pool = require("../config/db");

exports.getTransactionReport = async (req, res) => {
  try {
    const { from, to, type, customer_id, agent_id } = req.query;

    let query = "Select * from transactions where 1 = 1  ";
    const values = [];
    if (from) {
      values.push(from);
      query += ` And timestamp >= $${values.length}`;
    }

    if (to) {
      values.push(to);
      query += ` And timestamp <= $${values.length}`;
    }

    if (type) {
      values.push(type);
      query += ` And type = $${values.length}`;
    }

    if (customer_id) {
      values.push(customer_id);
      query += ` And customer_id = $${values.length}`;
    }

    if (agent_id) {
      values.push(agent_id);
      query += ` And agent_id = $${values.length}`;
    }

    query += " Order by timestamp desc";
    const result = await pool.query(query, values);
    res.status(200).json({ transactions: result.rows });
  } catch (err) {
    console.log("Transaction report error: ", err);
    res.status(500).json({ message: "Failed to fetch transaction report" });
  }
};
