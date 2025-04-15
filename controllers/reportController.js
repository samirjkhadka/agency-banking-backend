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


exports.getAgentTransactions = async (req, res) => {
    try {
      const { agent_id, start_date, end_date } = req.query;
  
      if (!agent_id) {
        return res.status(400).json({ message: "agent_id is required" });
      }
  
      let query = `SELECT * FROM transactions WHERE agent_id = $1`;
      let params = [agent_id];
  
      if (start_date && end_date) {
        query += ` AND timestamp BETWEEN $2 AND $3`;
        params.push(start_date, end_date);
      }
  
      const result = await pool.query(query, params);
  
      const summary = {
        total_transactions: result.rows.length,
        total_amount: result.rows.reduce((acc, tx) => acc + parseFloat(tx.amount), 0),
      };
  
      res.json({ transactions: result.rows, summary });
    } catch (err) {
      console.error("Agent report error:", err);
      res.status(500).json({ message: "Failed to fetch agent transactions" });
    }
  };