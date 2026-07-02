# Vouchers Endpoints Documentation
**Purpose:** Instructions for the LLM to manage gift cards and promo codes.
**Base URL:** `https://rest.reserve-online.net`

## 1. Voucher Bundle Listing
* **Endpoint:** `/vouchers/bundles/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Retrieves groups of vouchers (e.g., "Holiday Gift Cards 2026").

## 2. Voucher Codes Listing
* **Endpoint:** `/vouchers/bundles/{propertyCode}/{bundleId}`
* **Method:** `GET`
* **LLM Action:** Lists the specific alphanumeric codes within a bundle.

## 3. Voucher Code Management
* **Endpoint:** `/vouchers/code/{propertyCode}/{code}`
* **Method:** `GET` (to check balance/validity) or `POST` (to redeem/consume value).
* **LLM Action:** Use to check if a promo code entered by a user is valid, or to apply it to a booking.