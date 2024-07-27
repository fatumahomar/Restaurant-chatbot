const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

// Session setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for orders
let orderHistory = {};
let currentOrder = {};

// Define menu items
const menuItems = {
    1: "Burger",
    2: "Pizza",
    3: "Pasta",
    4: "Salad",
    5: "Soda"
};

// Helper function to get menu as string
function getMenu() {
    let menuStr = "Please select an item to order:\n";
    for (let key in menuItems) {
        menuStr += `${key}. ${menuItems[key]}\n`;
    }
    return menuStr;
}

// Route to handle chat interactions
app.post('/chatbot', (req, res) => {
    let userInput = req.body.message;
    let deviceId = req.sessionID;

    if (!orderHistory[deviceId]) {
        orderHistory[deviceId] = [];
        currentOrder[deviceId] = [];
    }

    let response = "";

    switch (userInput) {
        case "1":
            response = getMenu();
            break;
        case "99":
            if (currentOrder[deviceId].length > 0) {
                orderHistory[deviceId].push(currentOrder[deviceId]);
                currentOrder[deviceId] = [];
                response = "Order placed. Type 1 to place a new order.";
            } else {
                response = "No order to place. Type 1 to place a new order.";
            }
            break;
        case "98":
            response = `Order History: ${JSON.stringify(orderHistory[deviceId])}`;
            break;
        case "97":
            response = `Current Order: ${JSON.stringify(currentOrder[deviceId])}`;
            break;
        case "0":
            currentOrder[deviceId] = [];
            response = "Order canceled. Type 1 to place a new order.";
            break;
        default:
            let items = userInput.split(',').map(item => item.trim());
            let validItems = items.filter(item => menuItems[item]);
            if (validItems.length > 0) {
                validItems.forEach(item => currentOrder[deviceId].push(menuItems[item]));
                response = `${validItems.map(item => menuItems[item]).join(', ')} added to your order.\nType 99 to checkout, 97 to see current order, or 0 to cancel the order.`;
            } else {
                response = "Invalid option. Please try again.";
            }
            break;
    }

    res.send({ message: response });
});

// Serve the chat interface
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Restaurant chatbot listening at http://localhost:${port}`);
});

