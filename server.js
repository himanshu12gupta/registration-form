const express = require('express');
const multer = require('multer'); // For handling file uploads

const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database'); // Include the database connection
const ExcelJS = require('exceljs');
const moment = require('moment'); // Import moment


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



// Configure body size limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Multer for handling file uploads
const upload = multer({ dest: 'uploads/' });





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
    // var count = 1;
    const data = req.body;
    const appl_no = data.Appl_No;
    const amount = parseInt(data.amount);

    const appl_date = data.Appl_date;
     const currentDate = new Date();
     const from_date = currentDate.toISOString().split('T')[0];
 
     let expiry_date;
     let totalInterest, totalPrincipal, totalAmount, installments, perInstallmentAmount, loyalityBonus;
    //  const amount = 100000; 

 
     function addMonths(date, months) {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + months + 1); // Move to the next month
        newDate.setDate(0); // Set day to 0 to get the last day of the previous month
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
                loyalityBonus = 0;
                // lockinInstallment = 60;
            } else if (data.subscriptionOption === 'quarterly') {
                totalInterest = 11;
                installments = 20;
                loyalityBonus = 0;
                // lockinInstallment = 20;
            } else if (data.subscriptionOption === 'halfyearly') {
                totalInterest = 11;
                installments = 10;
                loyalityBonus = 0;
                // lockinInstallment = 10;
            } else if (data.subscriptionOption === 'yearly') {
                totalInterest = 12;
                installments = 5;
                loyalityBonus = 1;
                // lockinInstallment = 5;
            }
            break;
        case 'B':
            if (data.subscriptionOption === 'monthly') {
                totalInterest = 10;
                installments = 60;
                loyalityBonus = 0;
                lockinInstallment = 37;
            } else if (data.subscriptionOption === 'quarterly') {
                totalInterest = 10;
                installments = 20;
                loyalityBonus = 0;
                lockinInstallment = 13;
            } else if (data.subscriptionOption === 'halfyearly') {
                totalInterest = 10;
                installments = 10;
                loyalityBonus = 0;
                lockinInstallment = 7;
            } else if (data.subscriptionOption === 'yearly') {
                totalInterest = 11;
                installments = 3;
                loyalityBonus = 1;
                lockinInstallment = 4;
            }
            break;
        case 'C':
            if (data.subscriptionOption === 'yearly') {
                totalInterest = 9;
                installments = 3;
                loyalityBonus = 0;
                lockinInstallment = 2;
            } else {
                return res.status(400).json({ error: "Plan C only supports yearly subscription." });
            }
            break;
            case 'D':
            if (data.subscriptionOption === 'quarterly') {
                totalInterest = 10;
                installments = 12;
                loyalityBonus = 0;
                lockinInstallment = 5;
            } else if (data.subscriptionOption === 'halfyearly') {
                totalInterest = 10;
                installments = 6;
                loyalityBonus = 0;
                lockinInstallment = 3;
            } else if (data.subscriptionOption === 'yearly') {
                totalInterest = 10;
                installments = 3;
                loyalityBonus = 2;
                lockinInstallment = 2;
            }
            break;
            case 'E':
            if (data.subscriptionOption === 'yearly') {
                totalInterest = 12;
                installments = 3;
                loyalityBonus = 3;
                lockinInstallment = 3;
            } else {
                return res.status(400).json({ error: "Plan C only supports yearly subscription." });
            }
            break;

        default:
            return res.status(400).json({ error: "Invalid plan selection" });
    }

    console.log("total installment ->",installments);
    totalPrincipal = (amount * totalInterest) / 100;
    bonus = (amount * loyalityBonus) / 100;
    totalAmount = amount + totalPrincipal;
    perInstallmentAmount = totalPrincipal + bonus;
    lastInstallment = perInstallmentAmount + amount ;
    console.log("calc",totalAmount / installments);
    console.log("calc sd",totalAmount / installments);
    console.log("total principa",totalPrincipal);
    console.log("total total Amount",totalAmount);
    console.log("per installment",perInstallmentAmount);
    console.log("bonus",bonus);
    console.log("last installment", lastInstallment);



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
        if (data.subscriptionOption === 'monthly') {
            count = 1;
        }
        for (let i = 0; i < installments; i++) {
            // const dueDate = addMonths(currentDate, i + 1);
            let dueDate;  // Initialize dueDate outside the if-else blocks
            let installmentAmount;


            if (data.subscriptionOption === 'monthly') {
                dueDate = addMonths(currentDate, i + 1 );

                // count = 0 
            } else if (data.subscriptionOption === 'quarterly') {
                dueDate = addMonths(currentDate, (i + 1) * 3);
            } else if (data.subscriptionOption === 'halfyearly') {
                dueDate = addMonths(currentDate, (i + 1) * 6);
            } else if (data.subscriptionOption === 'yearly') {
                dueDate = addMonths(currentDate, (i + 1) * 12);
            }



           // Separate last installment calculation
    if (i === installments - 1) {
        installmentAmount =  lastInstallment;
    } else {
        installmentAmount = perInstallmentAmount;
    }


        
        
    console.log(`Installment ${i + 1}: Amount = ${installmentAmount}, Due Date = ${dueDate}`);

    const installmentQuery = `INSERT INTO installment 
        (applicant_id, subscription_id, installment_id, due_date, amount, status,  appl_no) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const installmentParams = [
        this.lastID,
        subscriptionId,
        i + 1,
        dueDate,
        installmentAmount,
        "not paid", 
        appl_no  
    ];

            
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


// Search applicant route
app.post('/search-applicant', (req, res) => {
    const { appl_no, pan_no } = req.body;
  
    if (!appl_no || !pan_no) {
      return res.status(400).json({ success: false, message: 'Application No and PAN No are required.' });
    }
  
    // Query the database
    const query = `SELECT * FROM applicant WHERE appl_no = ? AND panCardNumber = ?`;
    db.get(query, [appl_no, pan_no], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: 'Database error.' });
      }
  
      if (row) {
        // Match found
        res.json({ success: true, data: row });
      } else {
        // No match
        res.json({ success: false, message: 'Invalid Application No or PAN No.' });
      }
    });
  });







  











 
// API to search for an applicant
app.post("/searchApplicant", (req, res) => {
    const { appl_no, panCardNumber } = req.body;
    db.get(
        "SELECT * FROM applicant WHERE appl_no = ? AND panCardNumber = ?",
        [appl_no, panCardNumber],
        (err, row) => {
            if (err) return res.status(500).send("Database error");
            if (!row) return res.status(404).send("Invalid application number or PAN card number");
            res.json(row);
        }
    );
});

// API to update bank details
app.post("/updateBankDetails", (req, res) => {
    const { appl_no, bankName, accountNumber, MICR, ifscCode, accountType, branchAddress } = req.body;
    db.run(
        `UPDATE applicant SET bankName = ?, accountNumber = ?, MICR = ?, ifscCode = ?, accountType = ?, branchAddress = ? WHERE appl_no = ?`,
        [bankName, accountNumber, MICR, ifscCode, accountType, branchAddress, appl_no],
        function (err) {
            if (err) return res.status(500).send("Database error");
            res.send("Bank details updated successfully");
        }
    );
});




























app.delete('/applicant/:applicantId/installments', (req, res) => {
    const applicantId = req.params.applicantId;
    
    const query = `DELETE FROM installment WHERE applicant_id = ?`;
    
    db.run(query, [applicantId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete installments.' });
        }
        
        if (this.changes === 0) {
            res.status(404).json({ message: 'No installments found for this applicant.' });
        } else {
            res.status(200).json({ message: `Deleted ${this.changes} installment(s).` });
        }
    });
});















// Function to fetch data for the next 30 days
function getNext30DaysData() {
    const currentDate = new Date();
    const next30DaysDate = new Date();
    next30DaysDate.setDate(currentDate.getDate() + 30);
    
    const startDate = currentDate.toISOString().split('T')[0];
    const endDate = next30DaysDate.toISOString().split('T')[0];

    const query = `
        SELECT i.installment_id, i.due_date, i.amount AS installment_amount, i.appl_no, 
               a.appl_date, a.name, a.amount, a.email, a.phoneNumber, a.bankName, 
               a.accountNumber, a.MICR, a.ifscCode, a.accountType, a.branchAddress
        FROM installment i
        JOIN applicant a ON i.appl_no = a.appl_no
        WHERE i.due_date BETWEEN ? AND ?
    `;

    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error("Error fetching data:", err.message);
            return;
        }

        if (rows.length > 0) {
            const insertQuery = `
                INSERT INTO today (appl_no, appl_date, name, amount, email, phoneNumber, 
                                   bankName, accountNumber, MICR, ifscCode, accountType, branchAddress, 
                                   installment_id, due_date, installment_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.serialize(() => {
                rows.forEach(row => {
                    db.run(insertQuery, [
                        row.appl_no, row.appl_date, row.name, row.amount, row.email, row.phoneNumber,
                        row.bankName, row.accountNumber, row.MICR, row.ifscCode, row.accountType, row.branchAddress,
                        row.installment_id, row.due_date, row.installment_amount
                    ], (err) => {
                        if (err) console.error("Error inserting data:", err.message);
                    });
                });
            });

            console.log("Today table updated with due installments.");
        } else {
            console.log("No due installments in the next 30 days.");
        }
    });
}

