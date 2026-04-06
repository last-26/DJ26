# 🎵 MuseBot — Discord Music Bot

## Project Overview

**MuseBot** — Kendi Discord sunucularında çalışan, YouTube ve Spotify destekli gelişmiş bir müzik botu. Kullanıcılar şarkı ismi, YouTube linki veya Spotify linki ile müzik çalabilir. Bot, Spotify linklerini otomatik olarak YouTube üzerinden eşleştirip çalar.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Runtime | Node.js 20+ |
| Bot Framework | discord.js v14 |
| Müzik Engine | discord-player v6 |
| YouTube Extraction | @discord-player/extractor + youtube-ext |
| Spotify Metadata | spotify-url-info (scraping, API key gerektirmez) |
| Ses Bağlantısı | @discordjs/voice, @discordjs/opus |
| Ortam Değişkenleri | dotenv |
| Dil | JavaScript (ESM — "type": "module") |
| Linting | ESLint (opsiyonel) |

---

## Proje Yapısı

```
musebot/
├── CLAUDE.md
├── package.json
├── .env                      # Token ve config (git'e eklenmez)
├── .env.example              # Örnek env dosyası
├── .gitignore
├── src/
│   ├── index.js              # Ana entry point — client oluşturma, login
│   ├── config.js             # ENV okuma, sabitler, embed renkleri
│   ├── deploy-commands.js    # Slash command'ları Discord API'ye kaydet
│   ├── bot/
│   │   ├── client.js         # Discord Client ve discord-player setup
│   │   └── events.js         # Bot eventleri (ready, interactionCreate)
│   ├── commands/
│   │   ├── play.js           # /play <query|url> — Ana çalma komutu
│   │   ├── skip.js           # /skip — Şarkı atlama
│   │   ├── stop.js           # /stop — Durdur ve kanaldan çık
│   │   ├── pause.js          # /pause — Duraklatma
│   │   ├── resume.js         # /resume — Devam ettirme
│   │   ├── queue.js          # /queue — Kuyruk listesi (sayfalı)
│   │   ├── nowplaying.js     # /nowplaying — Şu an çalan şarkı
│   │   ├── volume.js         # /volume <1-100> — Ses seviyesi
│   │   ├── shuffle.js        # /shuffle — Kuyruğu karıştır
│   │   ├── loop.js           # /loop <off|track|queue> — Tekrar modu
│   │   ├── seek.js           # /seek <seconds> — Şarkıda ileri/geri sar
│   │   ├── remove.js         # /remove <position> — Kuyruktan kaldır
│   │   ├── clear.js          # /clear — Kuyruğu temizle
│   │   ├── lyrics.js         # /lyrics — Şarkı sözleri (genius-lyrics)
│   │   └── help.js           # /help — Tüm komutların listesi
│   ├── player/
│   │   ├── setup.js          # discord-player Player instance oluşturma ve extractor kayıt
│   │   ├── events.js         # Player eventleri (trackStart, error, emptyQueue vb.)
│   │   └── resolvers.js      # Spotify → YouTube çözümleme mantığı
│   ├── utils/
│   │   ├── embed.js          # Standart embed builder helper'ları
│   │   ├── formatTime.js     # Süre formatlama (ms → 3:45)
│   │   ├── progressBar.js    # Şarkı ilerleme çubuğu ASCII art
│   │   └── logger.js         # Renkli konsol logger (chalk)
│   └── constants/
│       └── emojis.js         # Kullanılan emoji sabitleri
└── docs/
    └── SETUP.md              # Kurulum ve deploy rehberi
```

---

## Temel Özellikler ve Gereksinimler

### 1. Müzik Çalma (`/play`)

Bu botun en kritik ve gelişmiş komutu. Akıllı bir input parser'a sahip olmalı:

```
/play <query>
```

**Input Türleri ve Davranışlar:**

