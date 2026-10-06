/**
 * Timber & Plank Craft Studio - Multi-Step Free Site Measurement Form & Booking Handler
 */

const BookingApp = {
  currentStep: 1,
  totalSteps: 3,

  formData: {
    projectType: 'Hardwood Flooring',
    propertyType: 'Residential Detached Home',
    approxArea: '500 - 1,000 sq ft (Main floor)',
    woodPreference: 'European White Oak (Natural Matte Oil)',
    preferredDate: '',
    preferredTime: 'Morning Window (9:00 AM – 12:00 PM)',
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

    // 1. Service Type param from Pricing / Services
    if (params.get('service')) {
      const srv = params.get('service').toLowerCase();
      const radios = document.querySelectorAll('input[name="projectType"]');
      radios.forEach(r => {
        const val = r.value.toLowerCase();
        if (
          (srv.includes('deck') && val.includes('deck')) ||
          (srv.includes('refinish') && val.includes('refinishing')) ||
          (srv.includes('floor') && val.includes('flooring')) ||
          (srv.includes('commercial') && val.includes('commercial')) ||
          (srv.includes('heritage') && val.includes('heritage'))
        ) {
          r.checked = true;
          this.formData.projectType = r.value;
        }
      });
    }

    // 2. Material / Wood species param from Products / Pricing
    if (params.get('material')) {
      const matParam = params.get('material');
      const matLower = matParam.toLowerCase();
      const woodSelect = document.getElementById('book-wood-pref');
      if (woodSelect) {
        let matched = false;
        for (let i = 0; i < woodSelect.options.length; i++) {
          const optText = woodSelect.options[i].text.toLowerCase();
          const cleanParam = matLower.split('(')[0].trim();
          if (optText.includes(cleanParam) || cleanParam.includes(optText.split('(')[0].trim())) {
            woodSelect.selectedIndex = i;
            this.formData.woodPreference = woodSelect.options[i].text;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const newOpt = new Option(matParam, matParam, true, true);
          woodSelect.add(newOpt);
          this.formData.woodPreference = matParam;
        }
      }
    }

    // 3. Area param from Pricing calculator
    if (params.get('area')) {
      const area = parseInt(params.get('area'), 10);
      let rangeText = '500 - 1,000 sq ft (Main floor)';
      if (area < 500) rangeText = 'Under 500 sq ft (1 or 2 rooms)';
      else if (area > 2000) rangeText = 'Over 2,000 sq ft (Estate / Commercial)';
      else if (area > 1000) rangeText = '1,000 - 2,000 sq ft (Whole residence)';

      this.formData.approxArea = rangeText;
      const areaSelect = document.getElementById('book-area');
      if (areaSelect) areaSelect.value = rangeText;
    }

    // 4. Sample swatches param from Drawer
    let notesArr = [];
    if (params.get('samples')) {
      notesArr.push(`Requested free sample swatches: ${params.get('samples')}`);
      showToast('Loaded your sample swatch selections into the consultation form!', 'info');
    }

    // 5. Estimate range from Calculator
    if (params.get('estLow') && params.get('estHigh')) {
      const formatINR = (val) => '₹' + Math.round(Number(val)).toLocaleString('en-IN');
      notesArr.push(`Online estimate reference: ${formatINR(params.get('estLow'))} – ${formatINR(params.get('estHigh'))}`);
    }

    if (notesArr.length > 0) {
      this.formData.notes = notesArr.join('\n');
      const notesField = document.getElementById('book-notes');
      if (notesField) notesField.value = this.formData.notes;
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

    // Real-time sanitizers
    const phoneInput = document.getElementById('book-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        // Prevent alphabetic characters
        e.target.value = e.target.value.replace(/[a-zA-Z]/g, '');
      });
    }

    const nameInput = document.getElementById('book-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        // Prevent digits in name
        e.target.value = e.target.value.replace(/[0-9]/g, '');
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

      // Ensure chosen date is not in the past
      const selectedDate = new Date(date.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showToast('Please choose an upcoming date (tomorrow or later).', 'warning');
        if (date) date.focus();
        return false;
      }

      if (!address || !address.value.trim() || address.value.trim().length < 5) {
        showToast('Please enter your property site address (at least 5 characters).', 'warning');
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
    // Hide / show panels and update indicators
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
          indicator.classList.remove('bg-[#f0e8dc]', 'text-[#8c786a]', 'bg-[#2c1d16]');
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

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';

    // 1. Name Field Validation (Rejects single-letter names, requires at least 2 alphabetic characters)
    const nameRegex = /^[a-zA-Z\s'.\-]{2,60}$/;
    const nameLetterCount = (nameVal.match(/[a-zA-Z]/g) || []).length;
    if (!nameVal || nameVal.length < 2 || !nameRegex.test(nameVal) || nameLetterCount < 2) {
      showToast('Please provide a valid full name with at least 2 alphabetic characters.', 'warning');
      if (nameInput) nameInput.focus();
      return;
    }

    // 2. Phone Number Validation (Rejects alphabetic characters, enforces valid digits format)
    if (!phoneVal) {
      showToast('Please provide a phone number for appointment confirmation.', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    if (/[a-zA-Z]/.test(phoneVal)) {
      showToast('Phone number cannot contain alphabetic characters. Please enter numbers only.', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      showToast('Please enter a valid phone number (between 7 and 15 digits).', 'warning');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // 3. Email Field Validation (Rejects invalid formats like ice@g, requires valid TLD)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailVal && !emailRegex.test(emailVal)) {
      showToast('Please provide a valid email address with a proper domain (e.g. name@example.com).', 'warning');
      if (emailInput) emailInput.focus();
      return;
    }

    this.formData.fullName = nameVal;
    this.formData.phone = phoneVal;
    this.formData.email = emailVal;
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

    // Reset Form back to Step 1
    const form = document.getElementById('site-measure-form');
    if (form) form.reset();
    this.currentStep = 1;
    this.updateStepView();

    // Show Confirmation Modal & Refresh List
    this.showConfirmationModal(newBooking);
    this.renderExistingBookings();
  },

  showConfirmationModal(booking) {
    // Remove existing modal if any
    const existing = document.getElementById('booking-confirmed-modal');
    if (existing) existing.remove();

    const modalHtml = `
      <div id="booking-confirmed-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm modal-fade-in">
        <div class="bg-[#fbf9f5] dark:bg-[#1f1712] border border-[#e3d7c5] dark:border-[#38271e] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative text-center">
          
          <!-- Close X button -->
          <button type="button" onclick="document.getElementById('booking-confirmed-modal').remove()" class="absolute top-4 right-4 p-2 text-[#8c786a] hover:text-[#1b130e] dark:hover:text-white transition" aria-label="Close modal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>

          <span class="text-xs uppercase tracking-widest text-[#c58940] font-bold">Appointment Confirmed</span>
          <h3 class="text-2xl font-serif font-bold text-[#2c1d16] dark:text-[#f7f3ed] mt-1 mb-2">Free Laser Measurement Reserved</h3>
          <p class="text-sm text-[#5a3a29] dark:text-[#c4b5a5] mb-6">A Master Craft Estimator has been reserved for your site assessment. A calendar invitation has been prepared for ${booking.email ? booking.email : booking.phone}.</p>

          <div class="bg-[#f0e8dc] dark:bg-[#281c15] p-5 rounded-2xl border border-[#e4d8c7] dark:border-[#38271e] text-left text-xs space-y-2 mb-6">
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Confirmation Ref:</span>
              <span class="font-mono font-bold text-[#2c1d16] dark:text-[#f7f3ed]">${booking.ref}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Scheduled Date:</span>
              <span class="font-semibold text-[#1b130e] dark:text-[#f7f3ed]">${booking.preferredDate} (${booking.preferredTime})</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Selected Scope:</span>
              <span class="font-semibold text-[#1b130e] dark:text-[#f7f3ed]">${booking.projectType} • ${booking.woodPreference}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#8c786a]">Property Address:</span>
              <span class="font-semibold text-[#1b130e] dark:text-[#f7f3ed] truncate max-w-[240px]">${booking.address}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="window.print()" class="flex-1 py-3 bg-[#2c1d16] hover:bg-[#1b130e] text-white rounded-xl text-xs sm:text-sm font-medium transition flex items-center justify-center gap-1.5 shadow">
              <svg class="w-4 h-4 text-[#c58940]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              <span>Print Confirmation</span>
            </button>
            <button onclick="document.getElementById('booking-confirmed-modal').remove(); document.getElementById('recent-bookings-list').scrollIntoView({ behavior: 'smooth' });" class="flex-1 py-3 bg-[#c58940] hover:bg-[#b07730] text-white rounded-xl text-xs sm:text-sm font-medium transition shadow">
              View My Bookings
            </button>
          </div>
          <div class="mt-3">
            <a href="index.html" class="inline-block text-xs text-[#8c786a] hover:text-[#c58940] transition underline underline-offset-4">
              Return to Studio Showroom
            </a>
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
        <div class="text-center py-6 px-4 bg-white dark:bg-[#1f1712] border border-[#e4d8c7] dark:border-[#38271e] rounded-2xl text-xs text-[#8c786a]">
          No site appointments scheduled yet. Complete the 3-step form above to reserve your free laser measurement.
        </div>
      `;
      return;
    }

    listEl.innerHTML = saved.slice(0, 5).map(b => `
      <div class="p-4 bg-white dark:bg-[#1f1712] border border-[#e4d8c7] dark:border-[#38271e] rounded-xl flex items-center justify-between text-xs hover:border-[#c58940] transition shadow-sm">
        <div class="min-w-0 pr-3">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-[#2c1d16] dark:text-[#f7f3ed]">${b.ref}</span>
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[10px]">Confirmed</span>
          </div>
          <p class="text-[#5a3a29] dark:text-[#c4b5a5] mt-1 font-medium truncate">${b.projectType} • ${b.preferredDate} (${b.preferredTime})</p>
          <p class="text-[#8c786a] text-[11px] truncate max-w-sm mt-0.5">${b.address}</p>
        </div>
        <button onclick="BookingApp.cancelBooking('${b.ref}')" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition flex-shrink-0" title="Cancel booking" aria-label="Cancel booking">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
