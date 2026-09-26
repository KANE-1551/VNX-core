// ===== VNX backend — /api/chat =====
// Tier dasar: terima riwayat pesan dari frontend, panggil Groq, kembalikan balasan.
// Groq API key TIDAK PERNAH dikirim ke frontend — cuma dipanggil di sini (server-side).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages kosong atau tidak valid" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY belum di-set di Environment Variables");
    return res.status(500).json({ error: "Server belum dikonfigurasi" });
  }

  // System prompt — identitas VNX
  const systemPrompt = {
    role: "system",
    content:
      "Kamu adalah VNX, asisten AI yang cepat, jelas, dan langsung ke inti jawaban. " +
      "Jawab dalam bahasa yang sama dengan pertanyaan user. Hindari basa-basi berlebihan.",
  };

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b", // model produksi aktif di Groq (per pengecekan terakhir)
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errText);
      return res.status(502).json({ error: "Gagal menghubungi model AI" });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "(tidak ada balasan)";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
}
