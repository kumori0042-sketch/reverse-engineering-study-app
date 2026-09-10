import { put, list } from "@vercel/blob";

// POST: 피드백 저장 (Blob에 영구 저장). GET ?key=ADMIN_KEY: 관리자 조회용 요약.
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { type, email, message, price } = req.body || {};
    if (!type) {
      res.status(400).json({ error: "type이 필요해요." });
      return;
    }
    const record = {
      type,
      email: (email || "").slice(0, 200),
      message: (message || "").slice(0, 500),
      price: price || null,
      ts: new Date().toISOString()
    };
    const filename = `feedback/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
    await put(filename, JSON.stringify(record), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false
    });
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === "GET") {
    if (!req.query.key || req.query.key !== process.env.ADMIN_KEY) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    const { blobs } = await list({ prefix: "feedback/" });
    const records = await Promise.all(
      blobs.map(async (b) => {
        try {
          const r = await fetch(b.url);
          return await r.json();
        } catch (e) {
          return null;
        }
      })
    );
    res.status(200).json({ count: records.filter(Boolean).length, records: records.filter(Boolean) });
    return;
  }

  res.status(405).json({ error: "허용되지 않은 메서드입니다." });
}
