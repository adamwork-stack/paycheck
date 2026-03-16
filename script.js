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

  function roundMoney(num) {
    if (num === null || num === undefined || isNaN(num)) return 0;
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
      earningRateOriginal.value = roundMoney(hourlyRate).toFixed(2);
      earningAmountOriginal.value = roundMoney(amount).toFixed(2);
      earningYtdOriginal.value = roundMoney(amount).toFixed(2);
    } else {
      var annual = parseFloat((annualWageInput && annualWageInput.value.replace(/[^0-9.-]/g, '')) || 0, 10);
      var schedule = (payScheduleSelect && payScheduleSelect.value) || 'semimonthly';
      var periods = periodsPerYear[schedule] || 24;
      var periodPay = periods ? annual / periods : 0;
      var hourlyRate = hours ? periodPay / hours : 0;
      earningRateOriginal.value = roundMoney(hourlyRate).toFixed(2);
      earningAmountOriginal.value = roundMoney(periodPay).toFixed(2);
      earningYtdOriginal.value = roundMoney(periodPay).toFixed(2);
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
        <input type="text" name="timeoffEndBalance_${timeOffIndex}" value="0" placeholder="" readonly class="timeoff-end-balance">
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

  function updateTimeOffEndBalance(row) {
    if (!row) return;
    var startInput = row.querySelector('input[name^="timeoffStartBalance_"]');
    var spentInput = row.querySelector('input[name^="timeoffSpent_"]');
    var earnedInput = row.querySelector('input[name^="timeoffEarned_"]');
    var endInput = row.querySelector('input[name^="timeoffEndBalance_"]');
    if (!startInput || !spentInput || !earnedInput || !endInput) return;
    var start = parseFloat(String(startInput.value).replace(/[^0-9.-]/g, '')) || 0;
    var spent = parseFloat(String(spentInput.value).replace(/[^0-9.-]/g, '')) || 0;
    var earned = parseFloat(String(earnedInput.value).replace(/[^0-9.-]/g, '')) || 0;
    var end = Math.round((start - spent + earned) * 100) / 100;
    endInput.value = isNaN(end) ? '' : String(end);
  }

  var timeoffContainer = document.querySelector('.timeoff-container');
  if (timeoffContainer) {
    timeoffContainer.addEventListener('input', function (e) {
      var name = e.target && e.target.getAttribute('name');
      if (name && (name.indexOf('timeoffStartBalance_') === 0 || name.indexOf('timeoffSpent_') === 0 || name.indexOf('timeoffEarned_') === 0)) {
        updateTimeOffEndBalance(e.target.closest('.timeoff-row'));
      }
    });
    timeoffContainer.addEventListener('change', function (e) {
      var name = e.target && e.target.getAttribute('name');
      if (name && (name.indexOf('timeoffStartBalance_') === 0 || name.indexOf('timeoffSpent_') === 0 || name.indexOf('timeoffEarned_') === 0)) {
        updateTimeOffEndBalance(e.target.closest('.timeoff-row'));
      }
    });
    setTimeout(function () {
      document.querySelectorAll('.timeoff-row').forEach(updateTimeOffEndBalance);
    }, 0);
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

  var employeeTaxesSection = document.getElementById('employeeTaxesSection');

  function updateMandatoryUI() {
    var valid = checkMandatory();
    if (warningBar) warningBar.style.display = valid ? 'none' : 'flex';
    if (employeeTaxesSection) employeeTaxesSection.classList.toggle('blurred', !valid);
  }

  var formWrapper = document.querySelector('.form-wrapper');
  if (formWrapper) {
    formWrapper.addEventListener('input', updateMandatoryUI);
    formWrapper.addEventListener('change', updateMandatoryUI);
  }
  updateMandatoryUI();

  var previewPaystubModal = document.getElementById('previewPaystubModal');
  var previewPaystubContent = document.getElementById('previewPaystubContent');
  var closePreviewPaystubModal = document.getElementById('closePreviewPaystubModal');
  var previewMakeChangesBtn = document.getElementById('previewMakeChangesBtn');
  var previewProceedDownloadBtn = document.getElementById('previewProceedDownloadBtn');

  function getVal(name) {
    var el = document.querySelector('[name="' + name + '"]');
    return (el && el.value) ? el.value.trim() : '';
  }

  function getSelectText(name) {
    var el = document.querySelector('select[name="' + name + '"]');
    if (!el || !el.options[el.selectedIndex]) return '';
    return el.options[el.selectedIndex].text;
  }

  function formatMoney(n) {
    if (n === null || n === undefined || isNaN(n)) return '0.00';
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function buildPreviewPaystubHTML() {
    var companyName = getVal('companyName') || '—';
    var companyAddress = getVal('companyAddress') || '';
    var companyCity = getVal('companyCity') || '';
    var companyState = getVal('companyState') ? getSelectText('companyState').replace(/\s*\([A-Z]{2}\)\s*$/, '').trim() : '';
    var companyZip = getVal('companyZip') || '';
    var companyLine = [companyAddress, [companyCity, companyState, companyZip].filter(Boolean).join(', ')].filter(Boolean).join(', ');
    var employeeName = getVal('employeeName') || '—';
    var ssn = getVal('ssnLast4') ? '(XXX-XX-' + getVal('ssnLast4').replace(/\D/g, '').slice(-4) + ')' : '';
    var empAddress = getVal('employeeAddress') || '';
    var empCity = getVal('employeeCity') || '';
    var empState = getVal('employeeState') ? getSelectText('employeeState').replace(/\s*\([A-Z]{2}\)\s*$/, '').trim() : '';
    var empZip = getVal('employeeZip') || '';
    var empLine = [empAddress, [empCity, empState, empZip].filter(Boolean).join(', ')].filter(Boolean).join(', ');
    var checkNum = getVal('checkNumber') || '—';
    var payDate = getVal('payday') || '—';
    var paySchedule = getSelectText('paySchedule') || '—';
    var periodStart = getVal('payPeriodStart') || '—';
    var periodEnd = getVal('payPeriodEnd') || '—';

    var earningsRows = [];
    var gross = 0;
    document.querySelectorAll('.earning-row').forEach(function (row) {
      var typeEl = row.querySelector('select[name^="earningType_"]');
      var rateEl = row.querySelector('input[name^="earningRate_"]');
      var hoursEl = row.querySelector('input[name^="earningHours_"]');
      var amountEl = row.querySelector('input[name^="earningAmount_"]');
      var ytdEl = row.querySelector('input[name^="earningYtd_"]');
      var type = typeEl && typeEl.options[typeEl.selectedIndex] ? typeEl.options[typeEl.selectedIndex].text : '—';
      var rate = (rateEl && rateEl.value) ? rateEl.value.replace(/[^0-9.-]/g, '') : '0';
      var hours = (hoursEl && hoursEl.value) ? hoursEl.value.replace(/[^0-9.]/g, '') : '0';
      var amount = (amountEl && amountEl.value) ? amountEl.value.replace(/[^0-9.-]/g, '') : '0';
      var ytd = (ytdEl && ytdEl.value) ? ytdEl.value.replace(/[^0-9.-]/g, '') : '0';
      if (!rate && amount) rate = amount;
      var amt = parseFloat(amount) || 0;
      gross += amt;
      earningsRows.push('<tr><td>' + type + '</td><td>$' + formatMoney(rate) + '</td><td>' + hours + '</td><td>$' + formatMoney(amount) + '</td><td>$' + formatMoney(ytd) + '</td></tr>');
    });
    if (earningsRows.length === 0) earningsRows.push('<tr><td>Regular Earnings</td><td>$0.00</td><td>0</td><td>$0.00</td><td>$0.00</td></tr>');

    var taxRows = [];
    var taxFederal = (document.getElementById('taxFederal') && document.getElementById('taxFederal').value) || '0';
    var taxFica = (document.getElementById('taxFica') && document.getElementById('taxFica').value) || '0';
    var taxMedicare = (document.getElementById('taxMedicare') && document.getElementById('taxMedicare').value) || '0';
    var taxState = (document.getElementById('taxState') && document.getElementById('taxState').value) || '0';
    var stateLabel = (document.getElementById('taxStateLabel') && document.getElementById('taxStateLabel').textContent) || 'State';
    taxRows.push('<tr><td>Federal</td><td>$' + formatMoney(taxFederal) + '</td><td>$' + formatMoney(taxFederal) + '</td></tr>');
    taxRows.push('<tr><td>FICA</td><td>$' + formatMoney(taxFica) + '</td><td>$' + formatMoney(taxFica) + '</td></tr>');
    taxRows.push('<tr><td>Medicare</td><td>$' + formatMoney(taxMedicare) + '</td><td>$' + formatMoney(taxMedicare) + '</td></tr>');
    taxRows.push('<tr><td>' + stateLabel + '</td><td>$' + formatMoney(taxState) + '</td><td>$' + formatMoney(taxState) + '</td></tr>');

    document.querySelectorAll('.deduction-row').forEach(function (row) {
      var typeEl = row.querySelector('select[name^="deductionType_"]');
      var amountEl = row.querySelector('input[name^="deductionAmount_"]');
      var ytdEl = row.querySelector('input[name^="deductionYtd_"]');
      var type = typeEl && typeEl.options[typeEl.selectedIndex] ? typeEl.options[typeEl.selectedIndex].text : '—';
      var amount = (amountEl && amountEl.value) ? amountEl.value.replace(/[^0-9.-]/g, '') : '0';
      var ytd = (ytdEl && ytdEl.value) ? ytdEl.value.replace(/[^0-9.-]/g, '') : '0';
      taxRows.push('<tr><td>' + type + '</td><td>$' + formatMoney(amount) + '</td><td>$' + formatMoney(ytd) + '</td></tr>');
    });

    var totalTaxDed = parseFloat(taxFederal) + parseFloat(taxFica) + parseFloat(taxMedicare) + parseFloat(taxState);
    document.querySelectorAll('.deduction-row').forEach(function (row) {
      var amountEl = row.querySelector('input[name^="deductionAmount_"]');
      if (amountEl && amountEl.value) totalTaxDed += parseFloat(amountEl.value.replace(/[^0-9.-]/g, '')) || 0;
    });
    var netPay = gross - totalTaxDed;
    var ytdGross = gross;
    var ytdDed = totalTaxDed;
    var ytdNet = netPay;

    var timeOffRows = [];
    document.querySelectorAll('.timeoff-row').forEach(function (row) {
      var policyEl = row.querySelector('select[name^="timeoffPolicy_"]');
      var startEl = row.querySelector('input[name^="timeoffStartBalance_"]');
      var spentEl = row.querySelector('input[name^="timeoffSpent_"]');
      var earnedEl = row.querySelector('input[name^="timeoffEarned_"]');
      var endEl = row.querySelector('input[name^="timeoffEndBalance_"]');
      var policy = policyEl && policyEl.options[policyEl.selectedIndex] ? policyEl.options[policyEl.selectedIndex].text : '—';
      var start = (startEl && startEl.value) ? startEl.value : '0';
      var spent = (spentEl && spentEl.value) ? spentEl.value : '0';
      var earned = (earnedEl && earnedEl.value) ? earnedEl.value : '0';
      var end = (endEl && endEl.value) ? endEl.value : '0';
      timeOffRows.push('<tr><td>' + policy + '</td><td>' + start + '</td><td>' + spent + '</td><td>' + earned + '</td><td>' + end + '</td></tr>');
    });
    if (timeOffRows.length === 0) timeOffRows.push('<tr><td colspan="5">—</td></tr>');

    return '<div class="ps-row"><div class="ps-company">' + escapeHtml(companyName) + '<br>' + escapeHtml(companyLine) + '</div></div>' +
      '<div class="ps-row">' +
      '<div class="ps-employee">' + escapeHtml(employeeName) + '<br>' + ssn + '<br>' + escapeHtml(empLine) + '</div>' +
      '<div class="ps-statement">Earnings Statement<br>Check Number: ' + escapeHtml(checkNum) + '</div>' +
      '</div>' +
      '<div class="ps-period-box">' +
      '<div><span>Pay Date</span><span>' + escapeHtml(payDate) + '</span></div>' +
      '<div><span>Pay Schedule</span><span>' + escapeHtml(paySchedule) + '</span></div>' +
      '<div><span>Pay Period</span><span>' + escapeHtml(periodStart) + ' to ' + escapeHtml(periodEnd) + '</span></div>' +
      '</div>' +
      '<table class="ps-table"><thead><tr><th>Earnings</th><th>Rate</th><th>Hours</th><th>Total</th><th>YTD</th></tr></thead><tbody>' + earningsRows.join('') + '</tbody></table>' +
      '<table class="ps-table"><thead><tr><th>Taxes / Deductions</th><th>Current</th><th>YTD</th></tr></thead><tbody>' + taxRows.join('') + '</tbody></table>' +
      '<table class="ps-table"><thead><tr><th>Time Off</th><th>Start Balance</th><th>Spent Hours</th><th>Earned Hours</th><th>End Balance</th></tr></thead><tbody>' + timeOffRows.join('') + '</tbody></table>' +
      '<div class="ps-summary">' +
      '<div class="ps-summary-side"><div class="ps-summary-row"><span>YTD Gross</span><span>$' + formatMoney(ytdGross) + '</span></div><div class="ps-summary-row"><span>YTD Taxes / Deductions</span><span>$' + formatMoney(ytdDed) + '</span></div><div class="ps-summary-row accent"><span>YTD Net Pay</span><span>$' + formatMoney(ytdNet) + '</span></div></div>' +
      '<div class="ps-summary-side"><div class="ps-summary-row"><span>Gross</span><span>$' + formatMoney(gross) + '</span></div><div class="ps-summary-row"><span>Taxes / Deductions</span><span>$' + formatMoney(totalTaxDed) + '</span></div><div class="ps-summary-row accent"><span>Net Pay</span><span>$' + formatMoney(netPay) + '</span></div></div>' +
      '</div>';
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function applyPreviewPaystubAccent() {
    if (!previewPaystubContent) return;
    var colors = templateColors[currentModalTemplate] || templateColors.modern;
    var hex = colors[currentModalColor] != null && colors[currentModalColor] ? colors[currentModalColor].hex : (templateColors.modern[0] && templateColors.modern[0].hex) || '#c0392b';
    previewPaystubContent.querySelectorAll('.ps-period-box, .ps-table thead th').forEach(function (el) {
      el.style.backgroundColor = hex;
      el.style.color = '#fff';
    });
    previewPaystubContent.querySelectorAll('.ps-summary-row.accent').forEach(function (el) {
      el.style.backgroundColor = hex;
      el.style.color = '#fff';
      el.style.margin = '0 -0.25rem';
      el.style.padding = '0.35rem 0.5rem';
      el.style.borderRadius = '4px';
    });
  }

  function openPreviewPaystubModal() {
    if (previewPaystubContent) {
      previewPaystubContent.innerHTML = buildPreviewPaystubHTML();
      applyPreviewPaystubAccent();
    }
    if (previewPaystubModal) {
      previewPaystubModal.classList.add('is-open');
      previewPaystubModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closePreviewPaystubModalFn() {
    if (previewPaystubModal) {
      previewPaystubModal.classList.remove('is-open');
      previewPaystubModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (previewBtn && warningBar) {
    previewBtn.addEventListener('click', function () {
      var valid = checkMandatory();
      if (valid) {
        openPreviewPaystubModal();
      } else {
        updateMandatoryUI();
      }
    });
  }

  if (closePreviewPaystubModal) closePreviewPaystubModal.addEventListener('click', closePreviewPaystubModalFn);
  if (previewMakeChangesBtn) previewMakeChangesBtn.addEventListener('click', closePreviewPaystubModalFn);
  if (previewProceedDownloadBtn) previewProceedDownloadBtn.addEventListener('click', function () {
    var el = document.getElementById('previewPaystubContent');
    if (!el || typeof html2pdf === 'undefined') {
      closePreviewPaystubModalFn();
      return;
    }
    var payday = getVal('payday');
    var baseName = 'paystub';
    if (payday) {
      var d = payday.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (d) baseName = 'paystub_' + d[1] + '-' + d[2] + '-' + d[3];
    }
    var filename = baseName + '.pdf';
    var opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    var clone = el.cloneNode(true);
    clone.id = '';
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:210mm;background:#fafafa;padding:1rem;border-radius:6px;border:1px solid #e0e0e0;box-sizing:border-box;';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    function doPdf() {
      html2pdf().set(opt).from(wrapper).save().then(function () {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        closePreviewPaystubModalFn();
      }).catch(function () {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        closePreviewPaystubModalFn();
      });
    }
    requestAnimationFrame(function () { requestAnimationFrame(doPdf); });
  });
  if (previewPaystubModal) previewPaystubModal.addEventListener('click', function (e) {
    if (e.target === previewPaystubModal) closePreviewPaystubModalFn();
  });

  // Calculate Taxes: standard US payroll formulas
  (function () {
    var FICA_RATE = 0.062;
    var FICA_WAGE_BASE_ANNUAL = 168600;
    var MEDICARE_RATE = 0.0145;
    var STD_DEDUCTION_SINGLE = 14600;
    var STD_DEDUCTION_MARRIED = 29200;
    var BRACKETS_SINGLE = [
      [11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]
    ];
    var BRACKETS_MARRIED = [
      [23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]
    ];

    function parseNum(str) {
      if (str == null || str === '') return 0;
      var n = parseFloat(String(str).replace(/[^0-9.-]/g, ''), 10);
      return isNaN(n) ? 0 : n;
    }

    function federalWithholding(annualGross, filingStatus) {
      var std = (filingStatus === 'married-widow' || filingStatus === 'married') ? STD_DEDUCTION_MARRIED : STD_DEDUCTION_SINGLE;
      var taxable = Math.max(0, annualGross - std);
      var brackets = (filingStatus === 'married-widow' || filingStatus === 'married') ? BRACKETS_MARRIED : BRACKETS_SINGLE;
      var tax = 0;
      var prev = 0;
      for (var i = 0; i < brackets.length; i++) {
        var limit = brackets[i][0];
        var rate = brackets[i][1];
        if (taxable <= prev) break;
        var slice = Math.min(taxable, limit) - prev;
        tax += slice * rate;
        prev = limit;
      }
      return Math.round(tax * 100) / 100;
    }

    function runCalculateTaxes() {
      var grossEl = document.getElementById('earningAmountOriginal');
      var gross = parseNum(grossEl ? grossEl.value : 0);
      if (gross <= 0) {
        gross = parseNum(document.querySelector('input[name="earningAmount_0"]') ? document.querySelector('input[name="earningAmount_0"]').value : 0);
      }
      var schedule = (document.getElementById('paySchedule') && document.getElementById('paySchedule').value) || 'semimonthly';
      var periodsMap = { daily: 260, weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, quarterly: 4, semiannually: 2, annually: 1 };
      var periodsPerYear = periodsMap[schedule] || 24;
      var annualGross = gross * periodsPerYear;
      var filingStatus = (document.getElementById('filingStatusSelect') && document.getElementById('filingStatusSelect').value) || 'single-separately';

      var federalAnnual = federalWithholding(annualGross, filingStatus);
      var federal = Math.round((federalAnnual / periodsPerYear) * 100) / 100;

      var ficaCapPerPeriod = FICA_WAGE_BASE_ANNUAL / periodsPerYear;
      var fica = Math.round(Math.min(gross, ficaCapPerPeriod) * FICA_RATE * 100) / 100;

      var medicare = Math.round(gross * MEDICARE_RATE * 100) / 100;

      var stateAbbr = (document.querySelector('select[name="companyState"]') && document.querySelector('select[name="companyState"]').value) || '';
      var stateRate = stateAbbr ? 0.04 : 0;
      var state = Math.round(gross * stateRate * 100) / 100;

      var totalTax = federal + fica + medicare + state;
      var netPay = Math.round((gross - totalTax) * 100) / 100;

      function setTax(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val.toFixed(2);
      }
      function setNet(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = '$' + val.toFixed(2);
      }

      setTax('taxFederal', federal);
      setTax('taxFederalYtd', federal);
      setTax('taxFica', fica);
      setTax('taxFicaYtd', fica);
      setTax('taxMedicare', medicare);
      setTax('taxMedicareYtd', medicare);
      setTax('taxState', state);
      setTax('taxStateYtd', state);
      setNet('taxNetPay', netPay);
      setNet('taxNetPayYtd', netPay);

      var stateLabel = document.getElementById('taxStateLabel');
      if (stateLabel && stateAbbr) stateLabel.textContent = stateAbbr + ' State';
      else if (stateLabel) stateLabel.textContent = 'State';
    }

    var calcBtn = document.getElementById('calculateTaxesBtn');
    if (calcBtn) calcBtn.addEventListener('click', runCalculateTaxes);
  })();

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
