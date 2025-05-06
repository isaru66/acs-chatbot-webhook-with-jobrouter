const customer_info = {
    accountNumber: "6677889900",
    accountType: "Savings",
    balance: 375000.75,
    address: {
        street: "5 Kaosan St",
        city: "Bangkok",
        state: "Bangkok",
        zipCode: "10110",
        country: "Thailand"
    },
    lastTransaction: {
        date: "2025-05-01", 
        amount: -2000.00,
        description: "ATM Withdrawal"
    },
    accountStatus: "Active", // Status of the account (e.g., Active, Inactive, Closed)
    loanDetails: {
        loanType: "Home Loan",
        outstandingAmount: 1150000.00,
        nextPaymentAmount: 45000.00,
        paymentFrequency: "Monthly",
        nextPaymentDueDate: "2025-06-01"
    },
    creditScore: 750,
    preferredContactMethod: "WebChat",
};

export default customer_info;