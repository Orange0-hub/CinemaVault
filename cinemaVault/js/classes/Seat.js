/**
 * Seat Class — Demonstrates ENCAPSULATION
 *
 * The booking state (#isBooked) is a private field that can only
 * be modified through the book() and release() methods.
 * Direct external mutation of seat state is impossible.
 *
 * Also serves as the BASE CLASS for PremiumSeat (Inheritance).
 * The calculatePrice() method is designed to be overridden (Polymorphism).
 */
export class Seat {
  // Private fields
  #row;
  #number;
  #isBooked;
  #type;
  #price;

  /**
   * @param {string} row    - Row letter (e.g. "A")
   * @param {number} number - Seat number within the row (e.g. 5)
   * @param {number} price  - Base ticket price in PHP (default ₱250)
   */
  constructor(row, number, price = 250) {
    this.#row = row;
    this.#number = number;
    this.#isBooked = false;
    this.#type = 'regular';
    this.#price = price;
  }

  // ---- Public Getters ----

  get row() {
    return this.#row;
  }

  get number() {
    return this.#number;
  }

  /**
   * Checks whether the seat is currently booked.
   * This is read-only — to change it, use book() or release().
   */
  get isBooked() {
    return this.#isBooked;
  }

  /**
   * Returns the seat type. Overridden by PremiumSeat (Polymorphism).
   */
  get type() {
    return this.#type;
  }

  /**
   * Returns a human-readable label like "A5".
   */
  get seatLabel() {
    return `${this.#row}${this.#number}`;
  }

  // ---- Controlled State Mutation (Encapsulation) ----

  /**
   * Books this seat. Throws an error if the seat is already booked.
   * This is the ONLY way to change the booking state to true.
   */
  book() {
    if (this.#isBooked) {
      throw new Error(`Seat ${this.seatLabel} is already booked.`);
    }
    this.#isBooked = true;
  }

  /**
   * Releases a booked seat, making it available again.
   * This is the ONLY way to change the booking state to false.
   */
  release() {
    if (!this.#isBooked) {
      throw new Error(`Seat ${this.seatLabel} is not booked.`);
    }
    this.#isBooked = false;
  }

  // ---- Pricing (base implementation — overridden by subclasses) ----

  /**
   * Calculates the ticket price for this seat.
   * This is the BASE implementation. PremiumSeat overrides this
   * method to apply a premium multiplier (Polymorphism).
   * @returns {number} Price in PHP
   */
  calculatePrice() {
    return this.#price;
  }
}
