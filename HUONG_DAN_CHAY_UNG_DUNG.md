# 🚀 Hướng Dẫn Chạy Ứng Dụng Part-time Pal

## 1. Khởi động ứng dụng (Development)

### Bước 1: Mở Terminal/Command Prompt
Điều hướng đến thư mục dự án:
```bash
cd c:\Users\maiti\OneDrive\Desktop\DevFest\Hackathon
```

### Bước 2: Chạy lệnh
```bash
npm run dev
```

### Bước 3: Mở ứng dụng
Sau khi thấy thông báo:
```
➜  Local:   http://localhost:3000/
```

**Chọn 1 trong 2 cách:**

**Cách A - Tự động:**
- Nhấn `o` + `Enter` trong terminal → Trình duyệt sẽ tự mở

**Cách B - Thủ công:**
- Mở trình duyệt (Chrome/Edge/Firefox)
- Truy cập: `http://localhost:3000`

---

## 2. Về Chứng Chỉ An Toàn (SSL/HTTPS)

### ✅ Môi trường Development (Local)

**KHÔNG CẦN HTTPS!**
- `http://localhost:3000` là **hoàn toàn an toàn** khi chạy trên máy cá nhân
- Trình duyệt tin tưởng `localhost` mà không cần SSL certificate
- Đây là cách chuẩn để phát triển ứng dụng web

### ⚠️ Nếu trình duyệt có cảnh báo

Các cảnh báo phổ biến và cách xử lý:

#### **Cảnh báo về Vị trí (Geolocation)**
```
"Part-time Pal muốn biết vị trí của bạn"
```
- ✅ **Nhấn "Cho phép" (Allow)** → Ứng dụng tìm việc gần bạn
- ❌ **Nhấn "Chặn" (Block)** → Vẫn dùng được nhưng phải nhập địa điểm thủ công

#### **Cảnh báo về Clipboard**
```
"Muốn truy cập clipboard"
```
- Chỉ xuất hiện khi bạn nhấn nút "Sao chép" trong ứng dụng
- ✅ **Nhấn "Cho phép"** để dùng tính năng copy nhanh

### 🌐 Nếu muốn chia sẻ cho người khác trong LAN

Sử dụng địa chỉ Network (đã hiển thị trong terminal):
```
➜  Network: http://10.40.0.19:3000/
```

**Lưu ý:**
- Máy khác phải cùng mạng WiFi/LAN
- Có thể cần tắt Firewall tạm thời

---

## 3. Deploy Production (Khi cần HTTPS thật sự)

### A. Deploy lên Vercel (Khuyến nghị - Miễn phí)

#### Bước 1: Cài Vercel CLI
```bash
npm install -g vercel
```

#### Bước 2: Login
```bash
vercel login
```

#### Bước 3: Deploy
```bash
vercel
```

#### Bước 4: Production Deploy
```bash
vercel --prod
```

**Kết quả:**
- Vercel tự động cấp **HTTPS certificate miễn phí**
- URL: `https://your-app.vercel.app`
- Auto-renew certificate

### B. Deploy lên Netlify (Thay thế)

#### Bước 1: Build ứng dụng
```bash
npm run build
```

#### Bước 2: Cài Netlify CLI
```bash
npm install -g netlify-cli
```

#### Bước 3: Deploy
```bash
netlify deploy --prod --dir=dist
```

**Kết quả:**
- SSL certificate tự động từ Let's Encrypt
- URL: `https://your-app.netlify.app`

### C. Tự host với HTTPS

Nếu muốn host riêng, cần:

1. **Domain name** (mua từ Namecheap, GoDaddy...)
2. **SSL Certificate** - Chọn 1 trong 3:
   - **Let's Encrypt** (Miễn phí, tự động)
   - **Cloudflare** (Miễn phí + CDN)
   - **ZeroSSL** (Miễn phí)

3. **Cài đặt SSL với Nginx** (ví dụ):
```bash
# Cài Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Lấy certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 4. Troubleshooting

### Lỗi: "Port 3000 is already in use"

**Giải pháp 1:** Tìm và đóng process
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Hoặc đổi port
```

**Giải pháp 2:** Đổi port trong `vite.config.ts`
```typescript
export default defineConfig({
  server: {
    port: 3001  // Đổi sang port khác
  }
})
```

### Lỗi: "Module not found"
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: TypeScript compile error
```bash
# Đã fix bằng cách cài @types/react
npm install --save-dev @types/react @types/react-dom
```

---

## 5. Các lệnh hữu ích

```bash
# Khởi động development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Kiểm tra lỗi TypeScript
npx tsc --noEmit

# Format code
npx prettier --write "**/*.{ts,tsx,js,jsx,json}"
```

---

## 6. Cấu hình nâng cao (Tùy chọn)

### Bật HTTPS trên localhost (Không khuyến nghị cho dev)

Nếu thực sự cần HTTPS local (ví dụ: test PWA, Service Worker), thêm vào `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./cert/localhost-key.pem'),
      cert: fs.readFileSync('./cert/localhost.pem'),
    },
    port: 3000
  }
});
```

Sau đó tạo self-signed certificate:
```bash
# Cài mkcert
choco install mkcert  # Windows
# brew install mkcert  # macOS
# apt install mkcert   # Linux

# Tạo certificate
mkcert -install
mkdir cert
cd cert
mkcert localhost 127.0.0.1 ::1
```

**Lưu ý:** Chỉ dùng khi thực sự cần, không cần thiết cho dev thường!

---

## 7. Checklist trước khi Deploy

- [ ] Test tất cả tính năng
- [ ] Không có console error
- [ ] Build thành công (`npm run build`)
- [ ] Test production build (`npm run preview`)
- [ ] Thêm `.env.example` với các biến môi trường cần thiết
- [ ] Cập nhật README.md
- [ ] Git commit & push
- [ ] Deploy lên Vercel/Netlify

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) để xem lỗi
2. Xem file `CAI_TIEN_UNG_DUNG.md` về các tính năng
3. Google search error message
4. Hỏi ChatGPT/Claude với error log đầy đủ

**Chúc bạn phát triển ứng dụng thành công! 🎉**
