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
}

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
  return res.json(customer.statment)

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

  customers.push(statementOperation);
  return res.status(201).send(statementOperation);
});

app.post('/', verifyIfExistAccountCPF, (req, res) => {

});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
