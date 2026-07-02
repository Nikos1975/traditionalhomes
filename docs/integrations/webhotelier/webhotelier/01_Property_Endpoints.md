# Property Endpoints Documentation
**Purpose:** Instructions for the LLM to fetch static hotel catalog data.
**Base URL:** `https://rest.reserve-online.net`

## 1. Property Search
* **Endpoint:** `/properties`
* **Method:** `GET`
* **LLM Action:** Use this to list all properties associated with the authenticated account.
* **Query Parameters:** Can include filters like `country`, `city`, or `currency`.

## 2. Property Info
* **Endpoint:** `/property/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use this to get detailed information (policies, location, star rating, descriptions) for a specific hotel. Replace `{propertyCode}` with the actual hotel code (e.g., `DEMO`).

## 3. Room Listing & Room Info
* **Endpoint (Listing):** `/rooms/{propertyCode}`
* **Endpoint (Info):** `/room/{propertyCode}/{roomCode}`
* **Method:** `GET`
* **LLM Action:** Use the listing endpoint to get all room types a hotel offers. Use the Info endpoint to get deep details (photos, amenities, max occupancy) for a specific room type.

## 4. Rate Listing & Rate Info
* **Endpoint (Listing):** `/rates/{propertyCode}`
* **Endpoint (Info):** `/rate/{propertyCode}/{rateCode}`
* **Method:** `GET`
* **LLM Action:** Use to understand the pricing plans (e.g., Non-Refundable, Bed & Breakfast). Rates define the cancellation policies and meal plans attached to a room.

## 5. Extras Listing
* **Endpoint:** `/extras/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use to find out what additional services (airport transfers, spa packages, champagne) the hotel offers.