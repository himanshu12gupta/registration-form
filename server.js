const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database'); // Include the database connection
const ExcelJS = require('exceljs');


const app = express();
const port = 3006;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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
// app.post('/submit', (req, res) => {
//     const data = req.body;
//     console.log(data);
//     const appl_no = data.Appl_No; // Use the application number from the form
//     const appl_date = data.Appl_date; // Use the application date from the form
//     debugger
//     const query = `INSERT INTO applicant (
//         appl_no, appl_date, name, gender, materialStatus, educationQualification, email, dateOfBirth, phoneNumber,
//         whatsappNumber, father, mother, occupation, designation, natureOfDuties, presentEmployer,
//         lengthOfServiceBusiness, workLocation, annualIncome, panCardNumber, aadhaarNumber, currentAddress, sameAddress,
//         permanentAddress, pinCode, city, state, country, landmark, foreignNational, pepStatus, bankName, accountNumber,
//         MICR, ifscCode, accountType, branchAddress, nomineeName, nomineeDOB, nomineeGender, nomineeRelationship,
//         nomineePhoneNumber, appointeeName, appointeeRelationship, paymentMode, planSelection, subscriptionOption, 
//         payor_name, payor_relation, payor_phone, payor_email, opt_option, with_name, with_relationship, 
//         with_address, with_city, with_state, with_country, with_pincode, with_landmark, terms_accepted
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const params = [
//         appl_no, appl_date, data.name, data.gender, data.materialStatus, data.educationQualification, data.email,
//         data.dateOfBirth, data.phoneNumber, data.whatsappNumber, data.father, data.mother, data.occupation, data.designation,
//         data.natureOfDuties, data.presentEmployer, data.lengthOfServiceBusiness, data.workLocation, data.annualIncome,
//         data.panCardNumber, data.aadhaarNumber, data.currentAddress, data.sameAddress, data.permanentAddress, data.pinCode,
//         data.city, data.state, data.country, data.landmark, data.foreignNational, data.pepStatus, data.bankName,
//         data.accountNumber, data.MICR, data.ifscCode, data.accountType, data.branchAddress, data.nomineeName, data.nomineeDOB,
//         data.nomineeGender, data.nomineeRelationship, data.nomineePhoneNumber, data.appointeeName, data.appointeeRelationship,
//         data.paymentMode, data.planSelection, data.subscriptionOption, data.payor_name, data.payor_relation, 
//         data.payor_phone, data.payor_email, data.opt_option, data.with_name, data.with_relationship, data.with_address, 
//         data.with_city, data.with_state, data.with_country, data.with_pincode, data.with_landmark, true
//     ];

//     db.run(query, params, function(err) {
//         if (err) {
//             console.error('Error inserting data:', err.message);
//             return res.status(500).json({ error: err.message });
//         }
//         console.log('Data inserted successfully');
//         res.status(200).json({ message: 'Form submitted successfully!' });
//     });
// });


app.post('/submit', (req, res) => {
    const data = req.body;
    console.log(data);
    const appl_no = data.Appl_No;
    const appl_date = data.Appl_date;

    const query = `INSERT INTO applicant (
        appl_no, appl_date, name, gender, materialStatus, educationQualification, email, dateOfBirth, phoneNumber,
        whatsappNumber, isWhatsapp, father, mother, occupation, designation, natureOfDuties
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        appl_no, appl_date, data.name, data.gender, data.materialStatus, data.educationQualification, data.email,
        data.dateOfBirth, data.phoneNumber, data.whatsappNumber,data.whatsappSame, data.father, data.mother, data.occupation, data.designation,
        data.natureOfDuties
    ];

    db.run(query, params, function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Data inserted successfully');
        res.status(200).json({ message: 'Form submitted successfully!' });
    });
});

// Fetch all applicants
app.get('/applicants', (req, res) => {
    db.all('SELECT * FROM applicant', [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.sendFile(path.join(__dirname, 'public', 'applicants.html'));
    });
});

app.get('/api/applicants', (req, res) => {
    db.all('SELECT * FROM applicant', [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

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
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
