// подключаем npm библиотеки EXPRESS и mysql2:
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 5000;

// Создание подключения к БД сайта AptekaPro:
const connection = mysql.createConnection({
  host: 'mysql81.hostland.ru',
  user: 'host1859841',
  password: 'arNhFbOld6',
  database: 'host1859841',
});

// проверяем подключение к базе данных
connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    throw err;
  } else {
    console.log('Подключение к базе данных успешно установлено');
  }
});

// express.static для указания пути к статическим файлам (в текущей директории: (http://localhost:3000/index.html будет возвращать файл index.html)
app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, '/js')));
app.use(express.static(path.join(__dirname, '/css')));
app.use(express.static(path.join(__dirname, '/pages')));

// --- Обработка запросов к базе данных:
//1  Запрос Пользователей:
app.get('/users', (req, res) => {
  connection.query('SELECT * FROM Пользователи', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Пользователи:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//2  Запрос Клиентов:
app.get('/clients', (req, res) => {
  connection.query('SELECT * FROM Клиенты', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Клиенты:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//3 Запрос товаров Медикоментов:
app.get('/tov', (req, res) => {
  connection.query('SELECT * FROM Медикоменты', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Товары:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//4 Запрос Товаров для детей:
app.get('/child', (req, res) => {
  connection.query('SELECT * FROM Товары_детям', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Товары_детям:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//5 Запрос товаров МедТехники:
app.get('/tech', (req, res) => {
  connection.query('SELECT * FROM Мед_Техника', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Мед Технику:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//6 Запрос на добавление нового Заказа:
app.get('/addorder', (req, res) => {
  let orderData = req.query;
  let sql = 'INSERT INTO `Заказы` (`Стоимость`, `УИД_клиента`, `Статус`) VALUES (?,?,?)';
  let values = [orderData.sum, orderData.iduser, orderData.status];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении в таблицу Заказы:', err.sqlMessage);
      res.status(500).json({ error: 'Ошибка при добавлении в таблицу Заказы' })
    } else {
      console.log(results);
      res.json({ message: 'Заказ добавлен' });
    }
  });
});

//7 Запрос на добавление нового Клиента:
app.get('/addclient', (req, res) => {
  let clientData = req.query;
  let sql = 'INSERT INTO `Клиенты` (`Фамилия`, `Имя`, `Отчество`, `Дата рождения`,`Пароль`, `Имя_клиента`) VALUES (?,?,?,?,?,?)';
  let values = [clientData.surname, clientData.name, clientData.middlename, clientData.bithdate, clientData.password, clientData.login];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении в таблицу Клиенты:', err);
      res.status(500).json({ error: 'Ошибка при добавлении в таблицу Клиенты' })
    } else {
      console.log(results);
      res.json({ message: 'Клиент добавлен' });
    }
  });
});

//8 Запрос на Заказы:
app.get('/orders', (req, res) => {
  connection.query('SELECT * FROM Заказы', (err, results) => {
    if (err) {
      console.error('Ошибка выполнения запроса в таблицу Заказы:', err);
      throw err
    } else {
      console.log(results);
      res.send(results);
    }
  });
});

//9 Запрос на УИД_Клиента по Имя_клиента:
app.get('/getclientid', (req, res) => {
  let clientName = req.query;
  let sql = 'SELECT УИД_клиента FROM Клиенты WHERE Имя_клиента = ? LIMIT 1';

  connection.query(sql, [clientName.client], (err, results) => {
    if (err) {
      console.error('Ошибка при запросе в таблицу Клиенты:', err.sqlMessage);
      res.status(500).json({ error: 'Ошибка при запросе в таблицу Клиенты' })
    } else {
      console.log(results);
      res.json({ results });
    }
  });
});

//10 Запрос на добавление нового Товара:
app.get('/addtov', (req, res) => {
  let tovData = req.query;
  let values = [tovData.title, tovData.price, tovData.company, tovData.qty, tovData.weight, tovData.icon];
  let sql = `INSERT INTO \`${tovData.category}\` (\`Название товара\`, \`Цена\`, \`Производитель\`, \`Количество\`, \`Вес\`, \`Икнока\`) VALUES (?,?,?,?,?,?)`;

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error('Ошибка при добавлении в БД нового товара:', err.sqlMessage);
      res.status(500).json({ error: 'Ошибка при добавлении в БД нового товара' })
    } else {
      console.log(results);
      res.json({ message: 'Товар добавлен в БД' });
    }
  });
});

// Закрытие подключения к базе данных при завершении работы приложения
process.on('SIGINT', () => {
  connection.end((err) => {
    if (err) {
      console.error('Ошибка закрытия подключения:', err);
    } else {
      console.log('Подключение к базе данных закрыто');
    }
    process.exit();
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});


