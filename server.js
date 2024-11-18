const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database'); // Include the database connection
const ExcelJS = require('exceljs');
// const session = require('express-session');

const app = express();
const port = 3002;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
const crypto = require('crypto');
const session = require('express-session');

const secretKey = crypto.randomBytes(32).toString('hex'); // Generates a random 32-byte secret

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid'); // Adjust this based on your cookie name
        res.sendStatus(200); // Success
    });
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        // Insert the user into the database with the hashed password
        db.run(`INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)`, 
            [name, email, hash, false], // false for regular user, change to true for admin if needed
            function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Error creating user' });
                }
                res.status(200).json({ message: 'User registered successfully' });
            }
        );
    });
});

app.get('/create-admin', (req, res) => {
    const name = 'admin';
    const email = 'admin@gmail.com';
    const plainPassword = 'password'; // Enter the admin's plain text password here

    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        db.run(`INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)`, 
            [name, email, hash, true], // isAdmin set to true
            function(err) {
                if (err) {
                    return res.status(500).json({ message: 'Error creating admin' });
                }
                res.status(200).json({ message: 'Admin created successfully' });
            }
        );
    });
});

// Endpoint to fetch expiry applicants
app.get('/expiry-user', isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expiry-user.html'));
});

// API route to get expiry applicants data
app.get('/api/expiry-user', isAdmin,(req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    // SQL query to fetch applicants with expiry_date greater than today
    db.all(`SELECT * FROM applicant WHERE expiry_date < ?`, [today], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to retrieve data' });
        } else {
            res.json(rows); // Send the rows as JSON response
        }
    });
});

