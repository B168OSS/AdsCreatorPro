import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dns from "dns";

// Setup Node DNS to prefer IPv4 (helps stability on sandboxes)
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory simulated Database for IP validation & user registration
interface SimulatedUser {
  username: string;
  email: string;
  password?: string;
  simulatedIp: string;
  registeredAt: string;
}

const simulatedUsers: SimulatedUser[] = [
  {
    username: "afiliator_master",
    email: "afiliator@gmail.com",
    simulatedIp: "192.168.1.100",
    registeredAt: "2026-05-20T10:00:00.000Z",
  },
  {
    username: "cantika_ads",
    email: "cantika@gmail.com",
    simulatedIp: "192.168.1.101",
    registeredAt: "2026-05-24T14:30:00.000Z",
  },
];

// Lazy-initialization helper for Gemini SDK
let aiClient: GoogleGenAI | null = null;
let isGeminiLeakedOrFailed = false;

function getGeminiClient(): GoogleGenAI | null {
  if (isGeminiLeakedOrFailed) {
    return null;
  }
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Helper to generate template-based fallbacks for ultra-fast/offline use
function generateFallbackPrompts(
  desc: string,
  style: string,
  angle: string,
  voice: string,
  intonation: string,
  marketplace: string,
  affiliateId: string,
  isTruncated: boolean
) {
  const stepsData = [
    {
      stage: 1,
      stageName: "Adegan 1: The Viral Hook",
      imagePrompt: `A dramatic, high-contrast visual of ${desc}, highlighting its unique texture in a ${style} aesthetic. Photographed from a steep ${angle} angle, featuring rich cinematic side-lighting, hyper-detailed surface details, and a misty, minimalist background studio setup.`,
      caption: `🔥 JANGAN SKIP! Ini dia rahasia produk viral yang lagi dicari semua orang. Cek langsung keasliannya di bawah ini! 👇 #affiliate`,
      affiliateLink: `https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_99"}`,
      videoPrompt: `Camera begins with an ultra-close-up macro rotation of ${desc}. Intense ${angle} sweeping motion, lighting shifting dramatically to create a sense of mystery and instant hook in the first 2 seconds.`,
      voScript: "Stlh sekian lama mencari.. akhirnya aku ketemu barang ajaib ini! Dijamin bikin kalian geleng-geleng kepala karena se-bermanfaat itu!",
      ttsSetting: `Voice: ${voice} (Intonasi: ${intonation}) | Speed: 1.1x`
    },
    {
      stage: 2,
      stageName: "Adegan 2: Contextual Build-up",
      imagePrompt: `A lifestyle-infused shot depicting how ${desc} fits seamlessly into modern, aesthetic daily routines. ${style} design, using warm natural light from a window, captured in an elegant interior setting with ${angle} perspective to present cozy vibes.`,
      caption: `Gak nyangka banget, benda sekecil ini bisa mengubah produktivitas harian berlipat ganda! Kuliah atau kerja jadi makin seru. ✨`,
      affiliateLink: `https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_99"}`,
      videoPrompt: `Hand reaches out in slow-motion, showcasing the user-friendly design of ${desc}. Medium shot with a subtle ${angle} depth-of-field blur, warm color grading.`,
      voScript: "Dulu sebelum pakai ini, rasanya hari-hariku ribet banget. Tapi setelah coba ini seminggu.. wah bener-bener game changer!",
      ttsSetting: `Voice: ${voice} (Intonasi: ${intonation}) | Speed: 1.0x`
    },
    {
      stage: 3,
      stageName: "Adegan 3: Narrative Development",
      imagePrompt: `An exploded-view or extreme macro details of ${desc} showcasing premium craftsmanship and exceptional build quality. Rendered in clean ${style} design, captured from a precise ${angle} point-of-view, high visual fidelity.`,
      caption: `Bahan premium, kokoh, dan yang paling penting ramah di dompet. Simak fiturnya yang gokil ini! No abal-abal ya guys! ❤️`,
      affiliateLink: `https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_99"}`,
      videoPrompt: `Quick cut montage: focus on detailed corners, clicking elements, or action points of ${desc}. Smooth slider track from a cool ${angle} vantage point.`,
      voScript: "Lihat deh presisi materialnya, bener-bener solid! Kualitas bintang lima tapi harganya bersahabat banget untuk kantong affiliate.",
      ttsSetting: `Voice: ${voice} (Intonasi: ${intonation}) | Speed: 1.05x`
    },
    {
      stage: 4,
      stageName: "Adegan 4: Climax & Hero Reveal",
      imagePrompt: `The ultimate hero shot of ${desc} surrounded by abstract geometric neon lines or energetic element splashes, emphasizing action and peak performance. Striking ${style} look, shot from a heroic ${angle} angle, masterpiece level.`,
      caption: `⚠️ WARNING: Bakal nyesel kalau kelewatan diskon gila-gilaan plus cashback hari ini. Klaim voucher gratis ongkir sekarang!`,
      affiliateLink: `https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_99"}`,
      videoPrompt: `Dramatic slow-motion splash or neon glow reveal of ${desc}. Fast zoom out to classic ${angle} presentation, high energy sound effect cues.`,
      voScript: "Tunggu apa lagi? Ini momen terbaik buat kamu upgrade peralatan harianmu dengan promo diskon gila-gilaan!",
      ttsSetting: `Voice: ${voice} (Intonasi: ${intonation}) | Speed: 1.1x`
    },
    {
      stage: 5,
      stageName: "Adegan 5: Emotional Resolution",
      imagePrompt: `A peaceful, clutter-free desk setting displaying ${desc} in its final perfect spot, glowing with a soft ambient aura. Minimalist layout with an empty text negative space. Professional ${style} styling, clean balanced frame.`,
      caption: `Belinya gampang tinggal klik tautan di bio/deskripsi ini ya. Yuk samaan sama aku, mumpung stock masih ready! 🛒👇`,
      affiliateLink: `https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_99"}`,
      videoPrompt: `Smooth crane-down and fade out, lingering on the elegant design of ${desc} with a subtle layout text space appearing on-screen.`,
      voScript: "Klik sekarang di link bio atau tautan di bawah ini ya! Jangan sampai kehabisan kuota diskon flash-sale hari ini!",
      ttsSetting: `Voice: ${voice} (Intonasi: ${intonation}) | Speed: 0.95x`
    },
  ];

  return isTruncated ? [stepsData[0]] : stepsData;
}


// --- API ROUTES ---

app.get("/api/engine-status", (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ engine: "Local Studio Active", message: "offline_missing" });
  }
  if (isGeminiLeakedOrFailed) {
    return res.json({ engine: "Local Studio Active", message: "offline_leaked" });
  }
  return res.json({ engine: "Gemini Online", message: "online_active" });
});

