# Statistics Endpoints Documentation
**Purpose:** Instructions for the LLM to pull reporting and analytics data.
**Base URL:** `https://rest.reserve-online.net`

## 1. Performance Summary
* **Endpoint:** `/statistics/summary/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Retrieves high-level KPIs (Total Revenue, ADR, RevPAR, Room Nights).
* **Parameters:** Requires `from_date` and `to_date`.

## 2. Performance per Day & per Country
* **Endpoint (Day):** `/statistics/daily/{propertyCode}`
* **Endpoint (Country):** `/statistics/country/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use to give the user a granular breakdown. The daily endpoint returns a time-series array (good for charting), while the country endpoint returns an aggregate based on the guests' billing addresses.