/**
 * Timber & Plank Craft Studio - Interactive Flooring & Decking Cost Estimator
 * Currency: Indian Rupee (₹)
 */

const PricingCalculator = {
  // Base rates per sq. ft. in INR (₹)
  materials: {
    // Flooring
    'oak-white': { name: 'European White Oak (Select Grade)', category: 'flooring', baseCost: 950, labor: 350 },
    'walnut-black': { name: 'American Black Walnut', category: 'flooring', baseCost: 1450, labor: 450 },
    'chevron-parquet': { name: 'Artisan French Chevron / Herringbone Parquet', category: 'flooring', baseCost: 1650, labor: 600 },
    'maple-hard': { name: 'Canadian Sugar Maple', category: 'flooring', baseCost: 850, labor: 320 },
    'hickory-handscraped': { name: 'Hand-Scraped Vintage Hickory', category: 'flooring', baseCost: 1100, labor: 380 },
    // Decking
    'ipe-brazilian': { name: 'Brazilian Ipe / Ironwood Hardwood', category: 'decking', baseCost: 1850, labor: 750 },
    'teak-burmese': { name: 'Sustainable Royal Teak Decking', category: 'decking', baseCost: 2200, labor: 850 },
    'composite-ultra': { name: 'Dual-Capped Architectural Composite', category: 'decking', baseCost: 1250, labor: 550 },
    'cumaru-gold': { name: 'Cumaru Golden Chestnut Decking', category: 'decking', baseCost: 1550, labor: 650 },
    // Refinishing
    'refinish-standard': { name: 'Dustless Sanding & 3x German Ceramic Poly', category: 'refinishing', baseCost: 180, labor: 270 },
    'refinish-stain': { name: 'Historic Parquet Sanding + Custom Staining', category: 'refinishing', baseCost: 220, labor: 380 },
    'refinish-deck': { name: 'Exterior Deck Pressure Wash, Sand & UV Marine Oil', category: 'refinishing', baseCost: 160, labor: 290 }
  },

  state: {
    serviceType: 'flooring',
    materialKey: 'oak-white',
    areaSqFt: 650,
    unit: 'sqft',
    pattern: 'straight', // straight, herringbone, chevron, diagonal
    demoOldFloor: true,
    moistureBarrier: true,
    premiumSeal: true,
    stairCount: 0
  },

  currentEstLow: 0,
  currentEstHigh: 0,

  init() {
    this.bindEvents();
    this.calculate();
  },

  bindEvents() {
    // Service Type Buttons
    const serviceButtons = document.querySelectorAll('.calc-service-btn');
    serviceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-service');
        this.setServiceType(type);
      });
    });

    // Material Dropdown
    const materialSelect = document.getElementById('calc-material');
    if (materialSelect) {
      materialSelect.addEventListener('change', (e) => {
        this.state.materialKey = e.target.value;
        this.calculate();
      });
    }

    // Area Slider & Number Input
    const areaSlider = document.getElementById('calc-area-slider');
    const areaInput = document.getElementById('calc-area-input');

    if (areaSlider && areaInput) {
      areaSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.areaSqFt = val;
        areaInput.value = val;
        this.calculate();
      });

      areaInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10) || 100;
        if (val < 50) val = 50;
        if (val > 10000) val = 10000;
        this.state.areaSqFt = val;
        areaSlider.value = Math.min(val, 3000);
        this.calculate();
      });
    }

    // Pattern Select
    const patternSelect = document.getElementById('calc-pattern');
    if (patternSelect) {
      patternSelect.addEventListener('change', (e) => {
        this.state.pattern = e.target.value;
        this.calculate();
      });
    }

    // Checkboxes
    const demoCheck = document.getElementById('calc-demo');
    if (demoCheck) {
      demoCheck.addEventListener('change', (e) => {
        this.state.demoOldFloor = e.target.checked;
        this.calculate();
      });
    }

    const moistureCheck = document.getElementById('calc-moisture');
    if (moistureCheck) {
      moistureCheck.addEventListener('change', (e) => {
        this.state.moistureBarrier = e.target.checked;
        this.calculate();
      });
    }

    const sealCheck = document.getElementById('calc-seal');
    if (sealCheck) {
      sealCheck.addEventListener('change', (e) => {
        this.state.premiumSeal = e.target.checked;
        this.calculate();
      });
    }

    // Stair Counter
    const stairMinus = document.getElementById('calc-stair-minus');
    const stairPlus = document.getElementById('calc-stair-plus');
    const stairDisplay = document.getElementById('calc-stair-count');

    if (stairMinus && stairPlus && stairDisplay) {
      stairMinus.addEventListener('click', () => {
        if (this.state.stairCount > 0) {
          this.state.stairCount--;
          stairDisplay.textContent = this.state.stairCount;
          this.calculate();
        }
      });
      stairPlus.addEventListener('click', () => {
        if (this.state.stairCount < 40) {
          this.state.stairCount++;
          stairDisplay.textContent = this.state.stairCount;
          this.calculate();
        }
      });
    }

    // Save & Print Modal
    const printBtn = document.getElementById('calc-print-btn');
    const bookWithEstimateBtn = document.getElementById('calc-book-btn');

    if (printBtn) {
      printBtn.addEventListener('click', () => this.openPrintModal());
    }

    if (bookWithEstimateBtn) {
      bookWithEstimateBtn.addEventListener('click', () => {
        const queryParams = new URLSearchParams({
          service: this.state.serviceType,
          material: this.materials[this.state.materialKey].name,
          area: this.state.areaSqFt,
          estLow: this.currentEstLow,
          estHigh: this.currentEstHigh
        });
        window.location.href = `contact.html?${queryParams.toString()}`;
      });
    }
  },

  setServiceType(type) {
    this.state.serviceType = type;

    // Update button visual styles
    document.querySelectorAll('.calc-service-btn').forEach(btn => {
      if (btn.getAttribute('data-service') === type) {
        btn.classList.add('bg-[#c58940]', 'text-white', 'shadow-md');
        btn.classList.remove('bg-white', 'text-[#5a3a29]', 'hover:bg-[#f3ede2]');
      } else {
        btn.classList.remove('bg-[#c58940]', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-[#5a3a29]', 'hover:bg-[#f3ede2]');
      }
    });

    // Repopulate Material select
    const materialSelect = document.getElementById('calc-material');
    if (materialSelect) {
      materialSelect.innerHTML = '';
      let firstKey = '';
      Object.entries(this.materials).forEach(([key, mat]) => {
        if (mat.category === type) {
          if (!firstKey) firstKey = key;
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = `${mat.name} (₹${mat.baseCost.toLocaleString('en-IN')}/sq.ft material)`;
          materialSelect.appendChild(opt);
        }
      });
      this.state.materialKey = firstKey;
      materialSelect.value = firstKey;
    }

    // Toggle pattern dropdown visibility based on service
    const patternWrapper = document.getElementById('calc-pattern-wrapper');
    if (patternWrapper) {
      if (type === 'decking' || type === 'refinishing') {
        patternWrapper.classList.add('opacity-40', 'pointer-events-none');
      } else {
        patternWrapper.classList.remove('opacity-40', 'pointer-events-none');
      }
    }

    this.calculate();
  },

  calculate() {
    const mat = this.materials[this.state.materialKey] || this.materials['oak-white'];
    const sqFt = this.state.areaSqFt;

    // Pattern multiplier
    let patternMultiplier = 1.0;
    if (this.state.serviceType === 'flooring') {
      if (this.state.pattern === 'herringbone') patternMultiplier = 1.25;
      else if (this.state.pattern === 'chevron') patternMultiplier = 1.30;
      else if (this.state.pattern === 'diagonal') patternMultiplier = 1.15;
    }

    // 1. Material Cost (with standard 10% cutting waste allowance)
    const wasteFactor = 1.10;
    const materialCost = sqFt * mat.baseCost * wasteFactor;

    // 2. Installation Labor Cost
    let laborRate = mat.labor * patternMultiplier;
    const laborCost = sqFt * laborRate;

    // 3. Prep & Add-ons in INR
    let prepCost = 0;
    if (this.state.demoOldFloor) {
      prepCost += sqFt * 90; // Old floor removal & disposal
    }
    if (this.state.moistureBarrier) {
      prepCost += sqFt * 120; // Acoustic cork / vapor barrier
    }
    if (this.state.premiumSeal) {
      prepCost += sqFt * 110; // High-traffic nano-ceramic finish
    }

    // 4. Stairs (₹1,800 per tread)
    const stairsCost = this.state.stairCount * 1800;

    const subtotal = materialCost + laborCost + prepCost + stairsCost;
    const estLow = Math.round(subtotal * 0.95);
    const estHigh = Math.round(subtotal * 1.08);

    this.currentEstLow = estLow;
    this.currentEstHigh = estHigh;

    // Format Indian Rupee currency
    const formatINR = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

    // Update UI labels
    this.updateElementText('calc-total-range', `${formatINR(estLow)} - ${formatINR(estHigh)}`);
    this.updateElementText('calc-avg-sqft', `₹${Math.round(subtotal / sqFt).toLocaleString('en-IN')}`);
    this.updateElementText('calc-breakdown-material', formatINR(materialCost));
    this.updateElementText('calc-breakdown-labor', formatINR(laborCost));
    this.updateElementText('calc-breakdown-prep', formatINR(prepCost));
    this.updateElementText('calc-breakdown-stairs', formatINR(stairsCost));
    this.updateElementText('calc-summary-area', `${sqFt} sq. ft.`);
    this.updateElementText('calc-summary-wood', mat.name);
  },

  updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  openPrintModal() {
    const mat = this.materials[this.state.materialKey];
    const formatINR = (val) => '₹' + Math.round(val).toLocaleString('en-IN');

    const modalHtml = `
      <div id="print-quote-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm modal-fade-in">
        <div class="bg-[#fbf9f5] border border-[#e3d7c5] rounded-2xl max-w-xl w-full p-8 shadow-2xl relative text-[#1b130e]">
          <button onclick="document.getElementById('print-quote-modal').remove()" class="absolute top-4 right-4 p-2 text-[#8c786a] hover:text-[#1b130e]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="border-b border-[#e3d7c5] pb-4 mb-6">
            <span class="text-xs tracking-widest uppercase font-semibold text-[#c58940]">Timber & Plank Craft Studio</span>
            <h3 class="text-2xl font-serif font-bold text-[#2c1d16] mt-1">Official Estimate Preview</h3>
            <p class="text-xs text-[#8c786a]">Estimate Ref: TP-${Math.floor(100000 + Math.random() * 900000)} • Generated ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="space-y-3 text-sm mb-6">
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Selected System:</span>
              <span class="font-semibold text-[#1b130e]">${mat.name}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Room Coverage:</span>
              <span class="font-semibold text-[#1b130e]">${this.state.areaSqFt} sq. ft. (incl. 10% mill allowance)</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Pattern Geometry:</span>
              <span class="font-semibold capitalize text-[#1b130e]">${this.state.pattern}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Subfloor Prep & Demo:</span>
              <span class="font-semibold text-[#1b130e]">${this.state.demoOldFloor ? 'Included' : 'None'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Underlayment & Acoustic Barrier:</span>
              <span class="font-semibold text-[#1b130e]">${this.state.moistureBarrier ? 'Premium Cork / Vapor' : 'Standard'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-[#f0e8dc]">
              <span class="text-[#5a3a29] font-medium">Staircase Steps:</span>
              <span class="font-semibold text-[#1b130e]">${this.state.stairCount} steps</span>
            </div>
          </div>

          <div class="p-4 bg-[#f3ede2] rounded-xl border border-[#e4d8c7] mb-6">
            <div class="flex justify-between items-baseline">
              <span class="font-serif font-bold text-lg text-[#2c1d16]">Estimated Investment:</span>
              <span class="font-serif font-bold text-2xl text-[#c58940]">${formatINR(this.currentEstLow)} - ${formatINR(this.currentEstHigh)}</span>
            </div>
            <p class="text-[11px] text-[#8c786a] mt-1">*Final contract pricing is confirmed during complimentary laser site measurement.</p>
          </div>

          <div class="flex gap-4">
            <button onclick="window.print()" class="flex-1 py-3 bg-[#2c1d16] hover:bg-[#1b130e] text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print / Save PDF
            </button>
            <button onclick="document.getElementById('calc-book-btn').click()" class="flex-1 py-3 bg-[#c58940] hover:bg-[#b07730] text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2">
              Lock In Free Measure
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calc-area-slider')) {
    PricingCalculator.init();
  }
});
