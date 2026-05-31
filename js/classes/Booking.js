/**
 * Booking Class — Demonstrates ABSTRACTION
 *
 * The complex booking process involves multiple internal steps:
 *   1. Validate seat availability
 *   2. Calculate total price
 *   3. Reserve all seats
 *   4. Update booking status
 *   5. Record in customer history
 *
 * All of these steps are HIDDEN (abstracted) behind a single
 * public method: confirmBooking(). The user simply calls one
 * method and the entire process is handled internally.
 *
 * Private methods (#validateSeats, #calculateTotal, #reserveSeats)
 * are implementation details that external code never sees.
 */
export class Booking {
  // Private fields
  #id;
  #movie;
  #schedule;
  #seats;
  #customer;
  #totalPrice;
  #bookingDate;
  #status;

  /**
   * @param {Movie}    movie    - The selected Movie object
   * @param {string}   schedule - The selected showtime
   * @param {Seat[]}   seats    - Array of selected Seat/PremiumSeat objects
   * @param {Customer} customer - The Customer making the booking
   */
  constructor(movie, schedule, seats, customer) {
    this.#id = this.#generateId();
    this.#movie = movie;
    this.#schedule = schedule;
    this.#seats = [...seats]; // Copy to prevent external mutation
    this.#customer = customer;
    this.#totalPrice = 0;
    this.#bookingDate = new Date();
    this.#status = 'pending';
  }

  // ---- Public Getters ----

  get id() {
    return this.#id;
  }

  get status() {
    return this.#status;
  }

  get totalPrice() {
    return this.#totalPrice;
  }

  // ---- PRIVATE Methods (hidden implementation — ABSTRACTION) ----

  /**
   * Generates a unique booking reference ID.
   * @private
   * @returns {string} e.g. "BK-2A3F-X9K1"
   */
  #generateId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
  }

  /**
   * Validates that all selected seats are still available.
   * Throws an error if any seat is already booked.
   * @private
   */
  #validateSeats() {
    for (const seat of this.#seats) {
      if (seat.isBooked) {
        throw new Error(`Seat ${seat.seatLabel} is already booked. Please select a different seat.`);
      }
    }
    if (this.#seats.length === 0) {
      throw new Error('No seats selected. Please choose at least one seat.');
    }
    return true;
  }

  /**
   * Calculates the total price by summing each seat's price.
   * Uses calculatePrice() which behaves differently for
   * Regular vs Premium seats (Polymorphism in action).
   * @private
   * @returns {number}
   */
  #calculateTotal() {
    this.#totalPrice = this.#seats.reduce((sum, seat) => {
      // Polymorphism: each seat.calculatePrice() returns
      // a different value based on its type
      return sum + seat.calculatePrice();
    }, 0);
    return this.#totalPrice;
  }

  /**
   * Marks all selected seats as booked.
   * @private
   */
  #reserveSeats() {
    this.#seats.forEach(seat => seat.book());
  }

  // ---- PUBLIC Methods (simplified interface — ABSTRACTION) ----

  /**
   * ABSTRACTION in action:
   * This single method hides the entire booking workflow.
   * The caller doesn't need to know about validation, price
   * calculation, or seat reservation — they just call this.
   *
   * @returns {Object} Receipt data for display
   */
  confirmBooking() {
    // Step 1: Validate all seats are available (hidden)
    this.#validateSeats();

    // Step 2: Calculate total price (hidden)
    this.#calculateTotal();

    // Step 3: Reserve all seats (hidden)
    this.#reserveSeats();

    // Step 4: Update status (hidden)
    this.#status = 'confirmed';

    // Step 5: Add to customer history (hidden)
    this.#customer.addBooking(this);

    // Return receipt data
    return this.generateReceipt();
  }

  /**
   * Generates a structured receipt object for display.
   * @returns {Object} Formatted receipt data
   */
  generateReceipt() {
    return {
      bookingId: this.#id,
      movie: this.#movie.title,
      genre: this.#movie.genre,
      duration: this.#movie.duration,
      schedule: this.#schedule,
      seats: this.#seats.map(s => ({
        label: s.seatLabel,
        type: s.type,
        price: s.calculatePrice()
      })),
      customer: {
        name: this.#customer.name,
        email: this.#customer.email
      },
      totalPrice: this.#totalPrice,
      bookingDate: this.#bookingDate.toLocaleString(),
      status: this.#status
    };
  }
}
