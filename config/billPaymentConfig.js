const path = require("path");
const fs = require("fs");

const PRIVATE_KEY_PATH = path.join(__dirname, "private_key.pem");

module.exports = {
  API_URL: process.env.YOAPP_API_URL_Login,
  USERNAME: process.env.YOAPP_USERNAME,
  PASSWORD: process.env.YOAPP_PASSWORD,
  GRANT_TYPE: process.env.YOAPP_GRANT_TYPE,
  PRIVATE_KEY: fs.readFileSync(PRIVATE_KEY_PATH, "utf8"),
};
