const express = require('express');
const { faker } = require('@faker-js/faker');

const app = express();
app.use(express.json());

app.get('/emails', (req, res) => {
  const emails = Array.from({ length: 3 }, () =>
    faker.internet.email().toLowerCase(),
  );

  setTimeout(() => {
    res.json(emails);
  }, 3000);
});

app.get('/phones', (req, res) => {
  const phones = Array.from({ length: 2 }, () =>
    faker.phone.number('+55 ## 9####-####'),
  );

  setTimeout(() => {
    res.json(phones);
  }, 3000);
});

app.post('/emails/validate', (req, res) => {
  const results = (req.body || []).map(email => ({
    email,
    valid: faker.datatype.boolean(),
  }));

  setTimeout(() => {
    res.json(results);
  }, 3000);
});

app.post('/phones/validate', (req, res) => {
  const results = (req.body || []).map(phone => ({
    phone,
    valid: faker.datatype.boolean(),
  }));

  setTimeout(() => {
    res.json(results);
  }, 3000);
});

const PORT = process.env.MOCK_API_PORT || 3001;

app.listen(PORT, () => {});
