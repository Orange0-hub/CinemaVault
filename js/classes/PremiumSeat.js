import { Seat } from './Seat.js';

/**
 * PremiumSeat Class — Demonstrates INHERITANCE and POLYMORPHISM
 *
 * INHERITANCE:
 *   - Extends the Seat class using `extends` and `super()`.
 *   - Inherits all properties and methods from Seat (row, number,
 *     isBooked, book(), release(), etc.).
 *
 * POLYMORPHISM:
 *   - Overrides `calculatePrice()` to apply a premium multiplier.
 *   - Overrides `get type()` to return 'premium' instead of 'regular'.
 *   - The same method name (`calculatePrice`) behaves differently
 *     depending on whether the object is a Seat or PremiumSeat.
 */
export class PremiumSeat extends Seat {
  // Private fields unique to PremiumSeat
  #premiumMultiplier;
  #perks;

  /**
   * @param {string} row        - Row letter (e.g. "G")
   * @param {number} number     - Seat number
   * @param {number} basePrice  - Base price inherited by Seat (default ₱250)
   * @param {number} multiplier - Premium multiplier (default 1.6 → ₱400)
   */
  constructor(row, number, basePrice = 250, multiplier = 1.6) {
    // Call the parent (Seat) constructor — INHERITANCE via super()
    super(row, number, basePrice);

    this.#premiumMultiplier = multiplier;
    this.#perks = ['Extra Legroom', 'Complimentary Drink', 'Priority Entry'];
  }

  // ---- POLYMORPHISM: Override type getter ----

  /**
   * Returns 'premium' instead of the base class's 'regular'.
   * This is polymorphic behavior — same property name, different value.
   */
  get type() {
    return 'premium';
  }

  // ---- POLYMORPHISM: Override calculatePrice() ----

  /**
   * Calculates the premium ticket price by applying the multiplier
   * to the base price. Calls super.calculatePrice() to get the
   * base price from the parent Seat class.
   *
   * Regular Seat:  calculatePrice() → ₱250
   * Premium Seat:  calculatePrice() → ₱250 × 1.6 = ₱400
   *
   * @returns {number} Premium price in PHP
   */
  calculatePrice() {
    return Math.round(super.calculatePrice() * this.#premiumMultiplier);
  }

  // ---- Premium-Specific Methods ----

  /**
   * Returns a comma-separated string of premium perks.
   * @returns {string}
   */
  getPerkDescription() {
    return this.#perks.join(', ');
  }

  /**
   * Returns a copy of the perks array.
   * @returns {string[]}
   */
  getPerks() {
    return [...this.#perks];
  }
}
