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
        terms_accepted BOOLEAN
    )`);
});

db.run(`CREATE TABLE IF NOT EXISTS subscription (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_type TEXT NOT NULL,
    no_of_emi INTEGER NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS installment (
    installment_id INTEGER ,
    applicant_id INTEGER NOT NULL,
    subscription_id INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (applicant_id) REFERENCES applicant(appl_no),
    FOREIGN KEY (subscription_id) REFERENCES subscription(subscription_id)
)`);

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















// Create the payments table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_number TEXT,
            application_date TEXT,
            name TEXT,
            email TEXT,
            phone_number TEXT,
            payment_mode TEXT,
            plan_selected TEXT,
            subscription_option TEXT,
            amount TEXT,
            transaction_id TEXT,
            screenshot BLOB
        )
    `);
});










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

db.run(`
   CREATE TABLE IF NOT EXISTS alldue (
    installment_id INTEGER,
    applicant_id INTEGER UNIQUE,
    due_date DATE,
    due_amount REAL,
    status TEXT,
    appl_no INTEGER,
    name TEXT,
    email TEXT,
    phoneNumber TEXT,
    amount REAL,
    paymentMode TEXT,
    planSelection TEXT,
    subscriptionOption TEXT,
    bankName TEXT,
    accountNumber TEXT,
    MICR TEXT,
    ifscCode TEXT,
    accountType TEXT,
    branchAddress TEXT,
    FOREIGN KEY (applicant_id) REFERENCES applicant(appl_no)
    )
`);












// Create 'pending' table if not exists
db.run(`
    CREATE TABLE IF NOT EXISTS pending (
      appl_no INTEGER,
      name TEXT,
      email TEXT,
      phoneNumber TEXT,
      amount REAL,
      paymentMode TEXT,
      planSelection TEXT,
      subscriptionOption TEXT,
      installment_id INTEGER,
      due_date DATE,
      due_amount REAL,
      bankName TEXT,
      accountNumber TEXT,
      MICR TEXT,
      ifscCode TEXT,
      accountType TEXT,
      branchAddress TEXT,
      status TEXT,
      paymentDate DATE,
      FOREIGN KEY (appl_no) REFERENCES applicant(appl_no)
    )
  `);
  
  db.run(`CREATE TABLE IF NOT EXISTS installment_payment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    installment_id INTEGER NOT NULL,
    payment_date TEXT NOT NULL,
    amount REAL NOT NULL,
    FOREIGN KEY (installment_id) REFERENCES alldue(installment_id)
)`);








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






module.exports = db;
