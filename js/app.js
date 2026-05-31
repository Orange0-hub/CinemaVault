/**
 * CinemaVault — Main Application
 *
 * Handles DOM manipulation, event listeners, rendering, and
 * orchestrates the booking flow using the OOP classes.
 *
 * Flow: Select Movie → Pick Schedule → Choose Seats → Confirm → Receipt
 */

import { Movie } from './classes/Movie.js';
import { Seat } from './classes/Seat.js';
import { PremiumSeat } from './classes/PremiumSeat.js';
import { Booking } from './classes/Booking.js';
import { Customer } from './classes/Customer.js';

class CinemaApp {
  constructor() {
    /** @type {Movie[]} */
    this.movies = [];
    /** @type {Movie|null} */
    this.selectedMovie = null;
    /** @type {string|null} */
    this.selectedSchedule = null;
    /** @type {Map<string, Seat|PremiumSeat>} */
    this.seatMap = new Map();
    /** @type {(Seat|PremiumSeat)[]} */
    this.selectedSeats = [];
    /** @type {Booking[]} */
    this.bookings = [];
    /** @type {number|null} */
    this.toastTimer = null;

    this.initMovies();
    this.cacheDOM();
    this.bindEvents();
    this.renderMovies();
    this.updateSteps(1);
  }

  // ================================================================
  //  INITIALIZATION
  // ================================================================

  /**
   * Creates Movie instances with sample data.
   * Demonstrates Encapsulation: all data is passed into constructors
   * and stored in private fields.
   */
  initMovies() {
    this.movies = [
      new Movie(
        1,
        'Galactic Odyssey',
        'Sci-Fi / Adventure',
        '2h 28m',
        'PG-13',
        'assets/galactic_odyssey.png',
        ['10:30 AM', '2:00 PM', '7:30 PM'],
        'An astronaut discovers a gateway to parallel dimensions at the edge of the known universe.'
      ),
      new Movie(
        2,
        'The Last Ember',
        'Drama / Thriller',
        '1h 55m',
        'R',
        'assets/the_last_ember.png',
        ['11:00 AM', '3:30 PM', '8:00 PM'],
        'A former detective traces a series of arsons to uncover a conspiracy that hits close to home.'
      ),
      new Movie(
        3,
        'Moonlit Gardens',
        'Romance / Fantasy',
        '2h 10m',
        'PG',
        'assets/moonlit_gardens.png',
        ['10:00 AM', '1:30 PM', '6:45 PM'],
        'Two strangers find love in an enchanted garden that only appears under the full moon.'
      ),
      new Movie(
        4,
        'Velocity Rush',
        'Action / Racing',
        '2h 05m',
        'PG-13',
        'assets/velocity_rush.png',
        ['12:00 PM', '4:00 PM', '9:15 PM'],
        'A street racer must win an underground tournament to save her brother from a criminal syndicate.'
      )
    ];
  }

  /** Caches all DOM element references for performance. */
  cacheDOM() {
    // Step indicators
    this.stepEls = document.querySelectorAll('.step');
    this.connectorEls = document.querySelectorAll('.step__connector');

    // Sections
    this.movieSection = document.getElementById('movies-section');
    this.seatSection = document.getElementById('seat-section');
    this.bookingSection = document.getElementById('booking-section');

    // Movie grid
    this.moviesGrid = document.getElementById('movies-grid');

    // Seat grid
    this.seatGrid = document.getElementById('seat-grid');
    this.selectedMovieInfo = document.getElementById('selected-movie-info');

    // Booking summary
    this.bookingMovieInfo = document.getElementById('booking-movie-info');
    this.bookingSeatsList = document.getElementById('booking-seats-list');
    this.bookingTotal = document.getElementById('booking-total');
    this.customerName = document.getElementById('customer-name');
    this.customerEmail = document.getElementById('customer-email');
    this.confirmBtn = document.getElementById('confirm-btn');
    this.backToSeatsBtn = document.getElementById('back-to-seats-btn');

    // Receipt modal
    this.modalOverlay = document.getElementById('receipt-modal');
    this.modalContent = document.getElementById('receipt-content');
    this.newBookingBtn = document.getElementById('new-booking-btn');

    // Toast
    this.toast = document.getElementById('toast');
  }

