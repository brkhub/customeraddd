const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Veritabanı bağlantısı
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'user_management'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("DB Connected!");

    // Kullanıcı tablosu oluşturma
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            firstName VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            taxNumber VARCHAR(20) UNIQUE,
            identityNumber VARCHAR(20),
            iban VARCHAR(50),
            motherName VARCHAR(255),
            fatherName VARCHAR(255),
            birthdate DATE,
            address VARCHAR(255),
            prefecture VARCHAR(255),
            city VARCHAR(255),
            postalCode VARCHAR(20)
        )
    `;

    connection.query(createTableQuery, function (err, result) {
        if (err) throw err;
        console.log("DB table Created");
    });
});

app.post('/api/customers', (req, res) => {
    const { 
        firstName,
        lastName,
        email,
        phone,
        taxNumber,
        identityNumber,
        iban,
        motherName,
        fatherName,
        birthdate,
        address,
        prefecture,
        city,
        postalCode
    } = req.body;

    // Vergi numarasının benzersiz olduğunu kontrol etme
    const checkTaxNumberQuery = 'SELECT * FROM users WHERE taxNumber = ?';
    connection.query(checkTaxNumberQuery, [taxNumber], (err, results) => {
        if (err) {
            console.error('Vergi numarası kontrol edilirken bir hata oluştu:', err);
            res.status(500).json({ error: 'Vergi numarası kontrol edilirken bir hata oluştu' });
        } else {
            if (results.length > 0) {
                res.status(400).json({ error: 'Αυτός ο ΑΦΜ χρησιμοποιείται ήδη. Εισαγάγετε έναν άλλο φορολογικό αριθμό.' });
            } else {
                // Vergi numarası benzersiz ise, veritabanına ekleme işlemi
                const insertQuery = `
                    INSERT INTO users (
                        firstName,
                        lastName,
                        email,
                        phone,
                        taxNumber,
                        identityNumber,
                        iban,
                        motherName,
                        fatherName,
                        birthdate,
                        address,
                        prefecture,
                        city,
                        postalCode
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [
                    firstName,
                    lastName,
                    email,
                    phone,
                    taxNumber,
                    identityNumber,
                    iban,
                    motherName,
                    fatherName,
                    birthdate,
                    address,
                    prefecture,
                    city,
                    postalCode
                ];

                connection.query(insertQuery, values, function(err, result) {
                    if (err) {
                        console.error('Müşteri eklenirken bir hata oluştu:', err);
                        res.status(500).json({ error: 'Müşteri eklenirken bir hata oluştu' });
                    } else {
                        console.log('Müşteri başarıyla eklendi');
                        res.status(201).json({ message: 'Ο πελάτης προστέθηκε με επιτυχία', data: req.body });
                    }
                });
            }
        }
    });
});

app.get('/api/customers/:taxNumber', (req, res) => {
    const taxNumber = req.params.taxNumber;

    const query = 'SELECT * FROM users WHERE taxNumber = ?';
    connection.query(query, [taxNumber], (err, results) => {
        if (err) {
            console.error('Müşteri getirilirken bir hata oluştu:', err);
            res.status(500).json({ error: 'Müşteri getirilirken bir hata oluştu' });
        } else {
            console.log('Οι πελάτες εισήλθαν με επιτυχία.');
            res.status(200).json({ data: results });
        }
    });
});

// Müşterileri getiren yeni endpoint
app.get('/api/customers', (req, res) => {
    const query = 'SELECT * FROM users';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Müşteriler getirilirken bir hata oluştu:', err);
            res.status(500).json({ error: 'Müşteriler getirilirken bir hata oluştu' });
        } else {
            console.log('Οι πελάτες εισήλθαν με επιτυχία.');
            res.status(200).json({ data: results });
        }
    });
});

// Statik dosyaların sunulması için middleware
app.use(express.static(__dirname));

// Ana sayfa için GET endpoint'i
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main_page.html'));
});

// Sunucu dinleme
app.listen(PORT, () => {
    console.log(`Server running at Port ${PORT}`);
});
