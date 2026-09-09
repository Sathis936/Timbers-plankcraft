/**
 * Timber & Plank Craft Studio - Multi-Step Free Site Measurement Form & Booking Handler
 */

const BookingApp = {
  currentStep: 1,
  totalSteps: 3,

  formData: {
    projectType: 'Hardwood Flooring',
    propertyType: 'Residential Residence',
    approxArea: '500 - 1,000 sq ft',
    woodPreference: 'European White Oak',
    preferredDate: '',
    preferredTime: 'Morning (9:00 AM - 12:00 PM)',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  },

  init() {
    this.checkQueryParams();
    this.bindEvents();
    this.updateStepView();
    this.renderExistingBookings();
  },

  checkQueryParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('samples')) {
      this.formData.notes = `Requested free sample swatches: ${params.get('samples')}`;
      const notesField = document.getElementById('book-notes');
      if (notesField) notesField.value = this.formData.notes;
      showToast('Loaded your sample swatch selections into the consultation form!', 'info');
    }

    if (params.get('material')) {
      this.formData.woodPreference = params.get('material');
      const woodSelect = document.getElementById('book-wood-pref');
      if (woodSelect) woodSelect.value = params.get('material');
    }

    if (params.get('area')) {
      const area = parseInt(params.get('area'), 10);
      let rangeText = '500 - 1,000 sq ft';
      if (area < 500) rangeText = 'Under 500 sq ft';
      else if (area > 2000) rangeText = 'Over 2,000 sq ft';
      else if (area > 1000) rangeText = '1,000 - 2,000 sq ft';

      this.formData.approxArea = rangeText;
      const areaSelect = document.getElementById('book-area');
      if (areaSelect) areaSelect.value = rangeText;
    }
  },

  bindEvents() {
    // Next buttons
    const nextButtons = document.querySelectorAll('.btn-step-next');
    nextButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.validateCurrentStep()) {
          this.currentStep++;
          this.updateStepView();
        }
      });
    });

    // Prev buttons
    const prevButtons = document.querySelectorAll('.btn-step-prev');
    prevButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentStep--;
        this.updateStepView();
      });
    });

    // Form submission
    const form = document.getElementById('site-measure-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitBooking();
      });
    }

    // Set min date to tomorrow
    const dateInput = document.getElementById('book-date');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
    }
  },

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const pType = document.querySelector('input[name="projectType"]:checked');
      if (pType) this.formData.projectType = pType.value;

      const propType = document.getElementById('book-property-type');
      if (propType) this.formData.propertyType = propType.value;

      const area = document.getElementById('book-area');
      if (area) this.formData.approxArea = area.value;

      const wood = document.getElementById('book-wood-pref');
      if (wood) this.formData.woodPreference = wood.value;

      return true;
    }

    if (this.currentStep === 2) {
      const date = document.getElementById('book-date');
      const time = document.getElementById('book-time');
      const address = document.getElementById('book-address');

      if (!date || !date.value) {
        showToast('Please select your preferred consultation date.', 'warning');
        if (date) date.focus();
        return false;
      }

      if (!address || !address.value.trim()) {
        showToast('Please enter your property site address for measurement.', 'warning');
        if (address) address.focus();
        return false;
      }

      this.formData.preferredDate = date.value;
      if (time) this.formData.preferredTime = time.value;
      this.formData.address = address.value.trim();

      return true;
    }

    return true;
  },

  updateStepView() {
    // Hide all step sections
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`step-panel-${i}`);
      const indicator = document.getElementById(`step-indicator-${i}`);
      if (stepEl) {
        if (i === this.currentStep) {
          stepEl.classList.remove('hidden');
          stepEl.classList.add('modal-fade-in');
        } else {
          stepEl.classList.add('hidden');
        }
      }

      if (indicator) {
        if (i === this.currentStep) {
          indicator.classList.remove('bg-[#f0e8dc]', 'text-[#8c786a]');
          indicator.classList.add('bg-[#c58940]', 'text-white', 'font-bold');
        } else if (i < this.currentStep) {
          indicator.classList.remove('bg-[#f0e8dc]', 'text-[#8c786a]', 'bg-[#c58940]');
          indicator.classList.add('bg-[#2c1d16]', 'text-white');
        } else {
          indicator.classList.remove('bg-[#c58940]', 'bg-[#2c1d16]', 'text-white');
          indicator.classList.add('bg-[#f0e8dc]', 'text-[#8c786a]');
        }
      }
    }

    // Step 3 Review updates
    if (this.currentStep === 3) {
      const reviewScope = document.getElementById('review-scope');
      const reviewSchedule = document.getElementById('review-schedule');
      const reviewAddress = document.getElementById('review-address');

      if (reviewScope) {
        reviewScope.textContent = `${this.formData.projectType} • ${this.formData.woodPreference} (${this.formData.approxArea})`;
      }
      if (reviewSchedule) {
        reviewSchedule.textContent = `${this.formData.preferredDate} (${this.formData.preferredTime})`;
      }
      if (reviewAddress) {
        reviewAddress.textContent = this.formData.address;
      }
    }
  },

  submitBooking() {
    const nameInput = document.getElementById('book-name');
    const phoneInput = document.getElementById('book-phone');
    const emailInput = document.getElementById('book-email');
    const notesInput = document.getElementById('book-notes');

    if (!nameInput || !nameInput.value.trim()) {
      showToast('Please provide your full name.', 'warning');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!phoneInput || !phoneInput.value.trim()) {
      showToast('Please provide a phone number for appointment confirmation.', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    this.formData.fullName = nameInput.value.trim();
    this.formData.phone = phoneInput.value.trim();
    this.formData.email = emailInput ? emailInput.value.trim() : '';
    this.formData.notes = notesInput ? notesInput.value.trim() : '';

    const bookingRef = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      ref: bookingRef,
      createdAt: new Date().toISOString(),
      ...this.formData
    };

    // Save to LocalStorage
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('timber_plank_bookings')) || [];
    } catch (e) {
      saved = [];
    }
    saved.unshift(newBooking);
    localStorage.setItem('timber_plank_bookings', JSON.stringify(saved));

    // Show Confirmation Modal
    this.showConfirmationModal(newBooking);
    this.renderExistingBookings();
  },

  showConfirmationModal(booking) {
    const modalHtml = `
      <div id="booking-confirmed-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm modal-fade-in">
        <div class="bg-[#fbf9f5] border border-[#e3d7c5] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative text-center">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <span class="text-xs uppercase tracking-widest text-[#c58940] font-bold">Appointment Confirmed</span>
          <h3 class="text-2xl font-serif font-bold text-[#2c1d16] mt-1 mb-2">Free Laser Measurement Reserved</h3>
          <p class="text-sm text-[#5a3a29] mb-6">A Master Craft Estimator has been reserved for your site assessment. A calendar invitation has been simulated to your email.</p>

          <div class="bg-[#f0e8dc] p-5 rounded-2xl border border-[#e4d8c7] text-left text-xs space-y-2 mb-6">
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Confirmation Ref:</span>
              <span class="font-mono font-bold text-[#2c1d16]">${booking.ref}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Scheduled Date:</span>
              <span class="font-semibold text-[#1b130e]">${booking.preferredDate} (${booking.preferredTime})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Assigned Estimator:</span>
              <span class="font-semibold text-[#1b130e]">Arthur Vance (Senior Flooring Artisan)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Property Address:</span>
              <span class="font-semibold text-[#1b130e]">${booking.address}</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button onclick="window.print()" class="flex-1 py-3 bg-[#2c1d16] hover:bg-[#1b130e] text-white rounded-xl text-sm font-medium transition">
              Print Confirmation
            </button>
            <button onclick="document.getElementById('booking-confirmed-modal').remove(); window.location.href='index.html';" class="flex-1 py-3 bg-[#c58940] hover:bg-[#b07730] text-white rounded-xl text-sm font-medium transition">
              Return to Showroom
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  renderExistingBookings() {
    const listEl = document.getElementById('recent-bookings-list');
    if (!listEl) return;

    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('timber_plank_bookings')) || [];
    } catch (e) {
      saved = [];
    }

    if (saved.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-6 text-xs text-[#8c786a]">
          No site appointments scheduled yet. Complete the form above to reserve your free laser measurement.
        </div>
      `;
      return;
    }

    listEl.innerHTML = saved.slice(0, 3).map(b => `
      <div class="p-4 bg-white border border-[#e4d8c7] rounded-xl flex items-center justify-between text-xs hover:border-[#c58940] transition">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-[#2c1d16]">${b.ref}</span>
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[10px]">Confirmed</span>
          </div>
          <p class="text-[#5a3a29] mt-0.5">${b.projectType} • ${b.preferredDate} (${b.preferredTime})</p>
          <p class="text-[#8c786a] text-[11px] truncate max-w-xs">${b.address}</p>
        </div>
        <button onclick="BookingApp.cancelBooking('${b.ref}')" class="text-red-600 hover:text-red-800 p-2" title="Cancel booking">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    `).join('');
  },

  cancelBooking(ref) {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('timber_plank_bookings')) || [];
    } catch (e) {
      saved = [];
    }
    saved = saved.filter(b => b.ref !== ref);
    localStorage.setItem('timber_plank_bookings', JSON.stringify(saved));
    this.renderExistingBookings();
    showToast('Measurement appointment cancelled.', 'info');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('site-measure-form')) {
    BookingApp.init();
  }
});
