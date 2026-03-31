export default async function handler(req, res) {
  res.status(200);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(
    JSON.stringify({
      status: "ok",
      provider: "groq",
      apiKeyConfigured: Boolean(process.env.GROQ_API_KEY),
    })
  );
}
