# Messenger Clone

A simple Facebook Messenger clone created using HTML, CSS, and JavaScript. This project simulates a basic chat interface and can be hosted on GitHub Pages.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deploying to GitHub Pages](#deploying-to-github-pages)

## Prerequisites

- Node.js installed (download from [nodejs.org](https://nodejs.org/))
- Git installed (download from [git-scm.com](https://git-scm.com/))

## Installation

1. **Create a New Project Directory**
    ```bash
    mkdir messenger-clone
    cd messenger-clone
    ```

2. **Initialize a Node.js Project**
    ```bash
    npm init -y
    ```

3. **Create `index.html`**
    Create an `index.html` file with the following content:
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Messenger Clone</title>
        <link rel="stylesheet" href="styles.css">
    </head>
    <body>
        <div class="chat-container">
            <div class="chat-box" id="chat-box">
                <!-- Chat messages will appear here -->
            </div>
            <div class="chat-input">
                <input type="text" id="message-input" placeholder="Type a message...">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
        <script src="scripts.js"></script>
    </body>
    </html>
    ```

4. **Create `styles.css`**
    Create a `styles.css` file with the following content:
    ```css
    body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #f0f0f0;
    }

    .chat-container {
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        width: 400px;
        max-width: 100%;
    }

    .chat-box {
        height: 300px;
        overflow-y: auto;
        padding: 10px;
        border-bottom: 1px solid #ccc;
    }

    .chat-input {
        display: flex;
        padding: 10px;
    }

    #message-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        padding: 10px 20px;
        margin-left: 10px;
        background-color: #007bff;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }

    .message {
        padding: 8px 12px;
        margin: 5px 0;
        border-radius: 4px;
    }

    .message.user {
        background-color: #007bff;
        color: #fff;
        align-self: flex-end;
    }

    .message.bot {
        background-color: #e0e0e0;
        color: #000;
        align-self: flex-start;
    }
    ```

5. **Create `scripts.js`**
    Create a `scripts.js` file with the following content:
    ```javascript
    document.addEventListener("DOMContentLoaded", function() {
        const chatBox = document.getElementById("chat-box");
        const messageInput = document.getElementById("message-input");

        function appendMessage(content, className) {
            const message = document.createElement("div");
            message.className = `message ${className}`;
            message.textContent = content;
            chatBox.appendChild(message);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        window.sendMessage = function() {
            const message = messageInput.value.trim();
            if (message) {
                appendMessage(message, "user");
                messageInput.value = "";
                setTimeout(() => botResponse(message), 1000);
            }
        };

        function botResponse(userMessage) {
            const botMessage = "This is a simulated response to: " + userMessage;
            appendMessage(botMessage, "bot");
        }
    });
    ```

## Running Locally

Since this project is a static site, you can run it locally without a Node.js server. You can open the `index.html` file directly in your web browser.

Alternatively, you can use a simple HTTP server to serve the files. If you have Python installed, you can run:

```bash
# For Python 3.x
python -m http.server 8000

# For Python 2.x
python -m SimpleHTTPServer 8000
```

## Test it
Then, navigate to http://localhost:8000 in your web browser to see your Messenger clone in action.
