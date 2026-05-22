# Availability Endpoints Documentation
**Purpose:** Instructions for the LLM to check real-time availability and pricing.
**Base URL:** `https://rest.reserve-online.net`

## 1. Single-Property Availability
* **Endpoint:** `/availability/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** The most common endpoint. Use this to check if rooms are available for specific dates.
* **Required Query Parameters:** `checkin` (YYYY-MM-DD), `checkout` (YYYY-MM-DD), `adults`.
* **Optional Query Parameters:** `children`, `children_ages`, `rooms`.

## 2. Multi-Property Availability
* **Endpoint:** `/availability`
* **Method:** `GET`
* **LLM Action:** Use this when a user wants to find *any* available hotel in a group for specific dates. Requires the same date and occupancy parameters as single-property.

## 3. Availability Calendars
* **Endpoint (Breakdown):** `/calendar/{propertyCode}`
* **Endpoint (Flexible):** `/calendar/flex/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use when the user asks for a monthly view, or "flexible dates" around a specific target date to find the cheapest option.

## 4. Best Available Rate (BAR)
* **Endpoint:** `/bar/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use for a quick price fetch. Returns the absolute lowest rate available per day for a given date range, without full room details.

## 5. Extras Availability
* **Endpoint:** `/availability/extras/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Checks if specific extra services are available on the selected dates.