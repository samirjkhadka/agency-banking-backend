exports.onboardCustomer = (req, res) => {
    const {
      fullName, phone, email, dob, bvn,
      idType, idNumber, address, lga, state
    } = req.body;
  
    const photo = req.file; // access photo from multer
  
    // In real setup, validate + save to DB here
  
    console.log('New KYC submission:', {
      fullName, phone, email, dob, bvn,
      idType, idNumber, address, lga, state,
      photoPath: photo?.path
    });
  
    res.status(201).json({ message: 'Customer onboarded successfully' });
  };
  