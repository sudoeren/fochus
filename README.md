<div align="center">
  <img src="public/logo.svg" alt="Fochus Logo" width="120">
  <h1>Fochus</h1>
  <p>Üretkenliğinizi ve Odaklanma Sürenizi Yönetin</p>
</div>

<div align="center">

![Sürüm](https://img.shields.io/badge/sürüm-1.0.0-blue.svg?style=for-the-badge)
![Lisans](https://img.shields.io/badge/lisans-MIT-green.svg?style=for-the-badge)
![Durum](https://img.shields.io/badge/durum-aktif-success.svg?style=for-the-badge)

</div>

<p align="center">
  <strong>Fochus</strong>, düzenli ve odaklanmış kalmanıza yardımcı olmak için tasarlanmış modern, hepsi bir arada bir kişisel üretkenlik paketidir. Görev yönetimini, not almayı ve Pomodoro zamanlayıcıyı tek, şık ve sezgisel bir arayüzde birleştirir.
</p>

<p align="center">
  <strong>Geliştirici:</strong> Eren Çakar
</p>

<div align="center">

[Özellikler](#özellikler) •
[Teknolojiler](#teknolojiler) •
[Kurulum](#kurulum) •
[Lisans](#lisans)

</div>

---

## Uygulama Önizlemesi

Fochus, göz yormayan karanlık mod ve ferah aydınlık mod seçenekleriyle gelir. Tercihinize göre sistem temasını veya manuel seçimi kullanabilirsiniz.

### Aydınlık ve Karanlık Mod

<div align="center">
  <img src="screenshot_dark.png" alt="Fochus Karanlık Mod" width="100%" style="border-radius: 10px; margin-bottom: 20px;">
  <br>
  <em>Şık ve odaklanmayı artıran Karanlık Mod</em>
  <br><br>
  <img src="screenshot_light.png" alt="Fochus Aydınlık Mod" width="100%" style="border-radius: 10px;">
  <br>
  <em>Temiz ve ferah Aydınlık Mod</em>
</div>

---

## Spotlight: Her Şey Elinizin Altında

Uygulama içinde kaybolmayın! **Spotlight** özelliği (`Ctrl + K` veya `Cmd + K`) ile notlarınıza, görevlerinize ve ayarlara saniyeler içinde ulaşın.

<div align="center">
  <img src="spotlight_dark.png" alt="Spotlight Arama Özelliği" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
</div>

---

## Özellikler

Fochus, kullanıcı deneyimi ve verimlilik odaklı olarak geliştirilmiştir.

### Akıllı Notlar
*   **Zengin Metin Editörü:** Notlarınızı biçimlendirin, detaylandırın.
*   **Sabitleme & Organizasyon:** Önemli notları en üstte tutun.
*   **Çöp Kutusu Sistemi:** Silinen notları güvenle geri yükleyin veya kalıcı olarak silin.
*   **Görev Entegrasyonu:** Notlarınızı doğrudan görevlerinizle ilişkilendirin.

### Gelişmiş Görev Yönetimi
*   **Özel Listeler:** Görevleri proje bazlı listelere ayırın ve renk kodları kullanın.
*   **Tekrarlanan Görevler:** Günlük, haftalık veya aylık rutinler oluşturun.
*   **Sürükle & Bırak:** `@hello-pangea/dnd` ile görevleri kolayca sıralayın.
*   **Alt Görevler:** Karmaşık işleri yönetilebilir küçük parçalara bölün.
*   **Akıllı Durumlar:** Bekleyen, Tamamlanan veya Ertelenen işleri takip edin.

### Entegre Pomodoro Zamanlayıcı
*   **Odak Modları:** Çalışma, Kısa Mola ve Uzun Mola için yerleşik zamanlayıcı.
*   **Oturum Takibi:** Üretkenlik geçmişinizi izlemek için oturumları otomatik kaydedin.
*   **Dikkat Dağıtmayan Arayüz:** Akışta kalmanız için sadeleştirilmiş görünüm.

---

## Teknolojiler

Performans ve ölçeklenebilirlik için en modern web teknolojileri ile geliştirildi.

### Frontend (Önyüz)
| Teknoloji | Açıklama |
| --- | --- |
| ![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB) | Kullanıcı arayüzü kütüphanesi. |
| ![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat&logo=vite&logoColor=white) | Yeni nesil frontend araç seti. |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) | Tip güvenliği sağlayan JavaScript süperseti. |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Utility-first CSS çatısı. |
| **Lucide React** | Tutarlı ve güzel ikon seti. |

### Backend (Arka Uç)
| Teknoloji | Açıklama |
| --- | --- |
| ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) | Chrome V8 motoru üzerine kurulu JS çalışma zamanı. |
| ![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) | Hızlı, minimalist web çatısı. |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | Yeni nesil Node.js ve TypeScript ORM'i. |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) | Dünyanın en gelişmiş açık kaynaklı ilişkisel veritabanı. |
| **Zod** | TypeScript uyumlu şema doğrulama kütüphanesi. |

### Altyapı
*   **Docker & Docker Compose:** Kolay kurulum ve dağıtım için konteynerizasyon.
*   **Nginx:** Statik dosyaları sunmak ve reverse proxy işlemleri için.

---

## Kurulum

Projeyi çalıştırmak için **Docker** (önerilen) veya manuel kurulum yöntemlerini kullanabilirsiniz.

### Ön Gereksinimler

*   [Node.js](https://nodejs.org/) (v18 veya üzeri)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop)
*   [Git](https://git-scm.com/)

### Seçenek 1: Docker ile Hızlı Kurulum (Önerilen)

1.  **Depoyu klonlayın**
    ```bash
    git clone https://github.com/kullaniciadi/fochus.git
    cd fochus
    ```

2.  **Ortam Değişkenlerini Ayarlayın**
    Örnek dosyaları kopyalayın:
    ```bash
    cp .env.example .env
    cp backend/.env.example backend/.env
    ```
    
    > ⚠️ **Önemli Güvenlik Uyarısı:**
    > `.env` dosyalarını oluşturduktan sonra, özellikle `JWT_SECRET` değerini tahmin edilmesi zor, rastgele bir karakter dizisiyle **mutlaka değiştirin**. Varsayılan değerler sadece geliştirme ortamı içindir.

3.  **Uygulamayı Başlatın**
    ```bash
    docker-compose up -d --build
    ```
    Uygulama `http://localhost:5173` adresinde çalışmaya başlayacaktır.

### Seçenek 2: Manuel Kurulum

#### Backend Kurulumu
1.  Backend klasörüne gidin:
    ```bash
    cd backend
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Veritabanını oluşturun ve `backend/.env` dosyasındaki `DATABASE_URL` ayarını yapın.
4.  Migration'ları çalıştırın:
    ```bash
    npx prisma migrate dev
    ```
5.  Sunucuyu başlatın:
    ```bash
    npm run dev
    ```

#### Frontend Kurulumu
1.  Yeni bir terminal açın ve ana dizine dönün:
    ```bash
    cd ..
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

---

## Proje Yapısı

```bash
fochus/
├── backend/                # Express API & Veritabanı mantığı
│   ├── prisma/            # Veritabanı şeması & migrationlar
│   ├── src/
│   │   ├── middleware/    # Kimlik doğrulama & Hata yönetimi
│   │   ├── routes/        # API Rotaları (Auth, Notes, Tasks vb.)
│   │   └── index.ts       # Sunucu giriş noktası
│   └── ...
├── src/                    # Frontend React Uygulaması
│   ├── components/        # Tekrar kullanılabilir UI bileşenleri
│   ├── hooks/             # Özel React hook'ları
│   ├── pages/             # Uygulama sayfaları/rotaları
│   ├── services/          # API servis katmanı
│   └── ...
├── docker-compose.yml      # Konteyner orkestrasyonu
└── ...
```

---

## Lisans

MIT Lisansı altında dağıtılmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

---

<div align="center">
  <p><strong>Eren Çakar</strong> tarafından geliştirildi</p>
</div>