| Input | Davranış |
|-------|----------|
| `şarkı ismi` | YouTube'da arama yap, en alakalı sonucu çal |
| `şarkı ismi - sanatçı` | YouTube'da daha isabetli arama |
| YouTube video URL | Direkt çal |
| YouTube playlist URL | Tüm playlist'i kuyruğa ekle |
| Spotify track URL | Spotify'dan metadata al → YouTube'da "sanatçı - şarkı adı" ara → çal |
| Spotify playlist URL | Tüm şarkıları sırayla YouTube'da bul ve kuyruğa ekle |
| Spotify album URL | Tüm şarkıları sırayla YouTube'da bul ve kuyruğa ekle |

**Spotify → YouTube Çözümleme Algoritması (`resolvers.js`):**

```
1. Spotify URL'den track metadata çek (spotify-url-info):
   → track.name, track.artist, track.duration_ms

2. YouTube arama query'si oluştur:
   → `${artist} - ${trackName} official audio`
   → Eğer sonuç yoksa fallback: `${artist} ${trackName}`
   → Eğer hâlâ yoksa: `${trackName} audio`

3. YouTube sonuçlarını filtrele:
   → Süre farkı 30 saniyeden az olanı tercih et
   → "cover", "remix", "live", "karaoke" içerenleri düşür (orijinal isteniyorsa)
   → Verified artist kanalından geleni tercih et
   → En yüksek view count + en yakın süreyi skorla

4. Eşleşen track'i queue'ya ekle
```

**Playlist İşleme:**
- Spotify playlist'lerinde 100+ şarkı olabilir → batch processing yap
- İlk şarkıyı hemen çalmaya başla, geri kalanını arka planda resolve et
- Her 5 şarkıda bir progress embed'i güncelle: "23/57 şarkı eklendi..."
- Hata veren track'leri atla, sonunda özet ver: "54/57 şarkı eklendi, 3 bulunamadı"

### 2. Kuyruk Sistemi (`/queue`)

- Sayfalı embed (10 şarkı/sayfa)
- Her şarkının süresi ve ekleyen kullanıcı gösterilir
- Toplam kuyruk süresi footer'da
- Button ile sayfa navigasyonu (⬅️ ➡️)
- Şu an çalan şarkı en üstte vurgulanır

### 3. Now Playing (`/nowplaying`)

Zengin embed ile şu an çalan şarkıyı göster:

```
🎵 Now Playing
━━━━━━━━━━━━━━━━━━━━
Title: Bohemian Rhapsody
Artist: Queen
Duration: advancement ▶ 2:34 / 5:55
Progress: ████████░░░░░░░ 43%

Requested by: @Samet
Source: YouTube
━━━━━━━━━━━━━━━━━━━━
```