  /** Binds global event listeners. */
  bindEvents() {
    this.confirmBtn.addEventListener('click', () => this.handleConfirmBooking());
    this.backToSeatsBtn.addEventListener('click', () => this.goBackToSeats());
    this.newBookingBtn.addEventListener('click', () => this.resetAll());

    // Close modal by clicking overlay background
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalOverlay.classList.contains('visible')) {
        this.closeModal();
      }
    });
  }

  // ================================================================
  //  MOVIE RENDERING & SELECTION
  // ================================================================

  /** Renders all movie cards into the grid. */
  renderMovies() {
    this.moviesGrid.innerHTML = this.movies.map(movie => `
      <div class="movie-card" data-movie-id="${movie.id}" id="movie-card-${movie.id}">
        <div class="movie-card__poster-wrapper">
          <img class="movie-card__poster" src="${movie.posterUrl}" alt="${movie.title} poster"
               onerror="this.style.display='none'; this.parentElement.querySelector('.movie-card__poster-placeholder').style.display='flex';">
          <div class="movie-card__poster-placeholder" style="display:none;">🎬</div>
        </div>
        <div class="movie-card__info">
          <h3 class="movie-card__title">${movie.title}</h3>
          <div class="movie-card__meta">
            <span class="movie-card__badge movie-card__badge--genre">${movie.genre}</span>
            <span class="movie-card__badge movie-card__badge--rating">★ ${movie.rating}</span>
            <span class="movie-card__badge movie-card__badge--duration">⏱ ${movie.duration}</span>
          </div>
          <p class="movie-card__description">${movie.description}</p>
          <div class="movie-card__schedules">
            ${movie.getSchedules().map(time => `
              <button class="movie-card__schedule-btn"
                      data-movie-id="${movie.id}"
                      data-schedule="${time}"
                      id="schedule-${movie.id}-${time.replace(/[: ]/g, '')}">
                ${time}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Bind movie card click events
    this.moviesGrid.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('movie-card__schedule-btn')) {
          const movieId = parseInt(card.dataset.movieId);
          this.selectMovie(movieId);
        }
      });
    });

    // Bind schedule button events
    this.moviesGrid.querySelectorAll('.movie-card__schedule-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const movieId = parseInt(btn.dataset.movieId);
        const schedule = btn.dataset.schedule;
        this.selectMovie(movieId);
        this.selectSchedule(schedule);
      });
    });
  }

  /**
   * Highlights the selected movie card.
   * @param {number} movieId
   */
  selectMovie(movieId) {
    this.selectedMovie = this.movies.find(m => m.id === movieId);
    this.selectedSchedule = null;
    this.selectedSeats = [];

    // Highlight selected card, deselect others
    this.moviesGrid.querySelectorAll('.movie-card').forEach(card => {
      card.classList.toggle('selected', parseInt(card.dataset.movieId) === movieId);
    });

    // Clear schedule selection
    this.moviesGrid.querySelectorAll('.movie-card__schedule-btn').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Hide downstream sections
    this.seatSection.classList.remove('visible');
    this.bookingSection.classList.remove('visible');
    this.updateSteps(1);
  }

  /**
   * Locks in the selected showtime, generates seat map, renders seats.
   * @param {string} schedule - e.g. "7:30 PM"
   */
  selectSchedule(schedule) {
    if (!this.selectedMovie) return;

    this.selectedSchedule = schedule;
    this.selectedSeats = [];

    // Highlight selected schedule button
    this.moviesGrid.querySelectorAll('.movie-card__schedule-btn').forEach(btn => {
      const isMatch =
        parseInt(btn.dataset.movieId) === this.selectedMovie.id &&
        btn.dataset.schedule === schedule;
      btn.classList.toggle('selected', isMatch);
    });

    // Generate seats, render, show section
    this.generateSeats();
    this.renderSeats();
    this.renderSelectedMovieInfo();

    this.seatSection.classList.add('visible');
    this.bookingSection.classList.remove('visible');
    this.updateSteps(2);

    // Smooth-scroll to seat section
    setTimeout(() => {
      this.seatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ================================================================
  //  SEAT GENERATION & RENDERING
  // ================================================================

  /**
   * Generates an 8-row × 12-seat cinema layout.
   * Rows A–F are Regular seats (₱250).
   * Rows G–H are Premium seats (₱400) — PremiumSeat class.
   * ~25% of seats are pre-booked to simulate real conditions.
   */
  generateSeats() {
    this.seatMap.clear();

    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const premiumRows = new Set(['G', 'H']);

    // Seed-based pseudo-random for consistent "booked" patterns per showing
    const seed = this.hashCode(`${this.selectedMovie.id}-${this.selectedSchedule}`);

    rows.forEach(row => {
      for (let num = 1; num <= seatsPerRow; num++) {
        let seat;

        if (premiumRows.has(row)) {
          // INHERITANCE: PremiumSeat extends Seat
          seat = new PremiumSeat(row, num);
        } else {
          seat = new Seat(row, num);
        }

        // Randomly pre-book ~25% of seats
        const seatSeed = this.hashCode(`${seed}-${row}-${num}`);
        if (Math.abs(seatSeed % 100) < 25) {
          seat.book(); // ENCAPSULATION: controlled state change
        }

        this.seatMap.set(`${row}-${num}`, seat);
      }
    });
  }

  /**
   * Simple deterministic hash for seeded randomness.
   * @param {string} str
   * @returns {number}
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return hash;
  }

  /** Renders the interactive cinema seat grid. */
  renderSeats() {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const premiumRows = new Set(['G', 'H']);

    this.seatGrid.innerHTML = rows.map(row => {
      const isPremiumRow = premiumRows.has(row);
      const seatsHtml = [];

      for (let num = 1; num <= seatsPerRow; num++) {
        const seat = this.seatMap.get(`${row}-${num}`);
        const isPremium = seat.type === 'premium';
        const isBooked = seat.isBooked;

        let classes = 'seat';
        if (isBooked) {
          classes += ' seat--booked';
          if (isPremium) classes += ' seat--premium';
        } else if (isPremium) {
          classes += ' seat--premium';
        } else {
          classes += ' seat--available';
        }

        const tooltip = `${seat.seatLabel} — ${seat.type === 'premium' ? 'Premium' : 'Regular'} (₱${seat.calculatePrice()})`;

        seatsHtml.push(`
          <button class="${classes}"
                  data-row="${row}" data-number="${num}"
                  title="${tooltip}"
                  ${isBooked ? 'disabled aria-label="Seat ' + seat.seatLabel + ' — Booked"' : 'aria-label="Seat ' + seat.seatLabel + '"'}
                  id="seat-${row}${num}">
          </button>
        `);

        // Add aisle gaps after seat 3 and seat 9
        if (num === 3 || num === 9) {
          seatsHtml.push('<div class="seat-row__gap"></div>');
        }
      }

      return `
        <div class="seat-row ${isPremiumRow ? 'seat-row--premium' : ''}">
          <span class="seat-row__label">${row}</span>
          <div class="seat-row__seats">
            ${seatsHtml.join('')}
          </div>
          <span class="seat-row__label">${row}</span>
        </div>
      `;
    }).join('');

    // Bind seat click events — available seats
    this.seatGrid.querySelectorAll('.seat:not(.seat--booked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.dataset.row;
        const number = parseInt(btn.dataset.number);
        this.toggleSeat(row, number, btn);
      });
    });

    // Bind booked seat clicks — show error toast
    this.seatGrid.querySelectorAll('.seat.seat--booked').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showToast('🚫 This seat is already booked', 'error');
      });
    });
  }

  /**
   * Toggles a seat's selection state.
   * @param {string} row
   * @param {number} number
   * @param {HTMLElement} btnEl
   */
  toggleSeat(row, number, btnEl) {
    const key = `${row}-${number}`;
    const seat = this.seatMap.get(key);
    const idx = this.selectedSeats.findIndex(s => s.seatLabel === seat.seatLabel);

    if (idx > -1) {
      // ---- Deselect ----
      this.selectedSeats.splice(idx, 1);
      btnEl.classList.remove('seat--selected');
      // Restore original class
      if (seat.type === 'premium') {
        btnEl.classList.add('seat--premium');
      } else {
        btnEl.classList.add('seat--available');
      }
    } else {
      // ---- Select ----
      if (this.selectedSeats.length >= 10) {
        this.showToast('⚠️ Maximum 10 seats per booking', 'error');
        return;
      }
      this.selectedSeats.push(seat);
      btnEl.classList.remove('seat--available', 'seat--premium');
      btnEl.classList.add('seat--selected');
      if (seat.type === 'premium') {
        btnEl.classList.add('seat--premium');
      }
    }

    this.updateBookingSummary();
  }

  /** Updates the movie info shown above the seat grid. */
  renderSelectedMovieInfo() {
    if (!this.selectedMovie) return;
    this.selectedMovieInfo.innerHTML = `
      <strong>${this.selectedMovie.title}</strong> — ${this.selectedSchedule}
    `;
  }

  // ================================================================
  //  BOOKING SUMMARY
  // ================================================================

  /** Updates the booking summary section with current selections. */
  updateBookingSummary() {
    if (this.selectedSeats.length === 0) {
      this.bookingSection.classList.remove('visible');
      this.updateSteps(2);
      return;
    }

    this.bookingSection.classList.add('visible');
    this.updateSteps(3);

    // Movie details
    this.bookingMovieInfo.innerHTML = `
      <img class="booking-movie__poster"
           src="${this.selectedMovie.posterUrl}"
           alt="${this.selectedMovie.title}"
           onerror="this.style.display='none';">
      <div class="booking-movie__details">
        <h4>${this.selectedMovie.title}</h4>
        <p>🕐 ${this.selectedSchedule} · ${this.selectedMovie.duration}</p>
        <p>🎭 ${this.selectedMovie.genre}</p>
      </div>
    `;

    // Sort seats by row then number
    const sortedSeats = [...this.selectedSeats].sort((a, b) => {
      if (a.row !== b.row) return a.row.localeCompare(b.row);
      return a.number - b.number;
    });

    // Seats list with prices (POLYMORPHISM: calculatePrice() differs by type)
    this.bookingSeatsList.innerHTML = sortedSeats.map(seat => `
      <li class="booking-seats__item">
        <span class="booking-seats__label">
          Seat ${seat.seatLabel}
          <span class="booking-seats__type booking-seats__type--${seat.type}">
            ${seat.type}
          </span>
        </span>
        <span class="booking-seats__price">₱${seat.calculatePrice().toLocaleString()}</span>
      </li>
    `).join('');

    // Total price — uses polymorphic calculatePrice()
    const total = this.selectedSeats.reduce((sum, s) => sum + s.calculatePrice(), 0);
    this.bookingTotal.innerHTML = `
      <span class="booking-total__label">Total (${this.selectedSeats.length} seat${this.selectedSeats.length !== 1 ? 's' : ''})</span>
      <span class="booking-total__price">₱${total.toLocaleString()}</span>
    `;

    // Auto-scroll on first seat selection
    if (this.selectedSeats.length === 1) {
      setTimeout(() => {
        this.bookingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }

  // ================================================================
  //  BOOKING CONFIRMATION
  // ================================================================

  /**
   * Validates input, creates Customer and Booking objects,
   * confirms the booking, and displays the receipt modal.
   *
   * Demonstrates ABSTRACTION: the complex booking flow
   * (validate → calculate → reserve → confirm) is hidden
   * inside booking.confirmBooking().
   */
  handleConfirmBooking() {
    const name = this.customerName.value.trim();
    const email = this.customerEmail.value.trim();

    // Validate inputs
    if (!name) {
      this.showToast('📝 Please enter your name', 'error');
      this.customerName.focus();
      return;
    }

    if (!email || !email.includes('@')) {
      this.showToast('📧 Please enter a valid email', 'error');
      this.customerEmail.focus();
      return;
    }

    if (this.selectedSeats.length === 0) {
      this.showToast('💺 Please select at least one seat', 'error');
      return;
    }

    try {
      // Create Customer object (ENCAPSULATION: validated via setters)
      const customer = new Customer(name, email);

      // Create Booking object
      const booking = new Booking(
        this.selectedMovie,
        this.selectedSchedule,
        this.selectedSeats,
        customer
      );

      // ABSTRACTION: one method call handles the entire process
      const receipt = booking.confirmBooking();

      this.bookings.push(booking);
      this.showReceipt(receipt);
      this.showToast('🎉 Booking confirmed successfully!', 'success');

    } catch (error) {
      this.showToast(`❌ ${error.message}`, 'error');
    }
  }

  // ================================================================
  //  RECEIPT MODAL
  // ================================================================

  /**
   * Displays the receipt modal with booking details.
   * @param {Object} receipt - Receipt data from Booking.generateReceipt()
   */
  showReceipt(receipt) {
    this.modalContent.innerHTML = `
      <div class="receipt">
        <div class="receipt__row">
          <span class="receipt__label">Movie</span>
          <span class="receipt__value">${receipt.movie}</span>
        </div>
        <div class="receipt__row">
          <span class="receipt__label">Genre</span>
          <span class="receipt__value">${receipt.genre}</span>
        </div>
        <div class="receipt__row">
          <span class="receipt__label">Schedule</span>
          <span class="receipt__value">${receipt.schedule}</span>
        </div>
        <div class="receipt__row">
          <span class="receipt__label">Duration</span>
          <span class="receipt__value">${receipt.duration}</span>
        </div>
        <hr class="receipt__divider">
        <div class="receipt__row">
          <span class="receipt__label">Customer</span>
          <span class="receipt__value">${receipt.customer.name}</span>
        </div>
        <div class="receipt__row">
          <span class="receipt__label">Email</span>
          <span class="receipt__value">${receipt.customer.email}</span>
        </div>
        <hr class="receipt__divider">
        ${receipt.seats.map(s => `
          <div class="receipt__row">
            <span class="receipt__label">
              Seat ${s.label}
              <small style="opacity:0.6;">(${s.type})</small>
            </span>
            <span class="receipt__value">₱${s.price.toLocaleString()}</span>
          </div>
        `).join('')}
        <hr class="receipt__divider">
        <div class="receipt__row receipt__total">
          <span class="receipt__label">Total Paid</span>
          <span class="receipt__value">₱${receipt.totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <div class="receipt__booking-id">
        🎫 ${receipt.bookingId}
      </div>
    `;

    this.modalOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  /** Closes the receipt modal. */
  closeModal() {
    this.modalOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  // ================================================================
  //  NAVIGATION HELPERS
  // ================================================================

  /** Scrolls back to the seat selection section. */
  goBackToSeats() {
    this.seatSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Resets the entire app state for a new booking. */
  resetAll() {
    this.closeModal();
    this.selectedMovie = null;
    this.selectedSchedule = null;
    this.seatMap.clear();
    this.selectedSeats = [];

    // Reset UI
    this.moviesGrid.querySelectorAll('.movie-card').forEach(c =>
      c.classList.remove('selected')
    );
    this.moviesGrid.querySelectorAll('.movie-card__schedule-btn').forEach(b =>
      b.classList.remove('selected')
    );
    this.seatSection.classList.remove('visible');
    this.bookingSection.classList.remove('visible');
    this.customerName.value = '';
    this.customerEmail.value = '';
    this.updateSteps(1);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Updates the step indicator at the top of the page.
   * @param {number} activeStep - 1, 2, or 3
   */
  updateSteps(activeStep) {
    this.stepEls.forEach((step, idx) => {
      const stepNum = idx + 1;
      step.classList.remove('active', 'completed');
      if (stepNum === activeStep) {
        step.classList.add('active');
      } else if (stepNum < activeStep) {
        step.classList.add('completed');
      }
    });

    this.connectorEls.forEach((conn, idx) => {
      conn.classList.toggle('completed', idx + 1 < activeStep);
    });
  }

  /**
   * Shows a temporary toast notification.
   * @param {string} message
   * @param {'error'|'success'} type
   */
  showToast(message, type = 'error') {
    this.toast.textContent = message;
    this.toast.className = `toast toast--${type} visible`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('visible');
    }, 3000);
  }
}

// ================================================================
//  BOOTSTRAP
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.cinemaApp = new CinemaApp();
});
