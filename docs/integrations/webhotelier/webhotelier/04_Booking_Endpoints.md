# Bookings Endpoints Documentation
**Purpose:** Instructions for the LLM to create, cancel, and retrieve reservations. **CRITICAL: Modifies Live Data.**
**Base URL:** `https://rest.reserve-online.net`

## 1. New Booking
* **Endpoint:** `/bookings/{propertyCode}`
* **Method:** `POST`
* **LLM Action:** Executes a live reservation. 
* **Payload Requirements:** Must include a JSON body containing `checkin`, `checkout`, `room_type`, `rate_plan`, `adults`, `guest_details` (name, email), and `payment_details` (credit card token or standard).

## 2. Cancel Booking
* **Endpoint:** `/bookings/{propertyCode}/{reservationID}`
* **Method:** `DELETE`
* **LLM Action:** Cancels an existing reservation. Warn the user that this may trigger cancellation fees based on the rate plan policies.

## 3. Purge Booking (Rollback)
* **Endpoint:** `/bookings/purge/{propertyCode}/{reservationID}`
* **Method:** `DELETE`
* **LLM Action:** Completely removes a booking as if it never happened. Usually restricted to test bookings or immediate error corrections.

## 4. Booking Retrieval & Search
* **Endpoint (Single ID):** `/bookings/{propertyCode}/{reservationID}`
* **Endpoint (Search):** `/bookings/{propertyCode}`
* **Method:** `GET`
* **LLM Action:** Use to look up details of an existing reservation. Can search by query parameters like `email`, `lastname`, or `arrival_date`.

## 5. Syncing (For PMS integrations)
* **Endpoints:** `/sync/pull`, `/sync/pending`, `/sync/push`
* **Methods:** `GET` / `POST`
* **LLM Action:** Only use if instructed to act as a Channel Manager or Property Management System (PMS) to download new bookings to a local system.