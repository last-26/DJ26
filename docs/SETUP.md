# MuseBot — Kurulum Rehberi

## 1. Sistem Gereksinimleri

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **FFmpeg** — Ses işleme için gerekli
  - **Windows:** [ffmpeg.org](https://ffmpeg.org/download.html) → PATH'e ekle
  - **Linux:** `sudo apt install ffmpeg`
  - **macOS:** `brew install ffmpeg`
- **Build Tools** (native modüller için)
  - **Windows:** `npm install --global windows-build-tools` veya Visual Studio Build Tools
  - **Linux:** `sudo apt install build-essential python3`

## 2. Discord Developer Portal

1. [Discord Developer Portal](https://discord.com/developers/applications) adresine git
2. **"New Application"** tıkla, bir isim ver
3. **Bot** sekmesine git → **"Add Bot"**
4. **Token**'ı kopyala (bu `DISCORD_TOKEN` olacak)
5. **"Reset Token"** tıklayarak yeni token alabilirsin
6. **APPLICATION ID**'yi kopyala (bu `CLIENT_ID` olacak)

### Bot İzinleri

**OAuth2 → URL Generator** sekmesinde:

**Scopes:**
- `bot`
- `applications.commands`

**Bot Permissions:**
- Connect
- Speak
- Send Messages
- Embed Links
- Use Slash Commands

Oluşan URL ile botu sunucuya davet et.

### Privileged Gateway Intents

**Bot** sekmesinde şu intent'leri aç:
- ❌ Presence Intent (gerekli değil)
- ❌ Message Content Intent (gerekli değil)
- ✅ Server Members Intent (opsiyonel)

## 3. Proje Kurulumu

```bash
# Repo'yu klonla
git clone https://github.com/last-26/DJ26.git
cd DJ26

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_test_guild_id_here
DEFAULT_VOLUME=50
INACTIVITY_TIMEOUT=300000
```

> **Not:** `GUILD_ID` belirtilirse komutlar sadece o sunucuya kaydedilir (anında aktif). Boş bırakılırsa global kayıt yapılır (1 saate kadar sürebilir).

## 4. Slash Komutları Kaydet

```bash
node src/deploy-commands.js
```

## 5. Botu Başlat

```bash
# Normal
npm start

# Geliştirme (auto-restart)
npm run dev
```

## 6. Sorun Giderme

### FFmpeg bulunamıyor
```
Error: FFmpeg/avconv not found!
```
FFmpeg'in PATH'e eklendiğinden emin ol. Terminal'de `ffmpeg -version` ile kontrol et.

### @discordjs/opus build hatası
Windows'ta build tools gereklidir. Alternatif olarak `opusscript` kullanabilirsin:
```bash
npm uninstall @discordjs/opus
npm install opusscript
```
> `opusscript` daha yavaş ama pure JS olduğu için build gerektirmez.

### Ses gelmiyor
- FFmpeg kurulu mu?
- Bot ses kanalına bağlı mı?
- Bot'un "Connect" ve "Speak" izinleri var mı?

### Komutlar görünmüyor
- `node src/deploy-commands.js` çalıştırdın mı?
- `CLIENT_ID` doğru mu?
- Global kayıt yaptıysan 1 saat bekle

## 7. VPS'te Deploy (Opsiyonel)

### PM2 ile

```bash
npm install -g pm2
pm2 start src/index.js --name musebot
pm2 save
pm2 startup
```

### Systemd ile (Linux)

```ini
# /etc/systemd/system/musebot.service
[Unit]
Description=MuseBot Discord Music Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/DJ26
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable musebot
sudo systemctl start musebot
```
