const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// Error Messages
const MISSING_FIELDS = "Missing required fields: name, weather, or imageUrl";
const OWNER_REQUIRED = "Owner is required";
const AUTHENTICATION_ERROR = "User not authenticated or missing user ID";
const SERVER_ERROR = "An error has occurred on the server";
const ITEM_NOT_FOUND = "Item not found";
const INVALID_ITEM_ID = "Invalid item ID format";
const USER_NOT_FOUND = "User not found";
const ROUTER_NOT_FOUND = "Router not found";

module.exports = {
  BAD_REQUEST,
  UNAUTHORIZED,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  MISSING_FIELDS,
  OWNER_REQUIRED,
  AUTHENTICATION_ERROR,
  SERVER_ERROR,
  ITEM_NOT_FOUND,
  INVALID_ITEM_ID,
  USER_NOT_FOUND,
  ROUTER_NOT_FOUND,
};