// get current simulated IP address and list of items
app.get("/api/ip", (req, res) => {
  // Return a simulation IP
  res.json({ ip: "192.168.1.120" });
});

// Authentication System
app.post("/api/register", (req, res) => {
  const { username, email, password, simulatedIp } = req.body;

  if (!username || username.length < 4) {
    return res.status(400).json({ error: "Username minimal 4 karakter!" });
  }
  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ error: "Email wajib menggunakan @gmail.com!" });
  }
  if (!password || password.length < 5) {
    return res.status(400).json({ error: "Password minimal 5 karakter!" });
  }

  // Check duplicate
  const exists = simulatedUsers.some((u) => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Username sudah terdaftar!" });
  }

  const newUser: SimulatedUser = {
    username,
    email,
    password,
    simulatedIp: simulatedIp || "192.168.1.120",
    registeredAt: new Date().toISOString(),
  };

  simulatedUsers.push(newUser);
  res.json({ success: true, user: { username, email, simulatedIp: newUser.simulatedIp, isGuest: false, isAdmin: false } });
});

app.post("/api/login", (req, res) => {
  const { username, password, simulatedIp } = req.body;

  const user = simulatedUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Username atau Password salah!" });
  }

  // IP Validation
  if (user.simulatedIp !== simulatedIp) {
    return res.status(403).json({
      error: `🚫 LOGIN DITOLAK: IP Address '${simulatedIp}' tidak dikenali. Akses hanya diijinkan dari IP terdaftar '${user.simulatedIp}'.`,
    });
  }

  res.json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      simulatedIp: user.simulatedIp,
      isGuest: false,
      isAdmin: user.username === "dev_admin",
    },
  });
});

// Admin-backdoor initializer
app.post("/api/dev_admin_init", (req, res) => {
  // Pre-seed an admin account instantly if requested
  const adminUser = simulatedUsers.find((u) => u.username === "dev_admin");
  if (!adminUser) {
    simulatedUsers.push({
      username: "dev_admin",
      email: "admin@gmail.com",
      password: "admin_secure_pass",
      simulatedIp: "127.0.0.1",
      registeredAt: new Date().toISOString(),
    });
  }
  res.json({
    success: true,
    message: "Admin Backdoor Initialized",
    credentials: {
      username: "dev_admin",
      password: "admin_secure_pass",
      simulatedIp: "127.0.0.1",
    },
  });
});

