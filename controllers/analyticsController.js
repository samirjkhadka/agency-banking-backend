const pool = require("../config/db");

exports.getAgentSummary = async (req, res) => {
  try {
    const agent_id = req.user.id;

    const result = await pool.query(
      `SELECT 
         type,
         COUNT(*) AS count,
         SUM(amount)::numeric AS total,
         Count(distinct customer_id) as total_customers
       FROM transactions
       WHERE agent_id = $1
       GROUP BY type`,
      [agent_id]
    );

    let totalCount = 0;
    let totalAmount = 0;
    let totalCustomers = 0;
    const byType = {};

    result.rows.forEach(row => {
      const { type, count, total, total_customers } = row;
      byType[type] = {
        count: parseInt(count),
        total: parseFloat(total),
        total_customers: parseInt(total_customers)
      };
      totalCount += parseInt(count);
      totalAmount += parseFloat(total);
      totalCustomers += parseInt(total_customers);
    });

    res.json({
      agent_id,
      summary: {
        total_transactions: totalCount,
        total_amount: totalAmount,
        total_customers: totalCustomers,
        by_type: byType
      }
    });
  } catch (err) {
    console.error("Agent summary error:", err);
    res.status(500).json({ message: "Failed to fetch agent summary" });
  }
};

exports.getCustomerSummary = async (req, res) => {
    try {
      const { customer_id } = req.params;
  
      const result = await pool.query(
        `SELECT 
           type,
           COUNT(*) AS count,
           SUM(amount)::numeric AS total
         FROM transactions
         WHERE customer_id = $1
         GROUP BY type`,
        [customer_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "No transactions found for this customer" });
      }
  
      let totalCount = 0;
      let totalAmount = 0;
      const byType = {};
  
      result.rows.forEach(row => {
        const { type, count, total } = row;
        byType[type] = {
          count: parseInt(count),
          total: parseFloat(total)
        };
        totalCount += parseInt(count);
        totalAmount += parseFloat(total);
      });
  
      res.json({
        customer_id: parseInt(customer_id),
        summary: {
          total_transactions: totalCount,
          total_amount: totalAmount,
          by_type: byType
        }
      });
    } catch (err) {
      console.error("Customer summary error:", err);
      res.status(500).json({ message: "Failed to fetch customer summary" });
    }
  };
  

  exports.getDailyTransactions = async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
           TO_CHAR(timestamp::date, 'YYYY-MM-DD') AS date,
           COUNT(*) AS count,
           SUM(amount)::numeric AS amount
         FROM transactions
         WHERE timestamp >= NOW() - INTERVAL '7 days'
         GROUP BY date
         ORDER BY date ASC`
      );
  
      const daily = result.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count),
        amount: parseFloat(row.amount)
      }));
  
      res.json(daily);
    } catch (err) {
      console.error("Daily transactions error:", err);
      res.status(500).json({ message: "Failed to fetch daily transaction summary" });
    }
  };
  