// Schedule this to run daily
getNext30DaysData();

// Cleanup function to delete records older than 60 days
function deleteOldRecords() {
    const deleteQuery = `
        DELETE FROM today 
        WHERE created_at < DATETIME('now', '-60 days');
    `;

    db.run(deleteQuery, (err) => {
        if (err) {
            console.error("Error deleting old records:", err.message);
        } else {
            console.log("Old records deleted successfully.");
        }
    });
}

// API to fetch rows with due_date in the next 30 days
app.get('/api/upcoming-expiry', (req, res) => {
    const query = `
        SELECT * 
        FROM today
        WHERE due_date >= DATE('now') 
          AND due_date <= DATE('now', '+30 days')
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});







// =======================================================================================================================================================================


// Serve pending.html
app.get('/pending', (req, res) => {
    res.sendFile(path.join(__dirname, 'pending.html'));
});

// Function to check if due_date is between today and the next 30 days
function isDueInNext30Days(dueDate) {
    const today = moment();
    const due = moment(dueDate);
    const diff = due.diff(today, 'days');
    return diff >= 0 && diff <= 30;
}

// Fetch installments that are due in the next 30 days
app.get('/fetch-pending-installments', (req, res) => {
    const query = `
        SELECT t.*, i.installment_id, i.due_date, i.amount AS installment_amount
        FROM today t
        JOIN installment i ON t.installment_id = i.installment_id
        WHERE i.due_date BETWEEN ? AND ?
    `;
    
    const startDate = moment().format('YYYY-MM-DD');
    const endDate = moment().add(30, 'days').format('YYYY-MM-DD');
    
    db.all(query, [startDate, endDate], (err, rows) => {
        if (err) {
            console.error('Error fetching pending installments:', err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// Mark installment as paid
app.post('/mark-paid', (req, res) => {
    const { appl_no, installment_id, paid_date } = req.body;

    // First, check if the data already exists in the paid table
    const checkQuery = `SELECT * FROM paided WHERE appl_no = ? AND installment_id = ?`;
    db.get(checkQuery, [appl_no, installment_id], (err, row) => {
        if (err) {
            console.error('Error checking paided table:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            return res.status(400).json({ error: 'This installment has already been marked as paid.' });
        }

        // Insert into the paid table
        const insertQuery = `
            INSERT INTO paided (appl_no, appl_date, name, amount, email, phoneNumber, bankName, accountNumber, 
                                MICR, ifscCode, accountType, branchAddress, installment_id, due_date, installment_amount, paid_date)
            SELECT appl_no, appl_date, name, amount, email, phoneNumber, bankName, accountNumber, MICR, ifscCode,
                   accountType, branchAddress, installment_id, due_date, installment_amount, ?
            FROM today
            WHERE appl_no = ? AND installment_id = ?
        `;

        db.run(insertQuery, [paid_date, appl_no, installment_id], function (err) {
            if (err) {
                console.error('Error inserting data into paid table:', err.message);
                return res.status(500).json({ error: err.message });
            }

            // Delete from the today table after moving to paided
            const deleteQuery = `DELETE FROM today WHERE appl_no = ? AND installment_id = ?`;
            db.run(deleteQuery, [appl_no, installment_id], function (err) {   
                if (err) {
                    console.error('Error deleting from today table:', err.message);
                    return res.status(500).json({ error: err.message });
                }

                res.status(200).json({ message: 'Installment marked as paid and moved to paided table.' });
            });
        });
    });
});





// ======================================================================payment details=========================================================================================


// Handle payment form submission
app.post('/save-payment', upload.any(), (req, res) => {
    const { application_no, name, choose_payment } = req.body;

    if (choose_payment === 'QR') {
        const { transaction_id_1, transaction_id_2, transaction_id_3, screenshot_1, screenshot_2, screenshot_3 } = req.body;

        const qrData = {
            application_no,
            name,
            choose_payment,
            transaction_id_1,
            screenshot_1: screenshot_1 ? req.files.find(file => file.fieldname === 'screenshot_1').path : '',
            transaction_id_2,
            screenshot_2: screenshot_2 ? req.files.find(file => file.fieldname === 'screenshot_2').path : '',
            transaction_id_3,
            screenshot_3: screenshot_3 ? req.files.find(file => file.fieldname === 'screenshot_3').path : ''
        };

        db.run(`INSERT INTO QR (application_no, name, choose_payment, transaction_id_1, screenshot_1, transaction_id_2, screenshot_2, transaction_id_3, screenshot_3) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [qrData.application_no, qrData.name, qrData.choose_payment, qrData.transaction_id_1, qrData.screenshot_1, qrData.transaction_id_2, qrData.screenshot_2, qrData.transaction_id_3, qrData.screenshot_3],
            function (err) {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error saving payment data' });
                } else {
                    res.status(200).json({ success: true, message: 'Payment data saved successfully' });
                }
            });
    }
    // Similarly, handle UPI, IMPS, NEFT, and Cheque logic here
    else if (choose_payment === 'UPI' || choose_payment === 'IMPS' || choose_payment === 'NEFT') {
        const { amount_1, amount_2, amount_3, transaction_id_1, transaction_id_2, transaction_id_3, screenshot_1, screenshot_2, screenshot_3 } = req.body;

        const uinData = {
            application_no,
            name,
            choose_payment,
            amount_1,
            transaction_id_1,
            screenshot_1: screenshot_1 ? req.files.find(file => file.fieldname === 'screenshot_1').path : '',
            amount_2,
            transaction_id_2,
            screenshot_2: screenshot_2 ? req.files.find(file => file.fieldname === 'screenshot_2').path : '',
            amount_3,
            transaction_id_3,
            screenshot_3: screenshot_3 ? req.files.find(file => file.fieldname === 'screenshot_3').path : ''
        };

        db.run(`INSERT INTO UIN (application_no, name, choose_payment, amount_1, transaction_id_1, screenshot_1, amount_2, transaction_id_2, screenshot_2, amount_3, transaction_id_3, screenshot_3) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uinData.application_no, uinData.name, uinData.choose_payment, uinData.amount_1, uinData.transaction_id_1, uinData.screenshot_1, uinData.amount_2, uinData.transaction_id_2, uinData.screenshot_2, uinData.amount_3, uinData.transaction_id_3, uinData.screenshot_3],
            function (err) {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error saving UPI/IMPS/NEFT payment data' });
                } else {
                    res.status(200).json({ success: true, message: 'Payment data saved successfully' });
                }
            });
    }
    // Cheque payment logic here
    else if (choose_payment === 'Cheque') {
        const { ifsc_1, bank_name_1, cheque_date_1, amount_1, ifsc_2, bank_name_2, cheque_date_2, amount_2 } = req.body;

        const chequeData = {
            application_no,
            name,
            choose_payment,
            ifsc_1,
            bank_name_1,
            cheque_date_1,
            amount_1,
            ifsc_2,
            bank_name_2,
            cheque_date_2,
            amount_2
        };

        db.run(`INSERT INTO Cheque (application_no, name, choose_payment, ifsc_1, bank_name_1, cheque_date_1, amount_1, ifsc_2, bank_name_2, cheque_date_2, amount_2) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [chequeData.application_no, chequeData.name, chequeData.choose_payment, chequeData.ifsc_1, chequeData.bank_name_1, chequeData.cheque_date_1, chequeData.amount_1, chequeData.ifsc_2, chequeData.bank_name_2, chequeData.cheque_date_2, chequeData.amount_2],
            function (err) {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error saving cheque payment data' });
                } else {
                    res.status(200).json({ success: true, message: 'Cheque payment data saved successfully' });
                }
            });
    }
});

// ======================================================================installment========================================================



                                                                               



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

 

































