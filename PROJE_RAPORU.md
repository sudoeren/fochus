# Fokus - Kişisel Üretkenlik Asistanı

**Fokus**, modern web teknolojileri ile geliştirilmiş, tamamen tarayıcı tabanlı çalışan, hızlı ve güvenli bir kişisel üretkenlik uygulamasıdır. Notlarınızı, görevlerinizi ve haftalık planlarınızı tek bir yerden, şık ve odaklanmış bir arayüzle yönetmenizi sağlar.

## 🚀 Temel Özellikler

### 1. Modern Web Mimarisi
*   **Electron Bağımlılığı Yok:** Tamamen web standartlarına uygun hale getirildi. Herhangi bir statik sunucuda çalışabilir.
*   **LocalStorage Veri Yönetimi:** Verileriniz asla sunuculara gönderilmez. Tamamen tarayıcınızın yerel hafızasında (LocalStorage) güvenle saklanır.
*   **Performans Odaklı:** React ve Vite ile ışık hızında açılış ve tepki süreleri.

### 2. Gelişmiş Kullanıcı Arayüzü (UI/UX)
*   **True Dark Mode:** OLED ekranlar ve gece kullanımı için optimize edilmiş, tam siyah ve gri tonlarının mükemmel uyumu.
*   **Yenilenmiş Sidebar:** 
    *   Manuel açılıp kapanabilen (Toggle) yapı.
    *   Entegre Tema Değiştirici (Açık/Koyu/Sistem).
    *   Hızlı erişim butonları.
*   **Action-Oriented Dashboard:**
    *   Sadece istatistik değil, eylem odaklı "Komuta Merkezi".
    *   Günün öncelikli görevleri, yaklaşan takvim ve odak kartları.

### 3. Modüller

#### 📝 Notlar
*   Rich Text (Zengin Metin) editörü ile detaylı notlar alın.
*   Önemli notları sabitleyin.
*   Etiketleme sistemi (Gelecek özellik için altyapı hazır).
*   Masonry Grid yerleşimi ile estetik görünüm.

#### ✅ Görevler (Tasks)
*   **Kanban/Liste Hibrit Görünümü:** Görevlerinizi listelere ayırın.
*   **Sürükle & Bırak:** Görevleri listeler arasında veya sıralamada kolayca taşıyın.
*   **Detaylı Planlama:** Tarih, hatırlatıcı ve öncelik seviyesi belirleyin.

#### 📅 Haftalık Planlayıcı
*   Haftanızı kuş bakışı görün.
*   Hangi gün ne kadar yükünüz olduğunu analiz edin.

#### 🔍 Spotlight (Hızlı Arama)
*   **Ctrl + K** (veya Sidebar butonu) ile her yerden erişim.
*   Uygulama içinde gezinme (Navigasyon).
*   Hızlı komutlar (Yeni Not, Yeni Görev).

## 🛠️ Teknolojik Altyapı

Bu proje aşağıdaki modern teknolojiler kullanılarak geliştirilmiştir:

*   **Frontend Framework:** React 18
*   **Build Tool:** Vite
*   **Dil:** TypeScript
*   **Stil:** Tailwind CSS
*   **İkon Seti:** Lucide React
*   **Drag & Drop:** @hello-pangea/dnd
*   **Veri Saklama:** Custom Storage Service (LocalStorage Wrapper)

## 📦 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için:

1.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```

2.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```

3.  Üretime hazır sürüm oluşturun:
    ```bash
    npm run build
    ```

## 🔐 Gizlilik ve Güvenlik

Fokus, **Offline-First** prensibiyle tasarlanmıştır. 
*   Verileriniz tarayıcınızdan dışarı çıkmaz.
*   Üyelik veya giriş yapma gerektirmez.
*   Çerez (Cookie) takibi yapmaz.

---
*Geliştirici: Fokus Team*
*Sürüm: 1.0.0 (Web Edition)*
