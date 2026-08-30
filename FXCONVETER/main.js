const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

let amountInput;
let fromCurrencySelect;
let toCurrencySelect;
let convertBtn;
let swapBtn;
let resultEl;

function showResult(message) {
  resultEl.textContent = message;
}

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  if (isNaN(amount) || amount <= 0) {
    showResult('올바른 금액을 입력해주세요.');
    return;
  }

  if (from === to) {
    showResult(`${amount} ${from} = ${amount} ${to}`);
    return;
  }

  showResult('변환 중...');

  try {
    const response = await fetch(`${API_BASE_URL}${from}`);
    if (!response.ok) {
      throw new Error('API 요청 실패');
    }
    const data = await response.json();
    const rate = data.rates[to];
    const converted = amount * rate;

    showResult(`${amount} ${from} = ${converted.toLocaleString()} ${to}`);
  } catch (error) {
    showResult('환율 정보를 가져오는 데 실패했습니다. 다시 시도해주세요.');
  }
}

function swapCurrencies() {
  const temp = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = temp;

  if (amountInput.value) {
    convertCurrency();
  }
}

function initApp() {
  amountInput = document.getElementById('amount-input');
  fromCurrencySelect = document.getElementById('from-currency');
  toCurrencySelect = document.getElementById('to-currency');
  convertBtn = document.getElementById('convert-btn');
  swapBtn = document.getElementById('swap-btn');
  resultEl = document.getElementById('result');

  convertBtn.addEventListener('click', convertCurrency);
  swapBtn.addEventListener('click', swapCurrencies);
}

document.addEventListener('DOMContentLoaded', initApp);
