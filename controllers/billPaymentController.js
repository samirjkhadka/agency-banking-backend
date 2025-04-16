const axios = require("axios");
const crypto = require("crypto");
const { pool } = require("../config/db");
const {
  API_URL,
  USERNAME,
  PASSWORD,
  GRANT_TYPE,
  PRIVATE_KEY,
} = require("../config/billPaymentConfig");

const forge = require("node-forge");
const fs = require("fs");
const path = require("path");
const keyPem = fs.readFileSync(
  path.join(__dirname, "../config/private_key.pem"),
  "utf8"
);
exports.payBill = async (req, res) => {
  const {
    amount,
    mobileNumber,
    productId,
    createdIp = "192.168.1.1",
  } = req.body;
  const agent_id = req.user.id;
  console.log(req.body);
  try {
    // 1. Get Bearer Token
    const tokenResponse = await axios.post(`${API_URL}/login`, {
      username: USERNAME,
      password: PASSWORD,
      grant_type: GRANT_TYPE,
    });

    const token = tokenResponse.data.accesstoken;

    if (!token) throw new Error("Failed to fetch token");

    // 2. Prepare DataModel and Timestamp
    const timestamp = new Date().toISOString();
    const yoAppTxnId = `YO${Date.now()}`;

    console.log("token: ", token);
    console.log("timestamp: ", timestamp);
    console.log("txn Id: ", yoAppTxnId);

    const dataModel = {
      MobileNumber: mobileNumber,
      Amount: (Number(amount).toFixed(2)),
      ProductId: parseInt(productId),
      UserLoginNumber: mobileNumber,
      CreatedPlatform: "Android",
      CreatedIp: createdIp,
      YoAppTxnId: yoAppTxnId,
    };

    console.log("dataModel: ", dataModel);
    const payload = JSON.stringify(dataModel, null, 4);
    console.log("Payload: ", payload);

    const base64Data = Buffer.from(payload, 'utf-8').toString("base64");
    console.log("base64Data: ", base64Data);

    // 3. Sign the payload
    const privateKey = forge.pki.privateKeyFromPem(keyPem);
    const md = forge.md.sha256.create();
    md.update(payload, "utf8");

    const signature = forge.util.encode64(privateKey.sign(md));
    console.log("Signature: ", signature);

    return res.status(200).json({
      message: "Bill payment attempt started",
      data: dataModel,
    })
    // 4. Call Bill Payment API
    const paymentResponse = await axios.post(
      `${API_URL}/topup/mobiletopup`,
      {
        Data: base64Data,
        Signature: signature,
        Timestamp: timestamp,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = paymentResponse.data;
    console.log("Response Data: ", responseData);

    // 5. Log request and response
    await pool.query(
      "INSERT INTO bill_logs (request_payload, response_payload) VALUES ($1, $2)",
      [
        JSON.stringify({ model, base64Data, signature }),
        JSON.stringify(responseData),
      ]
    );

    // 6. Save transaction if success
    if (responseData?.Code === "1") {
      await pool.query(
        `INSERT INTO transactions (agent_id, customer_id, type, amount, bill_type)
         VALUES ($1, NULL, 'bill_payment', $2, $3)`,
        [agent_id, amount, "bill"]
      );
    }

    res.status(200).json({
      message: responseData?.Message || "Bill payment attempt completed",
      response: responseData,
    });
  } catch (error) {
    console.error("Bill Payment Error:", error.message);

    await pool.query(
      "INSERT INTO bill_logs (request_payload, response_payload) VALUES ($1, $2)",
      [JSON.stringify(req.body), JSON.stringify({ error: error.message })]
    );

    res
      .status(500)
      .json({ message: "Bill payment failed", error: error.message });
  }
};
