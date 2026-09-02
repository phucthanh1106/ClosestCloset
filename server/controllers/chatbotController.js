export const sendMessage = async (req, res) => {
    try {
        const response = await fetch(`${process.env.CHATBOT_URL}/chatbot-api/messages`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                cookie: req.headers.cookie || ""
            },
            body: JSON.stringify(req.body),
        });

        res.status(response.status).json(await response.json());
    } catch (error) {
        res.status(502).json({ error: "Chatbot unavailable" });
    }
}