app.get('/get-application-info', (req, res) => {
    db.get('SELECT appl_no FROM applicant ORDER BY appl_no DESC LIMIT 1', [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Check if the table is empty
        const appl_no = row ? row.appl_no + 1 : 20; // Start at 20 if the table is empty
        const appl_date = new Date().toISOString().split('T')[0]; // Current date

        res.json({ appl_no, appl_date });
    });
});
app.post('/submit', (req, res) => {
    const data = req.body;
    const appl_no = data.Appl_No;
    const amount = parseInt(data.amount);

    const appl_date = data.Appl_date;
     const currentDate = new Date();
     const from_date = currentDate.toISOString().split('T')[0];
 
     let expiry_date;
     let totalInterest, totalPrincipal, totalAmount, installments, perInstallmentAmount;
    //  const amount = 100000; 

 
     function addMonths(date, months) {
         const newDate = new Date(date);
         newDate.setMonth(newDate.getMonth() + months);
         return newDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
     }
 
     if (data.subscriptionOption){

         switch (data.subscriptionOption.toLowerCase()) {
             case 'monthly':
                 expiry_date = addMonths(currentDate, 1);
                 break;
             case 'quarterly':
                 expiry_date = addMonths(currentDate, 3);
                 break;
             case 'halfyearly':
                 expiry_date = addMonths(currentDate, 6);
                 break;
             case 'yearly':
                 expiry_date = addMonths(currentDate, 12);
                 break;
             default:
                 return res.status(400).json({ error: "Invalid subscription option" });
         }
     }

       // Calculation logic based on plan and subscription
    switch (data.planSelection) {
        case 'A':
            if (data.subscriptionOption === 'monthly') {
                totalInterest = 11;
                installments = 60;
            } else if (data.subscriptionOption === 'quarterly') {
                totalInterest = 11;
                installments = 20;
            } else if (data.subscriptionOption === 'halfyearly') {
                totalInterest = 11;
                installments = 10;
            } else if (data.subscriptionOption === 'yearly') {
                totalInterest = 12;
                installments = 5;
            }
            break;
        case 'B':
            if (data.subscriptionOption === 'monthly') {
                totalInterest = 10;
                installments = 36;
            } else if (data.subscriptionOption === 'quarterly') {
                totalInterest = 10;
                installments = 12;

            } else if (data.subscriptionOption === 'halfyearly') {
                totalInterest = 10;
                installments = 6;
            } else if (data.subscriptionOption === 'yearly') {
                totalInterest = 11;
                installments = 3;
            }
            break;
        case 'C':
            if (data.subscriptionOption === 'yearly') {
                totalInterest = 9;
                installments = 1;
            } else {
                return res.status(400).json({ error: "Plan C only supports yearly subscription." });
            }
            break;
        default:
            return res.status(400).json({ error: "Invalid plan selection" });
    }

    console.log("total installment ->",installments);
    totalPrincipal = (amount * totalInterest) / 100;
    totalAmount = amount + totalPrincipal;
    perInstallmentAmount = totalAmount / installments;
    console.log("calc",totalAmount / installments);
    console.log("calc sd",totalAmount / installments);
    console.log("total principa",totalPrincipal);
    console.log("total total Amount",totalAmount);
    console.log("per installment",perInstallmentAmount);

    const query = `INSERT INTO applicant (
        appl_no, appl_date, name, gender, email, dateOfBirth, phoneNumber,
        whatsappNumber, isWhatsapp,
        panCardNumber, aadhaarNumber, currentAddress, sameAddress, permanentAddress, pinCode, city,
        bankName, accountNumber, MICR, ifscCode, accountType, branchAddress,
        nomineeName, nomineeDOB,nomineeGender, nomineeRelationship, nomineePhoneNumber, appointeeName, appointeeRelationship,
        paymentMode, planSelection, subscriptionOption, payor_name, payor_relation, payor_phone, payor_email, opt_option,
        with_name, with_relationship, with_address, with_city, 
        with_state, with_country, with_pincode, with_landmark,from_date,expiry_date,amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        appl_no, appl_date, data.name, data.gender, data.email,data.dateOfBirth, data.phoneNumber,
        data.whatsappNumber, data.whatsappSame,
        data.panCardNumber, data.aadhaarNumber, data.currentAddress, data.sameAddress, data.permanentAddress,data.pinCode, data.city, 
        data.bankName,data.accountNumber, data.MICR, data.ifscCode, data.accountType, data.branchAddress, 
        data.Nom_Name, data.Nom_dob, data.Nom_gender, data.Nom_relationship, data.Nom_phoneNumber, data.appointeeName, data.appointeeRelationship,
        data.paymentMode, data.planSelection, data.subscriptionOption,data.Payor_name, data.payor_relation, data.payor_phone,data.Payor_email, data.optOption, 
        data.with_name, data.with_relationship, data.with_address, data.with_city, 
        data.with_state, data.with_country, data.with_pincode, data.with_landmark,from_date,expiry_date,amount
    ];
    const subscriptionQuery = `SELECT * FROM subscription WHERE subscription_type = ?`;
    const subscriptionOption = data.subscriptionOption;  // E.g., "monthly"

    db.get(subscriptionQuery, [subscriptionOption], (err, row) => {
        if (err) {
            console.error('Error fetching subscription:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            console.log('Subscription fetched:', row);
            // Continue with your logic, e.g., use row.subscription_id
        } else {
            console.log('No subscription found for the provided option');
        }

    const subscriptionId = row.subscription_id;
    debugger
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Data inserted successfully');
        for (let i = 0; i < installments; i++) {
            // const dueDate = addMonths(currentDate, i + 1);
            let dueDate;  // Initialize dueDate outside the if-else blocks

            if (data.subscriptionOption === 'monthly') {
                dueDate = addMonths(currentDate, i + 1);
            } else if (data.subscriptionOption === 'quarterly') {
                dueDate = addMonths(currentDate, (i + 1) * 3);
            } else if (data.subscriptionOption === 'halfyearly') {
                dueDate = addMonths(currentDate, (i + 1) * 6);
            } else if (data.subscriptionOption === 'yearly') {
                dueDate = addMonths(currentDate, (i + 1) * 12);
            }
            const installmentQuery = `INSERT INTO installment (applicant_id, subscription_id, installment_id, due_date, amount, status) VALUES (?, ?, ?, ?, ?, ?)`;
            const installmentParams = [this.lastID, subscriptionId,i + 1, dueDate, perInstallmentAmount,"not paid"];
            
            db.run(installmentQuery, installmentParams, function(err) {
                if (err) {
                    console.error('Error inserting data into installment:', err.message);
                }
            });
        }
        res.status(200).json({ message: 'Form submitted successfully!' });
    });
});
});

app.get('/applicants', isAdmin, (req, res) => {
    db.all('SELECT * FROM applicant', [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);  // Send the applicant data as JSON
    });
});

app.get('/applicants-page', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'applicants.html'));
});


function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    } else {
        // Redirect with a query parameter to indicate not authorized
        return res.redirect('/login?error=not-authorized');
    }
}


app.get('/download-excel', (req, res) => {
    db.all('SELECT * FROM applicant', [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: err.message });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Applicants');

        // Define columns
        worksheet.columns = [
            { header: 'Application No', key: 'appl_no', width: 15 },
            { header: 'Application Date', key: 'appl_date', width: 20 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Gender', key: 'gender', width: 10 },
            { header: 'Material Status', key: 'materialStatus', width: 15 },
            { header: 'Education Qualification', key: 'educationQualification', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
            { header: 'Phone Number', key: 'phoneNumber', width: 15 },
            { header: 'Whatsapp Number', key: 'whatsappNumber', width: 15 },
            { header: 'Father', key: 'father', width: 20 },
            { header: 'Mother', key: 'mother', width: 20 },
            { header: 'Occupation', key: 'occupation', width: 20 },
            { header: 'Designation', key: 'designation', width: 20 },
            { header: 'Nature of Duties', key: 'natureOfDuties', width: 25 },
            { header: 'Present Employer', key: 'presentEmployer', width: 20 },
            { header: 'Length of Service Business', key: 'lengthOfServiceBusiness', width: 25 },
            { header: 'Work Location', key: 'workLocation', width: 20 },
            { header: 'Annual Income', key: 'annualIncome', width: 15 },
            { header: 'Pan Card Number', key: 'panCardNumber', width: 20 },
            { header: 'Aadhaar Number', key: 'aadhaarNumber', width: 20 },
            { header: 'Current Address', key: 'currentAddress', width: 30 },
            { header: 'Same Address', key: 'sameAddress', width: 10 },
            { header: 'Permanent Address', key: 'permanentAddress', width: 30 },
            { header: 'Pin Code', key: 'pinCode', width: 10 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'Country', key: 'country', width: 20 },
            { header: 'Landmark', key: 'landmark', width: 20 },
            { header: 'Foreign National', key: 'foreignNational', width: 15 },
            { header: 'PEP Status', key: 'pepStatus', width: 15 },
            { header: 'Bank Name', key: 'bankName', width: 20 },
            { header: 'Account Number', key: 'accountNumber', width: 20 },
            { header: 'MICR', key: 'MICR', width: 15 },
            { header: 'IFSC Code', key: 'ifscCode', width: 15 },
            { header: 'Account Type', key: 'accountType', width: 15 },
            { header: 'Branch Address', key: 'branchAddress', width: 30 },
            { header: 'Nominee Name', key: 'nomineeName', width: 20 },
            { header: 'Nominee DOB', key: 'nomineeDOB', width: 15 },
            { header: 'Nominee Gender', key: 'nomineeGender', width: 10 },
            { header: 'Nominee Relationship', key: 'nomineeRelationship', width: 20 },
            { header: 'Nominee Phone Number', key: 'nomineePhoneNumber', width: 15 },
            { header: 'Appointee Name', key: 'appointeeName', width: 20 },
            { header: 'Appointee Relationship', key: 'appointeeRelationship', width: 20 },
            { header: 'Payment Mode', key: 'paymentMode', width: 20 },
            { header: 'Plan Selection', key: 'planSelection', width: 20 },
            { header: 'Subscription Option', key: 'subscriptionOption', width: 20 },
            { header: 'Payor Name', key: 'payor_name', width: 20 },
            { header: 'Payor Relation', key: 'payor_relation', width: 20 },
            { header: 'Payor Phone', key: 'payor_phone', width: 15 },
            { header: 'Payor Email', key: 'payor_email', width: 25 },
            { header: 'Opt Option', key: 'opt_option', width: 15 },
            { header: 'With Name', key: 'with_name', width: 20 },
            { header: 'With Relationship', key: 'with_relationship', width: 20 },
            { header: 'With Address', key: 'with_address', width: 30 },
            { header: 'With City', key: 'with_city', width: 20 },
            { header: 'With State', key: 'with_state', width: 20 },
            { header: 'With Country', key: 'with_country', width: 20 },
            { header: 'With Pincode', key: 'with_pincode', width: 10 },
            { header: 'With Landmark', key: 'with_landmark', width: 20 },
            { header: 'Terms Accepted', key: 'terms_accepted', width: 15 }
        ];

        worksheet.addRows(rows);

        // Set the response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=applicants.xlsx');

        // Write the workbook to the response
        workbook.xlsx.write(res).then(() => {
            res.end();
        }).catch(err => {
            console.error('Error writing excel file:', err.message);
            res.status(500).json({ error: 'Failed to generate Excel file' });
        });
    });
});


// Start server
app.post('/admin/login', (req, res) => {
    debugger
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {

        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error checking password' });
            }

            if (isMatch) {
                if (user.isAdmin) {
                    req.session.user = user;
                    res.json({ success: true });
                } else {
                    res.status(403).json({ message: 'You are not authorized' });
                }
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        });
    });
});
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
});

app.get('/thank-you', (req, res) => {
    debugger
    res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

// API to fetch installments with pagination for a particular applicant
// Serve the installments HTML page for a specific applicant
app.get('/applicant/:applicantId/installments', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'installments.html'));
});

// Fetch paginated installments for a specific applicant
app.get('/applicant/:applicantId/installments/data', (req, res) => {
    const applicantId = req.params.applicantId;
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const limit = parseInt(req.query.limit) || 10;  // Default to limit 10
    const offset = (page - 1) * limit;  // Calculate offset

    // Query to fetch paginated installments
    const installmentQuery = `
        SELECT * FROM installment 
        WHERE applicant_id = ? 
        ORDER BY due_date ASC 
        LIMIT ? OFFSET ?
    `;

    db.all(installmentQuery, [applicantId, limit, offset], (err, rows) => {
        if (err) {
            console.error('Error fetching installments:', err.message);
            return res.status(500).json({ error: err.message });
        }

        // Fetch the total count of installments for pagination info
        const countQuery = 'SELECT COUNT(*) AS total FROM installment WHERE applicant_id = ?';
        db.get(countQuery, [applicantId], (err, countRow) => {
            if (err) {
                console.error('Error fetching total installments count:', err.message);
                return res.status(500).json({ error: err.message });
            }

            const totalInstallments = countRow.total;
            const totalPages = Math.ceil(totalInstallments / limit);

            res.json({
                installments: rows,
                currentPage: page,
                totalPages,
                totalInstallments
            });
        });
    });
});

// app.get('/api/due-installments', (req, res) => {
//     const today = new Date();
//     const next30Days = new Date(today);
//     next30Days.setDate(today.getDate() + 30);

//     const todayStr = today.toISOString().split('T')[0];
//     const next30DaysStr = next30Days.toISOString().split('T')[0];

//     const query = `
//         SELECT installment_id, applicant_id, due_date, amount, status
//         FROM installment
//         WHERE due_date BETWEEN ? AND ?
//     `;

//     db.all(query, [todayStr, next30DaysStr], (err, rows) => {
//         if (err) {
//             console.error('Error querying database:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.json(rows);
//     });
// });




































// // Endpoint to fetch installments due exactly 30 days from today
// app.get('/api/due-installments', (req, res) => {
//     const today = new Date();
//     const next30Days = new Date(today);
//     next30Days.setDate(today.getDate() + 30);

//     const todayStr = today.toISOString().split('T')[0];
//     const next30DaysStr = next30Days.toISOString().split('T')[0];

//     const query = `
//         SELECT installment_id, applicant_id, due_date, amount, status
//         FROM installment
//         WHERE due_date = ?
//     `;

//     db.all(query, [next30DaysStr], (err, rows) => {
//         if (err) {
//             console.error('Error querying database:', err.message);
//             return res.status(500).json({ error: 'Database error' });
//         }
//         res.json(rows);
//     });
// });

// ==========================================================================for alldue table data store=======================================

app.get('/api/due-installments', (req, res) => {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const todayStr = today.toISOString().split('T')[0];
    const next30DaysStr = next30Days.toISOString().split('T')[0];

    const query = `
        SELECT installment_id, applicant_id, due_date, amount, status
        FROM installment
        WHERE due_date = ?
    `;

    db.all(query, [next30DaysStr], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        // Insert the fetched rows into the 'alldue' table, ensuring no duplicates
        const insertQuery = `
            INSERT OR IGNORE INTO alldue (
                installment_id, applicant_id, due_date, due_amount, status
            ) VALUES (?, ?, ?, ?, ?)
        `;

        rows.forEach(row => {
            // Check if the applicant_id already exists in alldue table
            const checkQuery = `SELECT 1 FROM alldue WHERE applicant_id = ? LIMIT 1`;

            db.get(checkQuery, [row.applicant_id], (err, existingRow) => {
                if (err) {
                    console.error('Error checking for duplicates:', err.message);
                    return;
                }

                if (!existingRow) {
                    // Insert the row only if applicant_id doesn't exist
                    db.run(insertQuery, [row.installment_id, row.applicant_id, row.due_date, row.amount, row.status], (err) => {
                        if (err) {
                            console.error('Error inserting into alldue table:', err.message);
                        }
                    });
                }
            });
        });

        // Respond with the data that was inserted
        res.json(rows);
    });
});
app.get('/api/update-alldue-with-applicant-info', (req, res) => {
    // Query to fetch all rows from the applicant table with a row number (serial number)
    const applicantQuery = `
        SELECT rowid AS serial_no, appl_no, name, email, phoneNumber, amount, 
               paymentMode, planSelection, subscriptionOption, bankName, 
               accountNumber, MICR, ifscCode, accountType, branchAddress
        FROM applicant
        ORDER BY rowid
    `;

    db.all(applicantQuery, (err, applicantRows) => {
        if (err) {
            console.error('Error fetching applicant data:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        // Map serial_no to applicant data for easier lookup
        const applicantMap = applicantRows.reduce((map, row) => {
            map[row.serial_no] = row;
            return map;
        }, {});

        // Query to fetch all rows from the alldue table
        const alldueQuery = `
            SELECT installment_id, applicant_id
            FROM alldue
        `;

        db.all(alldueQuery, (err, alldueRows) => {
            if (err) {
                console.error('Error fetching alldue data:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            // Update each row in the alldue table with corresponding applicant data
            const updateQuery = `
                UPDATE alldue
                SET appl_no = ?, name = ?, email = ?, phoneNumber = ?, amount = ?, 
                    paymentMode = ?, planSelection = ?, subscriptionOption = ?, 
                    bankName = ?, accountNumber = ?, MICR = ?, ifscCode = ?, 
                    accountType = ?, branchAddress = ?
                WHERE installment_id = ?
            `;

            alldueRows.forEach(row => {
                const applicantData = applicantMap[row.applicant_id]; // Find matching applicant by serial_no
                if (applicantData) {
                    db.run(updateQuery, [
                        applicantData.appl_no, applicantData.name, applicantData.email,
                        applicantData.phoneNumber, applicantData.amount, applicantData.paymentMode,
                        applicantData.planSelection, applicantData.subscriptionOption, applicantData.bankName,
                        applicantData.accountNumber, applicantData.MICR, applicantData.ifscCode,
                        applicantData.accountType, applicantData.branchAddress,
                        row.installment_id
                    ], (err) => {
                        if (err) {
                            console.error(`Error updating alldue for installment_id ${row.installment_id}:`, err.message);
                        }
                    });
                } else {
                    console.warn(`No matching applicant found for applicant_id ${row.applicant_id}`);
                }
            });

            res.json({ message: 'alldue table updated with applicant information based on serial number.' });
        });
    });
});

// ================================================================for pending table data store=========================================================


// Route to get data from the alldue table
app.get('/get-pending', (req, res) => {
    const currentDate = new Date();
    const next30Days = new Date();
    next30Days.setDate(currentDate.getDate() + 30);

    const query = `
        SELECT * FROM alldue
        WHERE due_date BETWEEN ? AND ?
    `;

    db.all(query, [currentDate.toISOString().split('T')[0], next30Days.toISOString().split('T')[0]], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Return all rows with due_date within 30 days
        res.json(rows);
    });
});

// Route to get data from the alldue table
app.get('/get-pending', (req, res) => {
    const currentDate = new Date();
    const next30Days = new Date();
    next30Days.setDate(currentDate.getDate() + 30);

    const query = `
        SELECT * FROM alldue
        WHERE due_date BETWEEN ? AND ?
    `;

    db.all(query, [currentDate.toISOString().split('T')[0], next30Days.toISOString().split('T')[0]], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Return all rows with due_date within 30 days
        res.json(rows);
    });
});

// Route to mark payment as completed and move data to 'pending' table
app.post('/mark-paid', (req, res) => {
    const { applicant_id, due_date, payment_date, installment_id } = req.body;
    // const { installment_id, payment_date, amount } = req.body;
    console.log("instamment",installment_id
        
    )
    console.log(req.body)

    const query = `
        INSERT INTO pending (
            appl_no, name, email, phoneNumber, amount, paymentMode, planSelection, subscriptionOption,
            installment_id, due_date, due_amount, bankName, accountNumber, MICR, ifscCode, accountType, branchAddress,
            status, paymentDate
        )
        SELECT appl_no, name, email, phoneNumber, amount, paymentMode, planSelection, subscriptionOption,
            installment_id, due_date, due_amount, bankName, accountNumber, MICR, ifscCode, accountType, branchAddress,
            'Paid', ?
        FROM alldue
        WHERE applicant_id = ? AND due_date = ?;
    `;

    db.run(query, [payment_date, applicant_id, due_date], function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send('Payment recorded successfully');
    });
});



// ============================================================for show alldues table====================================================================


// Route to fetch data from 'pending' table
app.get('/get-pending-data', (req, res) => {
    const query = `SELECT * FROM pending`;
    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);  // Return rows from 'pending' table
    });
});

// Endpoint to fetch expiry applicants
app.get('/dashboard', isAdmin,(req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});



















// Endpoint to save payment confirmation data to the database
app.post('/savePaymentDetails', (req, res) => {
    const paymentDetails = req.body;

    const query = `INSERT INTO payments (appl_no, appl_date, form_name, form_email, phoneNumber, paymentMode, planSelection, subscriptionOption, amount, chosenPaymentMethod, transactionId) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        paymentDetails.appl_no,
        paymentDetails.appl_date,
        paymentDetails.form_name,
        paymentDetails.form_email,
        paymentDetails.phoneNumber,
        paymentDetails.paymentMode,
        paymentDetails.planSelection,
        paymentDetails.subscriptionOption,
        paymentDetails.amount,
        paymentDetails.chosenPaymentMethod,
        paymentDetails.transactionId
    ];

    db.run(query, params, function(err) {
        if (err) {
            console.error("Error inserting data:", err);
            res.status(500).send('Database error');
        } else {
            res.status(200).send('Payment details saved successfully');
        }
    });
});

app.get('/getPayments', (req, res) => {
    const query = `SELECT * FROM payments`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching payments:", err);
            res.status(500).send('Database error');
        } else {
            res.json(rows);
        }
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
