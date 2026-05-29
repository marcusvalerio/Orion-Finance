
const expenseList = document.getElementById('expenseList');
const balanceEl = document.getElementById('balance');
const expenseCount = document.getElementById('expenseCount');
const insightsEl = document.getElementById('insights');

let expenses = JSON.parse(localStorage.getItem('orion-expenses')) || [];

function saveExpenses(){
  localStorage.setItem('orion-expenses', JSON.stringify(expenses));
}

function renderExpenses(){

  expenseList.innerHTML = '';

  let total = 0;

  expenses.forEach((expense, index)=>{

    total += Number(expense.value);

    const item = document.createElement('div');
    item.className = 'expense-item';

    item.innerHTML = `
      <div>
        <strong>${expense.name}</strong>
        <br>
        <small>${expense.category}</small>
      </div>

      <div>
        <p>R$ ${Number(expense.value).toFixed(2)}</p>
        <button class="delete-btn" onclick="removeExpense(${index})">X</button>
      </div>
    `;

    expenseList.appendChild(item);

  });

  balanceEl.innerText = `- R$ ${total.toFixed(2)}`;
  expenseCount.innerText = `${expenses.length} itens`;

}

function removeExpense(index){
  expenses.splice(index,1);
  saveExpenses();
  renderExpenses();
}

document.getElementById('addExpense').addEventListener('click', ()=>{

  const name = document.getElementById('name').value;
  const value = document.getElementById('value').value;
  const category = document.getElementById('category').value;

  if(!name || !value) return;

  expenses.push({
    name,
    value,
    category
  });

  saveExpenses();
  renderExpenses();

  document.getElementById('name').value = '';
  document.getElementById('value').value = '';

});

document.getElementById('themeToggle').addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
});

document.getElementById('generateInsights').addEventListener('click', async ()=>{

  insightsEl.innerHTML = 'Analisando suas finanças...';

  const prompt = `
  Analise essas despesas financeiras e dê dicas curtas, inteligentes e elegantes:

  ${JSON.stringify(expenses)}
  `;

  try{

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',
      headers:{
        'Authorization':'Bearer SUA_KEY_OPENROUTER',
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        model:'deepseek/deepseek-chat-v3-0324:free',
        messages:[
          {
            role:'user',
            content:prompt
          }
        ]
      })
    });

    const data = await response.json();

    insightsEl.innerHTML =
      data.choices?.[0]?.message?.content ||
      'Não foi possível gerar insights.';

  }catch(error){

    insightsEl.innerHTML =
      'Erro ao conectar com a IA.';

  }

});

renderExpenses();
