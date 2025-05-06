const service_info = {
  "ServicePolicy": {
    "StandardBranches": {
      "Location": "Standalone bank offices",
      "OperatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "OperatingHours": "08:30 - 17:00",
      "Notes": "For Saturday and Sunday, please suggest customer to go to branch in DepartmentStore or Shopping Mall."
    },
    "DepartmentStore": {
      "Location": "Inside DepartmentStore or Shopping Mall",
      "OperatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "OperatingHours": "10:00 - 22:00",
      "Notes": "Operating hours may vary by location; it's advisable to check with the specific branch."
    },
    "GeneralNotes": {
      "ATM_and_Digital_Services": "Available 24/7",
      "PublicHolidays": "All branches closed",
      "ServiceAvailability": "Some services may be limited depending on location and day"
    }
  },
  "AvaliableServices": {
    "BillPayment": {
      "CounterServices": [
        "Deposit services",
        "Payment services",
      ],
      "PaymentServiceProviders": [
        "Lotus",
        "Thailand Post"
      ],
      "DepositServiceProviders": [
        "Big C",
        "Lotus"
      ]
    },
    "Cards": {
      "DebitCards": {
        "Name": " all free debit card",
        "Features": [
          "Fee-free cash withdrawals, money transfers, payments, and top-ups at any ATM nationwide",
          "2.5% foreign exchange charge waiver for overseas spending"
        ]
      },
      "CreditCards": {
        "Travel": {
          "TargetAudience": "Frequent travelers and online shoppers",
          "Features": [
            "Earn 1 point per 20 THB spent",
            "2X points on online spending",
            "1% foreign exchange fee",
            "2 free airport lounge visits/year",
            "Travel accident insurance up to 16 million THB",
            "0% installment for 3 months on purchases over 1,000 THB"
          ]
        },
        "Exclusive": {
          "TargetAudience": "High-net-worth individuals",
          "Features": [
            "Exclusive privileges and premium financial services"
          ]
        }
      }
    },
    "DigitalBanking": {
      "MobileApp": {
        "Features": [
          "Account management",
          "Transaction services",
          "Access to various banking services"
        ]
      }
    },
    "SavingsAndDepositAccounts": {
      "AllFreeAccount": {
        "Features": [
          "No account opening fee",
          "Free transactions",
          "Accident insurance coverage when maintaining a minimum balance"
        ]
      },
      "BasicAccount": {
        "Features": [
          "No account opening fee",
          "No minimum deposit requirement",
          "Flexible financial transactions"
        ]
      }
    },
    "LoanServices": {
      "HomeLoan": {
        "Purpose": "Purchase of new or pre-owned homes and condominiums",
        "LoanAmount": "Up to 100% of property value or a maximum of 50 million THB",
        "InterestRate": "Starting from 4.939% to 6.648% per annum",
        "RepaymentTerm": "Up to 35 years",
        "AdditionalBenefits": [
          "Free collateral appraisal fee",
          "Free fire insurance premium"
        ]
      }, 
      "PersonalLoan": {
        "Purpose": "Manage major expenses with a lump-sum loan",
        "LoanAmount": "Up to 5 times the monthly income or a maximum of 15 million THB",
        "RepaymentTerm": "Up to 60 months"
      }
    }
  }
};
export default service_info;