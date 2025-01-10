import App from './App';

const numberInput = document.getElementById('number-input') as HTMLInputElement;
const submitNumberBtn = document.getElementById('submit-number-btn') as HTMLButtonElement;

const step1 = document.getElementById('step-1') as HTMLDivElement;
const step2 = document.getElementById('step-2') as HTMLDivElement;
const step3 = document.getElementById('step-3') as HTMLDivElement;

const resultValueElement = document.getElementById('result-value') as HTMLSpanElement;

let myNumber: number | null = null;

const app = new App();

async function handleSubmitNumber() {
  const numberInput = document.getElementById('number-input') as HTMLInputElement;
  myNumber = parseInt(numberInput.value, 10);

  if (myNumber === null || isNaN(myNumber)) {
    // eslint-disable-next-line no-alert
    alert('Please enter a valid number.');
    return;
  }

  step1.classList.add('hidden');
  step2.classList.remove('hidden');

  const result = await app.mpcLargest(myNumber);

  step2.classList.add('hidden');
  step3.classList.remove('hidden');
  resultValueElement.textContent = result.toString();
}

submitNumberBtn.addEventListener('click', handleSubmitNumber);

numberInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    handleSubmitNumber();
  }
});
