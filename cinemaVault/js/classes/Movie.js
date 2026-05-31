/**
 * Movie Class — Demonstrates ENCAPSULATION
 *
 * All properties are stored as private fields (#).
 * External code can only read data through public getters.
 * Schedules can only be modified through controlled methods
 * (addSchedule / removeSchedule), never directly.
 */
export class Movie {
  // Private fields — cannot be accessed outside this class
  #id;
  #title;
  #genre;
  #duration;
  #rating;
  #posterUrl;
  #schedules;
  #description;

  /**
   * @param {number} id          - Unique identifier
   * @param {string} title       - Movie title
   * @param {string} genre       - Genre label (e.g. "Sci-Fi / Adventure")
   * @param {string} duration    - Runtime string (e.g. "2h 28m")
   * @param {string} rating      - MPAA rating (e.g. "PG-13")
   * @param {string} posterUrl   - Path to the poster image
   * @param {string[]} schedules - Array of showtime strings
   * @param {string} description - Short synopsis
   */
  constructor(id, title, genre, duration, rating, posterUrl, schedules, description) {
    this.#id = id;
    this.#title = title;
    this.#genre = genre;
    this.#duration = duration;
    this.#rating = rating;
    this.#posterUrl = posterUrl;
    this.#schedules = [...schedules]; // Store a copy to prevent external mutation
    this.#description = description;
  }

  // ---- Public Getters (read-only access) ----

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get genre() {
    return this.#genre;
  }

  get duration() {
    return this.#duration;
  }

  get rating() {
    return this.#rating;
  }

  get posterUrl() {
    return this.#posterUrl;
  }

  get description() {
    return this.#description;
  }

  // ---- Controlled Schedule Access ----

  /**
   * Returns a COPY of the schedules array.
   * This prevents external code from mutating the internal array.
   * @returns {string[]}
   */
  getSchedules() {
    return [...this.#schedules];
  }

  /**
   * Adds a new showtime if it doesn't already exist.
   * @param {string} time - Showtime to add (e.g. "9:00 PM")
   */
  addSchedule(time) {
    if (!this.#schedules.includes(time)) {
      this.#schedules.push(time);
    }
  }

  /**
   * Removes a showtime from the schedule.
   * @param {string} time - Showtime to remove
   */
  removeSchedule(time) {
    this.#schedules = this.#schedules.filter(s => s !== time);
  }

  /**
   * Returns a formatted display string for all schedules.
   * @returns {string}
   */
  getScheduleDisplay() {
    return this.#schedules.join(' | ');
  }
}
