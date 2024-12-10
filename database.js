const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('applicant.db');

// Drop table if exists and then recreate it
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applicant (
        appl_no INTEGER NOT NULL UNIQUE,
        appl_date TEXT NOT NULL,
        name TEXT,
        amount INTEGER,
        gender TEXT,
        materialStatus TEXT,
        educationQualification TEXT,
        email TEXT,
        dateOfBirth TEXT,
        phoneNumber TEXT,
        whatsappNumber TEXT,
        isWhatsapp TEXT,
        father TEXT,
        mother TEXT,
        occupation TEXT,
        designation TEXT,
        natureOfDuties TEXT,
        presentEmployer TEXT,
        lengthOfServiceBusiness TEXT,
        workLocation TEXT,
        annualIncome INTEGER,
        panCardNumber TEXT,
        aadhaarNumber TEXT,
        currentAddress TEXT,
        sameAddress TEXT,
        permanentAddress TEXT,
        pinCode TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        landmark TEXT,
        foreignNational TEXT,
        pepStatus TEXT,
        bankName TEXT,
        accountNumber TEXT,
        MICR TEXT,
        ifscCode TEXT,
        accountType TEXT,
        branchAddress TEXT,
        nomineeName TEXT,
        nomineeDOB TEXT,            
        nomineeGender TEXT,
        nomineeRelationship TEXT,
        nomineePhoneNumber TEXT,
        appointeeName TEXT,
        appointeeRelationship TEXT,
        paymentMode TEXT,  
        planSelection TEXT,
        subscriptionOption TEXT,
        schemeName TEXT,
        tenure TEXT, 
        lockIn TEXT,
        interest TEXT,
        loyaltyBonus TEXT,
        payor_name TEXT,
        payor_relation TEXT,
        payor_phone TEXT,
        payor_email TEXT,
        opt_option TEXT,
        with_name TEXT,
        with_relationship TEXT,
        with_address TEXT,
        with_city TEXT,
        with_state TEXT,
        with_country TEXT,
        with_pincode TEXT,
        with_landmark TEXT,
        terms_accepted BOOLEAN,
        status TEXT DEFAULT 'unpaid',
        agreement_date TEXT
    )`);
    // Create the QR table
    db.run(`
        CREATE TABLE IF NOT EXISTS QR (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_no TEXT,
            name TEXT,
            choose_payment TEXT,
            transaction_id_1 TEXT,
            screenshot_1 TEXT,
            transaction_id_2 TEXT,
            screenshot_2 TEXT,
            transaction_id_3 TEXT,
            screenshot_3 TEXT
        )
    `);

    // Create the UIN table
    db.run(`
        CREATE TABLE IF NOT EXISTS UIN (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_no TEXT,
            name TEXT,
            choose_payment TEXT,
            amount_1 REAL,
            transaction_id_1 TEXT,
            screenshot_1 TEXT,
            amount_2 REAL,
            transaction_id_2 TEXT,
            screenshot_2 TEXT,
            amount_3 REAL,
            transaction_id_3 TEXT,
            screenshot_3 TEXT
        )
    `);

    // Create the Cheque table
    db.run(`
        CREATE TABLE IF NOT EXISTS Cheque (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_no TEXT,
            name TEXT,
            choose_payment TEXT,
            ifsc_1 TEXT,
            bank_name_1 TEXT,
            cheque_date_1 TEXT,
            amount_1 REAL,
            ifsc_2 TEXT,
            bank_name_2 TEXT,
            cheque_date_2 TEXT,
            amount_2 REAL
        )
    `);

    // Create Trigger for QR table
    db.run(`
        CREATE TRIGGER IF NOT EXISTS update_applicant_status_QR
        AFTER INSERT ON QR
        FOR EACH ROW
        BEGIN
            UPDATE applicant
            SET status = 'paid'
            WHERE appl_no = NEW.application_no;
        END;
    `);

    // Create Trigger for UIN table
    db.run(`
        CREATE TRIGGER IF NOT EXISTS update_applicant_status_UIN
        AFTER INSERT ON UIN
        FOR EACH ROW
        BEGIN
            UPDATE applicant
            SET status = 'paid'
            WHERE appl_no = NEW.application_no;
        END;
    `);

    // Create Trigger for Cheque table
    db.run(`
        CREATE TRIGGER IF NOT EXISTS update_applicant_status_Cheque
        AFTER INSERT ON Cheque
        FOR EACH ROW
        BEGIN
            UPDATE applicant
            SET status = 'paid'
            WHERE appl_no = NEW.application_no;
        END;
    `);

    console.log("Tables and triggers created successfully!");



    
});

db.run(`CREATE TABLE IF NOT EXISTS subscription (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_type TEXT NOT NULL,
    no_of_emi INTEGER NOT NULL
)`);




// // Create tables if they don't exist
// db.serialize(() => {
//     db.run(`
//         CREATE TABLE IF NOT EXISTS QR (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             application_no TEXT,
//             name TEXT,
//             choose_payment TEXT,
//             transaction_id_1 TEXT,
//             screenshot_1 TEXT,
//             transaction_id_2 TEXT,
//             screenshot_2 TEXT,
//             transaction_id_3 TEXT,
//             screenshot_3 TEXT
//         )
//     `);

