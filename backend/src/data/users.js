//Base de données temporaire (on remplacera parPostgreSQL ou MySQL plus tars)
const users = [
    {
        id: 1,
        name: "Alice Dupont",
        email: "alice@rh.com",
        password: "$2b$10$iG2XiOTbw1Ge1/BruQQQUea/0reL8ebIpiFFGfWhQMA2gp27VOeiS",
        role: "admin"
    },
    {
        id: 2,
        name: "Bob Martin",
        email: "bob@rh.com",
        password: "$2b$10$iG2XiOTbw1Ge1/BruQQQUea/0reL8ebIpiFFGfWhQMA2gp27VOeiS",
        role: "employee"
    }
];

module.exports = users;