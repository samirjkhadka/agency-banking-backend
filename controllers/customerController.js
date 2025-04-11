const pool = require("../config/db");

exports.onboardCustomer = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      dob,
      idType,
      idNumber,
      address,
      id_document_base64,
      photo_base64,
    } = req.body;

    const photo = req.file; // access photo from multer

    // In real setup, validate + save to DB here

    const result = await pool.query(
      `INSERT INTO customers
      (full_name, dob, phone, address, id_type, id_number, id_document_url, photo_url, onboarded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
      [
        fullName,
        dob,
        phone,
        address,
        idType,
        idNumber,
        id_document_base64,
        photo_base64,
        req.user.id,
      ]
    );

    res
      .status(201)
      .json({ message: "Customer onboarded", customer: result.rows[0] });

    // console.log("New KYC submission:", {
    //   fullName,
    //   phone,
    //   email,
    //   dob,

    //   idType,
    //   idNumber,
    //   address,

    //   photoPath: photo?.path,
    // });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to onboard customer" });
  }

  res.status(201).json({ message: "Customer onboarded successfully" });
};
exports.getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, phone FROM customers ORDER BY created_at DESC`
    );
    res.json({ customers: result.rows });
  } catch (err) {
    console.error("Fetch customers error:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};