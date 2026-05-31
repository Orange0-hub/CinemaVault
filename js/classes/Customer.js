/**
 * Customer Class — Demonstrates ENCAPSULATION
 *
 * Customer data (name, email, booking history) is stored in
 * private fields. Setters include validation logic to ensure
 * data integrity — the name cannot be empty and the email
 * must contain an '@' symbol.
 *
 * Booking history is managed internally through addBooking()
 * and returned as a copy via getBookingHistory() to prevent
 * external mutation.
 */
export class Customer {
  // Private fields
  #name;
  #email;
  #bookingHistory;

  /**
   * @param {string} name  - Customer's full name
   * @param {string} email - Customer's email address
   */
  constructor(name, email) {
    // Use setters for validation on construction
    this.name = name;
    this.email = email;
    this.#bookingHistory = [];
  }

  // ---- Getters ----

  get name() {
    return this.#name;
  }

  get email() {
    return this.#email;
  }

  // ---- Setters with Validation (Encapsulation) ----

  /**
   * Sets the customer name with validation.
   * @param {string} value - Must be a non-empty string
   */
  set name(value) {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error('Customer name cannot be empty.');
    }
    this.#name = value.trim();
  }

  /**
   * Sets the customer email with validation.
   * @param {string} value - Must contain '@' symbol
   */
  set email(value) {
    if (!value || typeof value !== 'string' || !value.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    this.#email = value.trim();
  }

  // ---- Booking History Management ----

  /**
   * Adds a booking to the customer's history.
   * @param {Booking} booking - A confirmed Booking object
   */
  addBooking(booking) {
    this.#bookingHistory.push(booking);
  }

  /**
   * Returns a COPY of the booking history array.
   * Prevents external mutation of the internal array.
   * @returns {Booking[]}
   */
  getBookingHistory() {
    return [...this.#bookingHistory];
  }

  /**
   * Returns the total number of bookings made.
   * @returns {number}
   */
  getBookingCount() {
    return this.#bookingHistory.length;
  }
}
