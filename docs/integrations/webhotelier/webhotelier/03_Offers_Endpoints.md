# Offers Endpoints Documentation
**Purpose:** Instructions for the LLM to fetch special deals and promotions.
**Base URL:** `https://rest.reserve-online.net`

## 1. Single-Property & Multi-Property Offers Search
* **Endpoint (Single):** `/offers/{propertyCode}`
* **Endpoint (Multi):** `/offers`
* **Method:** `GET`
* **LLM Action:** Use to list all active promotional campaigns (e.g., "Summer Promo 20% Off"). 

## 2. Offer Information
* **Endpoint:** `/offer/{propertyCode}/{offerCode}`
* **Method:** `GET`
* **LLM Action:** Use to retrieve the specific rules of an offer. Crucial for understanding booking windows (when the offer can be booked) and travel windows (when the stay must occur).