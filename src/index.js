const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 3001;

const customers = [];

app.use(express.json());

function verifyIfExistAccountCPF(req, res, next){
  const { cpf } = req.params;
  console.log(cpf)
  const customer = customers.find((customer) => customers.cpf === cpf);

  if(!customer) {
    return res.status(400).json({ erro: "Customer not found"})
  }

  req.customer = customer;

  return next();
};

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
};

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customersAlreadyExist = customers.some(
    (customers) => customers.cpf === cpf
  );
  if (customersAlreadyExist) {
    res.status(400).json({ error: "Customer already exist!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });
  return res.status(201).send();
});

app.get('/statement/:cpf', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement)

});

app.post('/deposit', verifyIfExistAccountCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);
  return res.status(201).send(statementOperation);
});

app.post('/withdraw', verifyIfExistAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;
  const numericAmount = parseFloat(amount);

  const balance = getBalance(customer.statement);

  if (isNaN(numericAmount) || balance < numericAmount) {
    return res.status(400).json({error: "Insufficienr funds!"})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };
  
  customer.statement.push(statementOperation)
  console.log(customer.statement);
  return res.status(201).send()
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
