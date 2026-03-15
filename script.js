(function () {
  'use strict';

  let earningIndex = 1;
  let deductionIndex = 1;
  let timeOffIndex = 1;

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
    row.className = 'earning-row earning-row-added';
    row.setAttribute('data-index', index);
    row.innerHTML = `
      <div class="field-group">
        <label>Earning</label>
        <select name="earningType_${index}">
          <option value="">-- Select --</option>
          <option value="regular">Regular Earnings</option>
          <option value="overtime">Overtime</option>
          <option value="overtime-hourly">Overtime Hourly</option>
          <option value="tips">Tips</option>
          <option value="vacation-pay">Vacation Pay</option>
          <option value="sickpay">SickPay</option>
          <option value="bonus">Bonus</option>
          <option value="commission">Commission</option>
          <option value="award">Award</option>
          <option value="prize">Prize</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div class="field-group">
        <label>Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="earningAmount_${index}" placeholder="">
        </div>
      </div>
      <div class="field-group">
        <label>YTD Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="earningYtd_${index}" placeholder="">
        </div>
      </div>
      <div class="field-group field-remove">
        <label>&nbsp;</label>
        <button type="button" class="btn-remove" aria-label="Remove">×</button>
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

  earningsContainer && earningsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-remove')) {
      const row = e.target.closest('.earning-row-added');
      if (row) row.remove();
    }
  });

  var salaryHoursInput = document.getElementById('salaryHours');
  var earningHoursOriginal = document.getElementById('earningHoursOriginal');
  var earningRateOriginal = document.getElementById('earningRateOriginal');
  var earningAmountOriginal = document.getElementById('earningAmountOriginal');
  var earningYtdOriginal = document.getElementById('earningYtdOriginal');
  var annualWageInput = document.getElementById('annualWage');
  var hourlyPayRateInput = document.getElementById('hourlyPayRate');
  var payScheduleSelect = document.getElementById('paySchedule');

  var periodsPerYear = {
    daily: 260,
    weekly: 52,
    biweekly: 26,
    semimonthly: 24,
    monthly: 12,
    quarterly: 4,
    semiannually: 2,
    annually: 1
  };

  var recommendedHoursBySchedule = {
    daily: 8,
    weekly: 40,
    biweekly: 80,
    semimonthly: 86.67,
    monthly: 173.33,
    quarterly: 520,
    semiannually: 1040,
    annually: 2080
  };

  function applyRecommendedHours() {
    if (!salaryHoursInput || !payScheduleSelect) return;
    var schedule = payScheduleSelect.value || 'semimonthly';
    var recommended = recommendedHoursBySchedule[schedule];
    if (recommended != null) {
      salaryHoursInput.value = recommended % 1 === 0 ? String(recommended) : String(Math.round(recommended * 100) / 100);
      syncSalaryHoursToEarning();
    }
  }

  function formatMoney(num) {
    if (num === null || isNaN(num)) return '0.00';
    return Math.round(num * 100) / 100;
  }

  function syncSalaryHoursToEarning() {
    if (!salaryHoursInput || !earningHoursOriginal) return;
    var val = parseFloat(salaryHoursInput.value, 10);
    if (!isNaN(val)) {
      earningHoursOriginal.value = (Math.round(val * 100) / 100).toFixed(2) + ' hrs';
    }
    updateRegularEarningFromWage();
  }

  function updateRegularEarningFromWage() {
    if (!earningRateOriginal || !earningAmountOriginal || !earningYtdOriginal || !salaryHoursInput) return;
    var hours = parseFloat(salaryHoursInput.value, 10) || 0;
    var isHourly = document.querySelector('input[name="wageType"]:checked').value === 'hourly';

    if (isHourly) {
      var hourlyRate = parseFloat((hourlyPayRateInput && hourlyPayRateInput.value.replace(/[^0-9.-]/g, '')) || 0, 10);
      var amount = hourlyRate * hours;
      earningRateOriginal.value = formatMoney(hourlyRate).toFixed(2);
      earningAmountOriginal.value = String(formatMoney(amount));
      earningYtdOriginal.value = String(formatMoney(amount));
    } else {
      var annual = parseFloat((annualWageInput && annualWageInput.value.replace(/[^0-9.-]/g, '')) || 0, 10);
      var schedule = (payScheduleSelect && payScheduleSelect.value) || 'semimonthly';
      var periods = periodsPerYear[schedule] || 24;
      var periodPay = periods ? annual / periods : 0;
      var hourlyRate = hours ? periodPay / hours : 0;
      earningRateOriginal.value = formatMoney(hourlyRate).toFixed(2);
      earningAmountOriginal.value = String(formatMoney(periodPay));
      earningYtdOriginal.value = String(formatMoney(periodPay));
    }
  }

  if (salaryHoursInput) {
    salaryHoursInput.addEventListener('input', syncSalaryHoursToEarning);
    salaryHoursInput.addEventListener('change', syncSalaryHoursToEarning);
  }
  if (annualWageInput) {
    annualWageInput.addEventListener('input', updateRegularEarningFromWage);
    annualWageInput.addEventListener('change', updateRegularEarningFromWage);
  }
  if (hourlyPayRateInput) {
    hourlyPayRateInput.addEventListener('input', updateRegularEarningFromWage);
    hourlyPayRateInput.addEventListener('change', updateRegularEarningFromWage);
  }
  if (payScheduleSelect) {
    payScheduleSelect.addEventListener('change', function () {
      applyRecommendedHours();
      updateRegularEarningFromWage();
    });
  }
  document.querySelectorAll('input[name="wageType"]').forEach(function (r) {
    r.addEventListener('change', function () {
      syncSalaryHoursToEarning();
      updateRegularEarningFromWage();
    });
  });
  applyRecommendedHours();
  syncSalaryHoursToEarning();
  updateRegularEarningFromWage();

  function getDeductionsContainer() {
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
    const container = section.querySelector('.deductions-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'deduction-row';
    row.setAttribute('data-index', deductionIndex);
    row.innerHTML = `
      <div class="field-group">
        <label>Deduction</label>
        <select name="deductionType_${deductionIndex}">
          <option value="custom">Custom</option>
          <option value="401k">Deduction 401K</option>
          <option value="health">Health Insurance</option>
          <option value="dental">Dental Insurance</option>
          <option value="vision">Vision Insurance</option>
          <option value="fsa">FSA</option>
          <option value="hsa-individual">Individual HSA</option>
          <option value="hsa-family">Family HSA</option>
          <option value="simple-ira">Simple IRA</option>
          <option value="457b">Deduction 457B</option>
          <option value="roth-401k">Roth 401K</option>
          <option value="roth-403b">Roth 403B</option>
          <option value="roth-457b">Roth 457B</option>
          <option value="403b">Deduction 403B</option>
          <option value="dependent-care-fsa">Dependent Care FSA</option>
        </select>
      </div>
      <div class="field-group">
        <label>Tax Type</label>
        <select name="deductionTaxType_${deductionIndex}">
          <option value="pretax">Pre-Tax</option>
          <option value="posttax" selected>Post-Tax</option>
        </select>
      </div>
      <div class="field-group">
        <label>Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="deductionAmount_${deductionIndex}" placeholder="">
        </div>
      </div>
      <div class="field-group">
        <label>YTD Amount</label>
        <div class="input-prefix">
          <span class="prefix">$</span>
          <input type="text" name="deductionYtd_${deductionIndex}" placeholder="">
        </div>
      </div>
      <div class="field-group field-remove">
        <label>&nbsp;</label>
        <button type="button" class="btn-remove" aria-label="Remove">×</button>
      </div>
    `;
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
    const container = section.querySelector('.timeoff-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'timeoff-row';
    row.setAttribute('data-index', timeOffIndex);
    row.innerHTML = `
      <div class="field-group">
        <label>Policy Name</label>
        <select name="timeoffPolicy_${timeOffIndex}">
          <option value="">-- Select --</option>
          <option value="earned">Earned Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="vacation">Vacation Leave</option>
          <option value="personal">Personal Leave</option>
          <option value="optional">Optional Leave</option>
          <option value="military">Military Leave</option>
          <option value="parental">Parental Leave</option>
          <option value="sabbatical">Sabbatical Leave</option>
          <option value="bereavement">Bereavement Leave</option>
          <option value="jury">Jury Leave</option>
          <option value="vote">Leave to Cast Vote</option>
          <option value="volunteer">Volunteer Leave</option>
          <option value="compensatory">Compensatory Leave</option>
          <option value="duvet">Duvet Day</option>
        </select>
      </div>
      <div class="field-group">
        <label>Start Balance (Hrs)</label>
        <input type="text" name="timeoffStartBalance_${timeOffIndex}" placeholder="">
      </div>
      <div class="field-group">
        <label>Spent Hours</label>
        <input type="text" name="timeoffSpent_${timeOffIndex}" placeholder="">
      </div>
      <div class="field-group">
        <label>Earned Hours</label>
        <input type="text" name="timeoffEarned_${timeOffIndex}" placeholder="">
      </div>
      <div class="field-group">
        <label>End Balance (Hrs)</label>
        <input type="text" name="timeoffEndBalance_${timeOffIndex}" value="0" placeholder="">
      </div>
      <div class="field-group field-remove">
        <label>&nbsp;</label>
        <button type="button" class="btn-remove" aria-label="Remove">×</button>
      </div>
    `;
    container.appendChild(row);
    timeOffIndex += 1;
  }

  if (addTimeOffBtn) {
    addTimeOffBtn.addEventListener('click', addTimeOffRow);
  }

  document.querySelector('.deductions-container') && document.querySelector('.deductions-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-remove')) e.target.closest('.deduction-row').remove();
  });
  document.querySelector('.timeoff-container') && document.querySelector('.timeoff-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-remove')) e.target.closest('.timeoff-row').remove();
  });

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

  // Calendar popup for date fields
  (function () {
    var popup = document.getElementById('calendarPopup');
    var monthYearEl = document.getElementById('calendarMonthYear');
    var daysEl = document.getElementById('calendarDays');
    var prevBtn = document.getElementById('calendarPrev');
    var nextBtn = document.getElementById('calendarNext');
    var currentInput = null;
    var viewDate = new Date();
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function formatDateForInput(d) {
      var m = d.getMonth() + 1;
      var day = d.getDate();
      var y = d.getFullYear();
      return (m < 10 ? '0' : '') + m + '/' + (day < 10 ? '0' : '') + day + '/' + y;
    }

    function parseInputDate(str) {
      if (!str || !str.trim()) return null;
      var parts = str.trim().split(/[\/\-]/);
      if (parts.length !== 3) return null;
      var m = parseInt(parts[0], 10) - 1;
      var d = parseInt(parts[1], 10);
      var y = parseInt(parts[2], 10);
      if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
      var date = new Date(y, m, d);
      if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
      return date;
    }

    function renderCalendar() {
      if (!daysEl || !monthYearEl) return;
      var year = viewDate.getFullYear();
      var month = viewDate.getMonth();
      monthYearEl.textContent = monthNames[month] + ' ' + year;

      var first = new Date(year, month, 1);
      var last = new Date(year, month + 1, 0);
      var startDay = first.getDay();
      var daysInMonth = last.getDate();
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var selectedDate = null;
      if (currentInput && currentInput.value) {
        selectedDate = parseInputDate(currentInput.value);
        if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
      }

      daysEl.innerHTML = '';
      var emptyCells = startDay;
      for (var i = 0; i < emptyCells; i++) {
        var empty = document.createElement('span');
        empty.className = 'calendar-day other-month';
        empty.textContent = '';
        empty.style.visibility = 'hidden';
        daysEl.appendChild(empty);
      }
      for (var d = 1; d <= daysInMonth; d++) {
        (function (dayNum) {
          var cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'calendar-day';
          cell.textContent = dayNum;
          var cellDate = new Date(year, month, dayNum);
          cellDate.setHours(0, 0, 0, 0);
          if (cellDate.getMonth() !== month) cell.classList.add('other-month');
          if (cellDate.getTime() === today.getTime()) cell.classList.add('today');
          if (selectedDate && cellDate.getTime() === selectedDate.getTime()) cell.classList.add('selected');
          cell.addEventListener('click', function () {
            var pick = new Date(year, month, dayNum);
            if (currentInput) {
              currentInput.value = formatDateForInput(pick);
              currentInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            closeCalendar();
          });
          daysEl.appendChild(cell);
        })(d);
      }
    }

    function openCalendar(input) {
      currentInput = input;
      var parsed = parseInputDate(input.value);
      viewDate = parsed ? new Date(parsed.getFullYear(), parsed.getMonth(), 1) : new Date();
      renderCalendar();
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      var rect = input.getBoundingClientRect();
      popup.style.left = rect.left + 'px';
      popup.style.top = (rect.bottom + 4) + 'px';
    }

    function closeCalendar() {
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      currentInput = null;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderCalendar();
    });

    document.querySelectorAll('.date-field').forEach(function (wrap) {
      var input = wrap.querySelector('.date-input');
      var icon = wrap.querySelector('.calendar-icon');
      if (input) {
        input.addEventListener('focus', function () { openCalendar(input); });
        input.addEventListener('click', function () { openCalendar(input); });
      }
      if (icon) icon.addEventListener('click', function () {
        if (input) openCalendar(input);
      });
    });

    document.addEventListener('click', function (e) {
      if (popup.classList.contains('is-open') && !popup.contains(e.target) && !e.target.closest('.date-field')) {
        closeCalendar();
      }
    });
  })();

  // Employee / Contractor radio: switch labels and show/hide employee-only blocks
  var workerSection = document.getElementById('workerSection');
  var workerNameLabel = document.getElementById('workerNameLabel');
  var workerAddressLabel = document.getElementById('workerAddressLabel');
  var workerIdLabel = document.getElementById('workerIdLabel');
  var workerIdHelper = document.getElementById('workerIdHelper');
  var workerTypeRadios = document.querySelectorAll('input[name="workerType"]');

  function updateWorkerTypeUI() {
    var isContractor = document.querySelector('input[name="workerType"]:checked').value === 'contractor';
    if (workerSection) workerSection.classList.toggle('worker-contractor', isContractor);
    if (workerNameLabel) workerNameLabel.textContent = isContractor ? '*Contractor Name' : '*Employee Name';
    if (workerAddressLabel) workerAddressLabel.textContent = isContractor ? 'Contractor Address' : 'Employee Address';
    if (workerIdLabel) workerIdLabel.textContent = isContractor ? 'Contractor ID' : 'Employee ID';
    if (workerIdHelper) workerIdHelper.textContent = isContractor ? 'Code or Number you use to uniquely identify this Contractor.' : 'Code or Number you use to uniquely identify this Employee.';
  }

  workerTypeRadios.forEach(function (radio) {
    radio.addEventListener('change', updateWorkerTypeUI);
  });
  updateWorkerTypeUI();

  // W-4 2020 checkbox: switch Filing Status label and options
  var w4_2020Checkbox = document.getElementById('w4_2020');
  var filingStatusLabel = document.getElementById('filingStatusLabel');
  var filingStatusSelect = document.getElementById('filingStatusSelect');
  var filingStatusOptions2020 = [
    { value: 'single-separately', text: 'Single or Married filing separately' },
    { value: 'married-widow', text: 'Married filing jointly or Qualifying widow(er)' },
    { value: 'head', text: 'Head of Household' },
    { value: 'nonresident', text: 'Nonresident Alien' }
  ];
  var filingStatusOptionsBox3 = [
    { value: 'single', text: 'Single' },
    { value: 'married', text: 'Married' },
    { value: 'married-single-rate', text: 'Married Use Single Rate' },
    { value: 'nonresident', text: 'Nonresident Alien' }
  ];

  function updateFilingStatusForW4() {
    var use2020 = w4_2020Checkbox && w4_2020Checkbox.checked;
    if (filingStatusLabel) {
      filingStatusLabel.textContent = use2020 ? 'Filing Status (Step 1c)' : 'Filing Status (Box 3)';
    }
    if (filingStatusSelect) {
      var opts = use2020 ? filingStatusOptions2020 : filingStatusOptionsBox3;
      var current = filingStatusSelect.value;
      var hasMatch = opts.some(function (o) { return o.value === current; });
      filingStatusSelect.innerHTML = '';
      opts.forEach(function (o, i) {
        var opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.text;
        opt.selected = o.value === current || (!hasMatch && i === 0);
        filingStatusSelect.appendChild(opt);
      });
    }
  }

  if (w4_2020Checkbox) {
    w4_2020Checkbox.addEventListener('change', updateFilingStatusForW4);
  }
  updateFilingStatusForW4();

  // Salary / Hourly: show Annual wage or Hourly pay rate
  var salarySection = document.getElementById('salarySection');
  var wageTypeRadios = document.querySelectorAll('input[name="wageType"]');
  wageTypeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (salarySection) {
        salarySection.classList.toggle('wage-type-hourly', this.value === 'hourly');
      }
    });
  });
  if (salarySection) {
    salarySection.classList.toggle('wage-type-hourly', document.querySelector('input[name="wageType"]:checked').value === 'hourly');
  }

  // Federal "Show Additional Info" / "Hide Additional Info" toggle
  var toggleFederalLink = document.getElementById('toggleFederalAdditional');
  var federalAdditionalInfo = document.getElementById('federalAdditionalInfo');
  if (toggleFederalLink && federalAdditionalInfo) {
    toggleFederalLink.addEventListener('click', function (e) {
      e.preventDefault();
      var isHidden = federalAdditionalInfo.hasAttribute('hidden');
      if (isHidden) {
        federalAdditionalInfo.removeAttribute('hidden');
        toggleFederalLink.innerHTML = 'Hide Additional Info <span class="caret">▲</span>';
      } else {
        federalAdditionalInfo.setAttribute('hidden', '');
        toggleFederalLink.innerHTML = 'Show Additional Info <span class="caret">▼</span>';
      }
    });
  }
})();
