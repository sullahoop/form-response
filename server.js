import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/form-response", (req, res) => {
    console.log("구글폼 응답 도착:");
    console.log(req.body);

    res.status(200).json({ ok: true });
});

app.get("/", (req, res) => {
    res.send("Google Form webhook server is running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});