//     db.run(`
//         CREATE TABLE IF NOT EXISTS UIN (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             application_no TEXT,
//             name TEXT,
//             choose_payment TEXT,
//             amount_1 REAL,
//             transaction_id_1 TEXT,
//             screenshot_1 TEXT,
//             amount_2 REAL,
//             transaction_id_2 TEXT,
//             screenshot_2 TEXT,
//             amount_3 REAL,
//             transaction_id_3 TEXT,
//             screenshot_3 TEXT
//         )
//     `);

//     db.run(`
//         CREATE TABLE IF NOT EXISTS Cheque (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             application_no TEXT,
//             name TEXT,
//             choose_payment TEXT,
//             ifsc_1 TEXT,
//             bank_name_1 TEXT,
//             cheque_date_1 TEXT,
//             amount_1 REAL,
//             ifsc_2 TEXT,
//             bank_name_2 TEXT,
//             cheque_date_2 TEXT,
//             amount_2 REAL
//         )
//     `);
// });



db.run(`ALTER TABLE applicant ADD COLUMN from_date TEXT`, (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            // console.log("Column 'from_date' already exists.");
        } else {
            console.error("Error adding 'from_date':", err.message);
        }
    } else {
        console.log("Column 'from_date' added successfully.");
    }
});

db.run(`ALTER TABLE applicant ADD COLUMN expiry_date TEXT`, (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            // console.log("Colu`mn 'expiry_date' already exists.");
        } else {
            console.error("Error adding 'expiry_date':", err.message);
        }
    } else {
        console.log("Column 'expiry_date' added successfully.");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0
    )`);
});









// Create the payments table if it doesn't exist
// db.run(`CREATE TABLE IF NOT EXISTS payments (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     appl_no TEXT NOT NULL,
//     appl_date TEXT NOT NULL,
//     form_name TEXT NOT NULL,
//     form_email TEXT NOT NULL,
//     phoneNumber TEXT NOT NULL,
//     paymentMode TEXT NOT NULL,
//     planSelection TEXT NOT NULL,
//     subscriptionOption TEXT NOT NULL,
//     amount REAL NOT NULL,
//     chosenPaymentMethod TEXT NOT NULL,
//     transactionId TEXT NOT NULL
// )`)


























// db.run(`
//     CREATE TABLE IF NOT EXISTS alldue (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         installment_id TEXT NOT NULL,
//         applicant_id TEXT NOT NULL,
//         due_date TEXT NOT NULL,
//         amount REAL NOT NULL,
//         status TEXT NOT NULL
//     )
// `);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS bank (
        appl_no INTEGER NOT NULL UNIQUE,
        appl_date TEXT NOT NULL,
        name TEXT,
        amount INTEGER,
        gender TEXT,
        materialStatus TEXT,
        educationQualification TEXT,
        email TEXT,
        dateOfBirth TEXT,
        phoneNumber TEXT,
        whatsappNumber TEXT,
        isWhatsapp TEXT,
        father TEXT,
        mother TEXT,
        occupation TEXT,
        designation TEXT,
        natureOfDuties TEXT,
        presentEmployer TEXT,
        lengthOfServiceBusiness TEXT,
        workLocation TEXT,
        annualIncome INTEGER,
        panCardNumber TEXT,
        aadhaarNumber TEXT,
        currentAddress TEXT,
        sameAddress TEXT,
        permanentAddress TEXT,
        pinCode TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        landmark TEXT,
        foreignNational TEXT,
        pepStatus TEXT,
        bankName TEXT,
        accountNumber TEXT,
        MICR TEXT,
        ifscCode TEXT,
        accountType TEXT,
        branchAddress TEXT,
        nomineeName TEXT,
        nomineeDOB TEXT,            
        nomineeGender TEXT,
        nomineeRelationship TEXT,
        nomineePhoneNumber TEXT,
        appointeeName TEXT,
        appointeeRelationship TEXT,
        paymentMode TEXT,  
        planSelection TEXT,
        subscriptionOption TEXT,
        payor_name TEXT,
        payor_relation TEXT,
        payor_phone TEXT,
        payor_email TEXT,
        opt_option TEXT,
        with_name TEXT,
        with_relationship TEXT,
        with_address TEXT,
        with_city TEXT,
        with_state TEXT,
        with_country TEXT,
        with_pincode TEXT,
        with_landmark TEXT,
        terms_accepted BOOLEAN, NEWbankName TEXT,
        NEWaccountNumber TEXT,
        NEWMICR TEXT,
        NEWifscCode TEXT,
        NEWaccountType TEXT,
        NEWbranchAddress TEXT,DATE
    )`);
});



// Add the created_at column to track when the record was inserted
db.run(`CREATE TABLE IF NOT EXISTS today (
    appl_no INTEGER,
    appl_date TEXT,
    name TEXT,
    amount INTEGER,
    email TEXT,
    phoneNumber TEXT,
    bankName TEXT,
    accountNumber TEXT,
    MICR TEXT,
    ifscCode TEXT,
    accountType TEXT,
    branchAddress TEXT,
    installment_id INTEGER,
    due_date TEXT,
    installment_amount INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
)`);



db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS installment (
            installment_id INTEGER,
            applicant_id INTEGER NOT NULL,
            subscription_id INTEGER NOT NULL,
            due_date TEXT NOT NULL,
            amount INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'Unpaid',
            appl_no TEXT NOT NULL,
            paid_date TEXT,
            FOREIGN KEY (applicant_id) REFERENCES applicant(appl_no),
            FOREIGN KEY (subscription_id) REFERENCES subscription(subscription_id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS paided (
            appl_no INTEGER,
            appl_date TEXT,
            name TEXT,
            amount INTEGER,
            email TEXT,
            phoneNumber TEXT,
            bankName TEXT,
            accountNumber TEXT,
            MICR TEXT,
            ifscCode TEXT,
            accountType TEXT,
            branchAddress TEXT,
            installment_id INTEGER,
            due_date TEXT,
            installment_amount INTEGER,
            paid_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TRIGGER IF NOT EXISTS update_installment_status
        AFTER INSERT ON paided
        BEGIN
            UPDATE installment
            SET status = CASE 
                            WHEN NEW.paid_date IS NOT NULL THEN 'Paid'
                            ELSE 'Unpaid'
                        END,
                paid_date = COALESCE(NEW.paid_date, 'Unpaid')
            WHERE appl_no = NEW.appl_no
              AND installment_id = NEW.installment_id;
        END;
    `, (err) => {
        if (err) {
            console.error("Error creating trigger:", err);
        } else {
            console.log("Trigger created successfully.");
        }
    });
});




module.exports = db;
