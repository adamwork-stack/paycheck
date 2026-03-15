(function () {
  'use strict';

  let earningIndex = 1;
  let deductionIndex = 0;
  let timeOffIndex = 0;

  const earningsContainer = document.querySelector('.earnings-table');
  const addEarningBtn = document.getElementById('addEarning');
  const addDeductionBtn = document.getElementById('addDeduction');
  const addTimeOffBtn = document.getElementById('addTimeOff');
  const previewBtn = document.getElementById('previewBtn');
  const warningBar = document.getElementById('warningBar');

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
