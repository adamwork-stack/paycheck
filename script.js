(function () {
  'use strict';

  let earningIndex = 1;
  let deductionIndex = 0;
  let timeOffIndex = 0;

  function populateStateDropdowns(states) {
    document.querySelectorAll('.state-dropdown').forEach(function (sel) {
      var placeholder = sel.querySelector('option[value=""]');
      sel.innerHTML = '';
      if (placeholder) sel.appendChild(placeholder);
      states.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.abbr;
        opt.textContent = s.name + ' (' + s.abbr + ')';
        sel.appendChild(opt);
      });
    });
  }

  fetch('states.json')
    .then(function (r) { return r.json(); })
    .then(populateStateDropdowns)
    .catch(function () {
      console.error('Could not load states.json');
    });

  const earningsContainer = document.querySelector('.earnings-table');
  const addEarningBtn = document.getElementById('addEarning');
  const addDeductionBtn = document.getElementById('addDeduction');
  const addTimeOffBtn = document.getElementById('addTimeOff');
  const previewBtn = document.getElementById('previewBtn');
  const warningBar = document.getElementById('warningBar');

  var templateModal = document.getElementById('templateModal');
  var openTemplateModalBtn = document.getElementById('openTemplateModal');
  var changeTemplateLink = document.getElementById('changeTemplateLink');
  var closeTemplateModalBtn = document.getElementById('closeTemplateModal');
  var cancelTemplateModalBtn = document.getElementById('cancelTemplateModal');
  var chooseTemplateBtn = document.getElementById('chooseTemplateBtn');
  var colorSwatchesEl = document.getElementById('colorSwatches');
  var paystubPreviewEl = document.getElementById('paystubPreview');
  var selectedTemplateLabel = document.getElementById('selectedTemplateLabel');
  var selectedTemplateThumb = document.getElementById('selectedTemplateThumb');

  var templateColors = {
    modern: [
      { name: 'Fire', hex: '#c0392b' },
      { name: 'Diamma', hex: '#2980b9' },
      { name: 'Metallica', hex: '#27ae60' },
      { name: 'Meat', hex: '#8e44ad' },
      { name: 'Green Head', hex: '#16a085' }
    ],
    classic: [
      { name: 'Silver Coat', hex: '#95a5a6' },
      { name: 'Green Tree', hex: '#27ae60' },
      { name: 'Velvet', hex: '#8e44ad' },
      { name: 'Yellow Crazy', hex: '#f1c40f' },
      { name: 'Meadow', hex: '#a67c52' }
    ],
    simple: [
      { name: 'Blue', hex: '#2980b9' },
      { name: 'Glade Green', hex: '#27ae60' },
      { name: 'Cherokee', hex: '#8e44ad' },
      { name: 'Trolley Grey', hex: '#7f8c8d' },
      { name: 'Loon Turquoise', hex: '#16a085' }
    ],
    contractor: [
      { name: 'Lemon Tree', hex: '#f1c40f' },
      { name: 'Cloud Gray', hex: '#bdc3c7' },
      { name: 'Black', hex: '#2c3e50' },
      { name: 'Violet Red', hex: '#c0392b' },
      { name: 'Forest Green', hex: '#27ae60' }
    ],
    'contractor-no-ytd': [
      { name: 'Lemon Tree', hex: '#f1c40f' },
      { name: 'Cloud Gray', hex: '#bdc3c7' },
      { name: 'Black', hex: '#2c3e50' },
      { name: 'Violet Red', hex: '#c0392b' },
      { name: 'Forest Green', hex: '#27ae60' }
    ]
  };

  var templateNames = { modern: 'Modern', classic: 'Classic', simple: 'Simple', contractor: 'Contractor', 'contractor-no-ytd': 'Contractor without YTD' };
  var currentModalTemplate = 'modern';
  var currentModalColor = 0;

  function openTemplateModal() {
    if (templateModal) {
      templateModal.classList.add('is-open');
      templateModal.setAttribute('aria-hidden', 'false');
      renderColorSwatches();
      applyPreviewAccent();
    }
  }

  function closeTemplateModal() {
    if (templateModal) {
      templateModal.classList.remove('is-open');
      templateModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderColorSwatches() {
    if (!colorSwatchesEl) return;
    var colors = templateColors[currentModalTemplate] || templateColors.modern;
    colorSwatchesEl.innerHTML = '';
    colors.forEach(function (c, i) {
      var swatch = document.createElement('div');
      swatch.className = 'color-swatch' + (i === currentModalColor ? ' active' : '');
      swatch.setAttribute('data-index', i);
      swatch.innerHTML = '<div class="color-swatch-circle" style="background:' + c.hex + '"></div><span class="color-swatch-label">' + c.name + '</span>';
      swatch.addEventListener('click', function () {
        currentModalColor = parseInt(this.getAttribute('data-index'), 10);
        colorSwatchesEl.querySelectorAll('.color-swatch').forEach(function (s) { s.classList.remove('active'); });
        this.classList.add('active');
        applyPreviewAccent();
      });
      colorSwatchesEl.appendChild(swatch);
    });
  }

  function applyPreviewAccent() {
    if (!paystubPreviewEl) return;
    var colors = templateColors[currentModalTemplate] || templateColors.modern;
    var hex = colors[currentModalColor] ? colors[currentModalColor].hex : '#2980b9';
    paystubPreviewEl.querySelectorAll('.preview-table thead th, .preview-summary-row.accent').forEach(function (el) {
      el.style.backgroundColor = hex;
    });
  }

  function updateFormTemplateDisplay() {
    var colors = templateColors[currentModalTemplate] || templateColors.modern;
    var colorName = colors[currentModalColor] ? colors[currentModalColor].name : 'Fire';
    var templateName = templateNames[currentModalTemplate] || 'Modern';
    if (selectedTemplateLabel) selectedTemplateLabel.textContent = templateName + ': ' + colorName;
    if (selectedTemplateThumb) selectedTemplateThumb.style.background = colors[currentModalColor] ? colors[currentModalColor].hex : '#c0392b';
  }

  if (openTemplateModalBtn) {
    openTemplateModalBtn.addEventListener('click', function (e) { e.preventDefault(); openTemplateModal(); });
    openTemplateModalBtn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTemplateModal(); } });
  }
  if (changeTemplateLink) {
    changeTemplateLink.addEventListener('click', function (e) { e.preventDefault(); openTemplateModal(); });
  }
  if (closeTemplateModalBtn) closeTemplateModalBtn.addEventListener('click', closeTemplateModal);
  if (cancelTemplateModalBtn) cancelTemplateModalBtn.addEventListener('click', closeTemplateModal);
  if (chooseTemplateBtn) {
    chooseTemplateBtn.addEventListener('click', function () {
      updateFormTemplateDisplay();
      closeTemplateModal();
    });
  }

  templateModal && templateModal.addEventListener('click', function (e) {
    if (e.target === templateModal) closeTemplateModal();
  });

  document.querySelectorAll('.modal-template').forEach(function (el) {
    el.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  document.querySelectorAll('.template-card').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.template-card').forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      currentModalTemplate = this.getAttribute('data-template') || 'modern';
      currentModalColor = 0;
      renderColorSwatches();
      applyPreviewAccent();
    });
  });

  function createEarningRow(index) {
    const row = document.createElement('div');
    row.className = 'earning-row';
    row.setAttribute('data-index', index);
    row.innerHTML = `
      <div class="field-group">
        <label>Earning</label>
        <select name="earningType_${index}">
          <option value="regular" selected>Regular Earnings</option>
          <option value="overtime">Overtime</option>
          <option value="bonus">Bonus</option>
          <option value="commission">Commission</option>
        </select>
      </div>
      <div class="field-group">
        <label>Amount</label>
        <input type="text" name="earningAmount_${index}" value="$0.00" class="amount-input">
      </div>
      <div class="field-group">
        <label>Hours</label>
        <input type="text" name="earningHours_${index}" value="0.00 hrs" class="amount-input">
      </div>
      <div class="field-group">
        <label>YTD Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="earningYtd_${index}" placeholder="">
        </div>
      </div>
    `;
    return row;
  }

  if (addEarningBtn && earningsContainer) {
    addEarningBtn.addEventListener('click', function () {
      earningsContainer.appendChild(createEarningRow(earningIndex));
      earningIndex += 1;
    });
  }

  function getDeductionsContainer() {
    let section = document.querySelector('.form-section');
    const sections = document.querySelectorAll('.form-section');
    for (const s of sections) {
      if (s.querySelector('.section-title') && s.querySelector('.section-title').textContent.includes('Deductions')) {
        return s;
      }
    }
    return null;
  }

  function addDeductionRow() {
    const section = getDeductionsContainer();
    if (!section) return;
    let container = section.querySelector('.deductions-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'deductions-container';
      const hr = section.querySelector('.section-divider');
      if (hr) {
        hr.after(container);
      } else {
        section.querySelector('.section-header').after(container);
      }
    }
    const row = document.createElement('div');
    row.className = 'deduction-row';
    row.setAttribute('data-index', deductionIndex);
    row.innerHTML = `
      <div class="field-group">
        <label>Deduction Type</label>
        <select name="deductionType_${deductionIndex}">
          <option value="tax">Tax</option>
          <option value="insurance">Insurance</option>
          <option value="retirement">Retirement</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="field-group">
        <label>Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="deductionAmount_${deductionIndex}" placeholder="0.00">
        </div>
      </div>
      <div class="field-group">
        <label>YTD</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="deductionYtd_${deductionIndex}" placeholder="">
        </div>
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button type="button" class="btn-secondary btn-remove">Remove</button>
      </div>
    `;
    row.querySelector('.btn-remove').addEventListener('click', function () {
      row.remove();
    });
    container.appendChild(row);
    deductionIndex += 1;
  }

  if (addDeductionBtn) {
    addDeductionBtn.addEventListener('click', addDeductionRow);
  }

  function getTimeOffContainer() {
    const sections = document.querySelectorAll('.form-section');
    for (const s of sections) {
      if (s.querySelector('.section-title') && s.querySelector('.section-title').textContent.includes('Time Off')) {
        return s;
      }
    }
    return null;
  }

  function addTimeOffRow() {
    const section = getTimeOffContainer();
    if (!section) return;
    let container = section.querySelector('.timeoff-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'timeoff-container';
      const hr = section.querySelector('.section-divider');
      if (hr) {
        hr.after(container);
      } else {
        section.querySelector('.section-header').after(container);
      }
    }
    const row = document.createElement('div');
    row.className = 'timeoff-row';
    row.setAttribute('data-index', timeOffIndex);
    row.innerHTML = `
      <div class="field-group">
        <label>Time Off Type</label>
        <select name="timeoffType_${timeOffIndex}">
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="field-group">
        <label>Balance</label>
        <input type="text" name="timeoffBalance_${timeOffIndex}" placeholder="0">
      </div>
      <div class="field-group">
        <label>Used</label>
        <input type="text" name="timeoffUsed_${timeOffIndex}" placeholder="0">
      </div>
      <div class="field-group">
        <label>&nbsp;</label>
        <button type="button" class="btn-secondary btn-remove">Remove</button>
      </div>
    `;
    row.querySelector('.btn-remove').addEventListener('click', function () {
      row.remove();
    });
    container.appendChild(row);
    timeOffIndex += 1;
  }

  if (addTimeOffBtn) {
    addTimeOffBtn.addEventListener('click', addTimeOffRow);
  }

  function getRequiredFields() {
    return document.querySelectorAll('.form-wrapper input[class*="required-input"], .form-wrapper input[name="companyName"], .form-wrapper input[name="companyAddress"], .form-wrapper input[name="companyCity"], .form-wrapper select[name="companyState"], .form-wrapper input[name="companyZip"], .form-wrapper input[name="companyEmail"]');
  }

  function checkMandatory() {
    const required = getRequiredFields();
    let allFilled = true;
    required.forEach(function (el) {
      const val = (el.value || '').trim();
      if (!val) {
        allFilled = false;
        el.classList.add('required-input');
      } else {
        el.classList.remove('required-input');
      }
    });
    return allFilled;
  }

  if (previewBtn && warningBar) {
    previewBtn.addEventListener('click', function () {
      const valid = checkMandatory();
      warningBar.style.display = valid ? 'none' : 'flex';
      if (valid) {
        alert('Preview would open here. Form is valid.');
      }
    });
  }

  // Optional: use type="date" on date inputs for native picker
  document.querySelectorAll('.date-input').forEach(function (input) {
    input.setAttribute('type', 'date');
  });
})();