app.get("/api/admin/users", (req, res) => {
  // Returns raw simulated list
  res.json(simulatedUsers);
});

// Prompt Generator Engine
app.post("/api/generate-prompt", async (req, res) => {
  const {
    productDescription,
    style,
    angle,
    voVoice,
    voIntonation,
    marketplace,
    affiliateId,
    role, // 'guest' or 'member'
  } = req.body;

  const isTruncated = role === "guest";
  const desc = productDescription || "Produk Affiliate";

  const ai = getGeminiClient();
  let apiWarning: string | null = null;
  let steps = null;

  if (ai) {
    try {
      const promptInstruction = `Anda adalah Direktur Kreatif Periklanan Sinematik dan Ahli Pembuat Konten Affiliate.
Buat skenario iklan produk dalam ${isTruncated ? "1 adegan (Adegan 1: The Viral Hook)" : "5 adegan bersambung (linier dari Adegan 1 sampai 5)"} untuk produk: "${desc}".

Gaya Style Visual: ${style}
Gaya Angle Kamera: ${angle}
Suara Voice Over (VO): ${voVoice}
Intonasi Voice Over: ${voIntonation}
Marketplace Sasaran: ${marketplace}
Affiliate ID: ${affiliateId || "global_promo_100"}

Buat output dalam format JSON valid berupa Array of Objects sesuai schema di bawah. Pastikan JSON bersih tanpa tambahan teks penjelasan lainnya.

Contoh format JSON (sesuaikan isinya secara kreatif dan menarik sesuai parameter di atas):
[
  {
    "stage": 1,
    "stageName": "Adegan 1: The Viral Hook",
    "imagePrompt": "Deskripsi detail gambar dalam bahasa Inggris profesional untuk generator DALL-E/Midjourney yang artistik dan menangkap produk secara menonjol...",
    "caption": "Teks promo persuasif bahasa Indonesia untuk TikTok/Instagram dengan tagar...",
    "affiliateLink": "https://link.${marketplace.toLowerCase().replace(/\s+/g, '')}.co.id/${affiliateId || "global_promo_100"}",
    "videoPrompt": "Instruksi visual pergerakan kamera (gerakan kamera, fisika, cahaya) dalam bahasa Inggris...",
    "voScript": "Naskah skrip narasi teks pendek berbahasa Indonesia yang dibaca pengisi suara sesuai gaya...",
    "ttsSetting": "Voice: ${voVoice} | Intonasi: ${voIntonation}"
  }
]
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptInstruction,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      let parsed = JSON.parse(responseText.trim());

      // Ensure output is indeed array of steps
      if (Array.isArray(parsed) && parsed.length > 0) {
        steps = parsed;
      }
    } catch (err: any) {
      console.error("Gemini invocation failed, rolling back to offline high-fidelity generator:", err);
      const errMsg = err?.message || String(err);
      const errString = JSON.stringify(err) || "";
      
      const isLeakedOrBlocked = 
        errMsg.includes("leaked") || 
        errMsg.includes("PE_KEY") || 
        errMsg.includes("403") || 
        errMsg.includes("PERMISSION_DENIED") ||
        errString.includes("leaked") || 
        errString.includes("403") || 
        errString.includes("PERMISSION_DENIED") ||
        err?.status === 403 ||
        err?.status === "PERMISSION_DENIED" ||
        err?.statusCode === 403;

      if (isLeakedOrBlocked) {
        isGeminiLeakedOrFailed = true;
        apiWarning = "Gemini API Key reported as leaked/invalid by Google. Using high-fidelity local studio rendering engine instead.";
      } else {
        apiWarning = "Gemini API unavailable. Using high-fidelity local studio rendering engine instead.";
      }
    }
  } else {
    apiWarning = "No Gemini API Key supplied in environment. System automatically switched to offline high-fidelity generator.";
  }

  if (!steps) {
    steps = generateFallbackPrompts(
      desc,
      style,
      angle,
      voVoice,
      voIntonation,
      marketplace,
      affiliateId,
      isTruncated
    );
  }

  res.json({ steps, isTruncated, apiWarning });
});

// Express + Vite production static asset server delivery
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server AdsCreator Pro running on port ${PORT}`);
  });
};

startServer();