- Thumbnail (YouTube video thumbnail'i) embed'e eklenir
- Progress bar güncellenmez (statik snapshot), ama `/nowplaying` tekrar çalıştırılınca güncel gösterir

### 4. Ses Kontrolü (`/volume`)

- 1-100 arası değer
- Varsayılan: 50
- Sunucu bazlı ayar (farklı sunucularda farklı volume)

### 5. Loop Modları (`/loop`)

- `off` — Tekrar yok
- `track` — Aynı şarkıyı tekrarla
- `queue` — Kuyruk bitince baştan başla

### 6. Lyrics (`/lyrics`)

- genius-lyrics paketi ile şarkı sözlerini çek
- Uzun sözleri 2000 karakter limiti nedeniyle sayfalara böl
- Bulunamazsa "Şarkı sözleri bulunamadı" mesajı

---

## Player Event Handling (`player/events.js`)

Aşağıdaki eventleri dinle ve uygun embed mesajları gönder:

| Event | Davranış |
|-------|----------|
| `playerStart` | "🎵 Now playing: ..." embed'i gönder |
| `audioTrackAdd` | "✅ Kuyruğa eklendi: ..." embed'i gönder |
| `audioTracksAdd` | "✅ {n} şarkı kuyruğa eklendi" |
| `playerSkip` | Sonraki şarkının embed'ini göster |
| `emptyQueue` | "📭 Kuyruk bitti, kanaldan ayrılıyorum" (5 dk inaktivite sonrası) |
| `emptyChannel` | Ses kanalı boşalınca otomatik ayrıl |
| `playerError` | Hata mesajı embed'i + loglama |
| `error` | Genel hata yakalama, graceful recovery |

**Inaktivite Timeout:**
- Kuyruk bittiğinde 5 dakika bekle
- 5 dakika içinde yeni şarkı eklenmezse kanaldan ayrıl
- Ayrılırken "👋 İnaktivite nedeniyle ayrıldım" mesajı gönder

---

## Discord Client Setup (`bot/client.js`)

```javascript
// Gerekli intent'ler:
- GatewayIntentBits.Guilds
- GatewayIntentBits.GuildVoiceStates
- GatewayIntentBits.GuildMessages
```

---

## Slash Command Yapısı

Tüm komutlar slash command olarak implement edilecek (prefix command yok). Her komut dosyası şu yapıda export eder:

```javascript
export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Şarkı çal veya kuyruğa ekle')
    .addStringOption(opt =>
      opt.setName('query')
        .setDescription('Şarkı adı, YouTube URL veya Spotify URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    // ...
  }
};
```

**Command Registration (`deploy-commands.js`):**
- `src/commands/` klasöründeki tüm dosyaları otomatik oku
- REST API ile guild-specific veya global olarak kaydet
- `node src/deploy-commands.js` ile çalıştırılır

---

## Embed Tasarım Standartları (`utils/embed.js`)

Tüm botun tutarlı görünümü için helper fonksiyonlar:

```javascript
// Renk paleti
const COLORS = {
  PRIMARY: 0x1DB954,    // Spotify yeşili — ana renk
  ERROR: 0xFF4444,      // Kırmızı
  WARNING: 0xFFAA00,    // Turuncu
  INFO: 0x5865F2,       // Discord blurple
  SUCCESS: 0x57F287     // Yeşil
};

// Helper fonksiyonlar
createTrackEmbed(track, requestedBy)    // Şarkı embed'i
createQueueEmbed(queue, page)           // Kuyruk embed'i
createErrorEmbed(message)              // Hata embed'i
createSuccessEmbed(message)            // Başarı embed'i
createNowPlayingEmbed(track, queue)    // Now playing embed'i
```

Her embed'de:
- Bot adı ve ikonu footer'da
- Timestamp
- İlgili thumbnail
- Tutarlı renk kodlaması

---

## Hata Yönetimi

### Kullanıcı Hataları
- Ses kanalında değilken `/play` → "❌ Önce bir ses kanalına katılmalısın!"
- Boş kuyrukta `/skip` → "❌ Çalan bir şarkı yok!"
- Geçersiz URL → "❌ Geçersiz URL. YouTube veya Spotify linki girin."
- Bulunamayan şarkı → "❌ Bu şarkı YouTube'da bulunamadı."

### Sistem Hataları
- YouTube extraction hatası → Loglama + kullanıcıya bilgi
- Rate limiting → Retry mekanizması (3 deneme, exponential backoff)
- Voice connection drop → Otomatik reconnect denemesi

---

## Environment Variables (`.env`)

```env
# Discord Bot Token (Discord Developer Portal'dan al)
DISCORD_TOKEN=your_bot_token_here

# Discord Application ID
CLIENT_ID=your_client_id_here

# Opsiyonel: Geliştirme sunucusu (komutları hızlı kaydetmek için)
GUILD_ID=your_test_guild_id_here

# Varsayılan ses seviyesi (1-100)
DEFAULT_VOLUME=50

# İnaktivite timeout (ms)
INACTIVITY_TIMEOUT=300000
```

---

## Kurulum Adımları (`docs/SETUP.md`)

Şu adımları anlatan bir rehber oluştur:

1. **Discord Developer Portal:**
   - https://discord.com/developers/applications adresinde yeni uygulama oluştur
   - Bot sekmesinden "Add Bot"
   - Token'ı kopyala
   - OAuth2 → URL Generator → scopes: `bot`, `applications.commands`
   - Bot permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Oluşan URL ile botu sunucuya davet et

2. **Proje Kurulumu:**
   ```bash
   git clone <repo>
   cd musebot
   npm install
   cp .env.example .env
   # .env dosyasını düzenle
   node src/deploy-commands.js
   node src/index.js
   ```

3. **Sistem Gereksinimleri:**
   - Node.js 20+
   - FFmpeg (ses işleme için — `sudo apt install ffmpeg` veya Windows'ta PATH'e ekle)
   - Build tools (node-gyp, @discordjs/opus native build için)

---

## package.json Başlangıç

```json
{
  "name": "musebot",
  "version": "1.0.0",
  "description": "Discord music bot with YouTube & Spotify support",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "deploy": "node src/deploy-commands.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "discord.js": "^14.16.x",
    "discord-player": "^6.7.x",
    "@discord-player/extractor": "^4.5.x",
    "@discordjs/voice": "^0.17.x",
    "@discordjs/opus": "^0.9.x",
    "youtube-ext": "^1.1.x",
    "spotify-url-info": "^3.2.x",
    "genius-lyrics": "^4.4.x",
    "dotenv": "^16.4.x",
    "chalk": "^5.3.x"
  }
}
```

---

## Kodlama Standartları

- **ES Modules** kullan (`import/export`, `"type": "module"`)
- **async/await** kullan, callback kullanma
- Her fonksiyona JSDoc yorum ekle
- Console.log yerine `logger.js` kullan (info, warn, error seviyeleri)
- Hardcoded string yok — tüm mesajlar `constants/` altında veya embed helper'larında
- Her komut kendi dosyasında, tek sorumluluk prensibi
- Error handling: her `execute()` fonksiyonunda try-catch
- Interaction'lara `deferReply()` ile başla (arama uzun sürebilir)

---

## Geliştirme Öncelikleri

Sırayla implement et:

1. **Faz 1 — Temel Altyapı:**
   - Proje yapısı ve package.json
   - Client setup, event handling, command loader
   - deploy-commands.js
   - `/play` komutu (sadece YouTube URL ve arama)
   - `/stop`, `/skip`, `/pause`, `/resume`
   - Player event handling

2. **Faz 2 — Spotify Entegrasyonu:**
   - Spotify URL parser (track, playlist, album)
   - Spotify → YouTube resolver algoritması
   - Playlist batch processing

3. **Faz 3 — Kuyruk ve UX:**
   - `/queue` (sayfalı, button navigasyonlu)
   - `/nowplaying` (progress bar, detaylı embed)
   - `/volume`, `/loop`, `/shuffle`
   - `/seek`, `/remove`, `/clear`

4. **Faz 4 — Polish:**
   - `/lyrics`
   - `/help`
   - Hata mesajları iyileştirme
   - Inaktivite timeout
   - `docs/SETUP.md`

---

## Kritik Notlar

- `discord-player` v6 ile `@discord-player/extractor` beraber kullanılır. `player.extractors.loadDefault()` ile default extractor'ları yükle.
- Spotify API key **gerekmez** — `spotify-url-info` paketi scraping yapar.
- FFmpeg **şart** — yoksa ses çalmaz. Kurulum dokümanında belirt.
- YouTube bazen rate limit uygular — aynı anda çok fazla arama yapma, playlist'lerde araya 200ms delay koy.
- Bot sadece kendi bulunduğu ses kanalında çalar — başka kanaldan gelen komutları "Aynı ses kanalında olmalısın" ile reddet.
- Slash command'lar guild-specific kayıtta anında aktif olur, global kayıtta 1 saate kadar sürebilir.
- `@discordjs/opus` native build gerektirir. Windows'ta `npm install --global windows-build-tools` gerekebilir. Alternatif: `opusscript` (daha yavaş ama pure JS).
