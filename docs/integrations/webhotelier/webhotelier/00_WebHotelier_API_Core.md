# WebHotelier API Core Configuration

## Base URL
All API requests must be directed to the following base endpoint:
`https://rest.reserve-online.net{method_endpoint}`

## Authentication
- **Method:** Basic HTTP Access Authentication.
- **Header format:** `Authorization: Basic [base64(username:password)]`
- **Note:** Missing or incorrect credentials will result in an HTTP 401 Unauthorized error. Ensure IP access control is configured if requests are failing.

## HTTP Methods
- **GET:** Use for all methods retrieving data (e.g., Availability, Property Info, Listing).
- **POST:** Use for submitting, changing, or creating data (e.g., New Booking).
- **DELETE:** Use for destroying data (e.g., Purging/Canceling Bookings).

## Content Negotiation (Headers)
The API is RESTful and uses standard HTTP headers to determine the input/output format and language.
- **Data Format:** Set the `Accept` header. JSON is highly recommended.
  - `Accept: application/json` (Recommended for LLM parsing)
  - `Accept: application/xml` (Default)
- **Internationalization:** Retrieve translated content by setting the `Accept-Language` header.
  - `Accept-Language: en` (Fallback/Default)
  - Example for specific locales: `Accept-Language: el, en-gb`