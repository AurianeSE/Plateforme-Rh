const leaves = [
  {
    id: 1,
    employeeId: 2,
    employeeName: "Bob Martin",
    type: "Congé annuel",
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    days: 5,
    reason: "Vacances en famille",
    status: "en attente",
    createdAt: "2026-04-01"
  },
  {
    id: 2,
    employeeId: 3,
    employeeName: "Sara Koné",
    type: "Congé maladie",
    startDate: "2026-04-05",
    endDate: "2026-04-07",
    days: 2,
    reason: "Consultation médicale",
    status: "approuvé",
    createdAt: "2026-04-02"
  },
  {
    id: 3,
    employeeId: 4,
    employeeName: "Marc Lebrun",
    type: "Congé exceptionnel",
    startDate: "2026-04-20",
    endDate: "2026-04-21",
    days: 1,
    reason: "Mariage",
    status: "rejeté",
    createdAt: "2026-04-01"
  }
];

module.exports = leaves;