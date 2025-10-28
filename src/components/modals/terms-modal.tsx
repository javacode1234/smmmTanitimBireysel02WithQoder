"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Kullanım Koşulları
          </DialogTitle>
          <DialogDescription>
            Son Güncelleme: 28 Ekim 2024
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">1. Genel Hükümler</h3>
              <p className="text-gray-700 leading-relaxed">
                İşbu Kullanım Koşulları, SMMM Mali Müşavirlik Hizmetleri web sitesi ve sunulan 
                hizmetlerin kullanımına ilişkin şartları belirlemektedir. Sitemizi veya hizmetlerimizi 
                kullanarak, bu koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş 
                olursunuz. Bu koşulları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayınız.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">2. Hizmet Kapsamı</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Firmamız aşağıdaki mali müşavirlik hizmetlerini sunmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Muhasebe kayıt ve raporlama hizmetleri</li>
                <li>Vergi danışmanlığı ve beyan hizmetleri</li>
                <li>SGK işlemleri ve bordro hizmetleri</li>
                <li>Şirket kuruluş danışmanlığı</li>
                <li>Bağımsız denetim ve mali analiz</li>
                <li>Finansal danışmanlık ve planlama</li>
                <li>E-dönüşüm entegrasyon hizmetleri</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">3. Kullanıcı Sorumlulukları</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Hizmetlerimizi kullanırken aşağıdaki yükümlülüklere uymayı kabul edersiniz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Doğru, eksiksiz ve güncel bilgi sağlamak</li>
                <li>Belgelerinizi zamanında ve eksiksiz teslim etmek</li>
                <li>Yasal yükümlülüklerinizi yerine getirmek</li>
                <li>Hizmet bedellerini ödemek</li>
                <li>Gizlilik ve güvenlik kurallarına uymak</li>
                <li>Meslek kuralları ve etik ilkelere saygı göstermek</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">4. Sözleşme ve Ücretlendirme</h3>
              <p className="text-gray-700 leading-relaxed">
                Hizmetlerimiz yazılı sözleşme ile sunulur. Ücretlendirme, işletmenizin büyüklüğü, 
                işlem hacmi ve talep edilen hizmetlere göre belirlenir. Fiyatlar her yıl Ocak ayında 
                ÜFE oranında güncellenebilir. Ödemeler aylık veya yıllık olarak yapılabilir. 
                Sözleşme süresi genellikle 1 yıldır ve otomatik yenilenir. 30 gün önceden yazılı 
                bildirimle sözleşme feshedilebilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">5. Gizlilik ve Veri Güvenliği</h3>
              <p className="text-gray-700 leading-relaxed">
                Müşteri bilgileri ve mali verileri, SMMM meslek kanunu ve KVKK kapsamında 
                gizli tutulur. Verileriniz, yasal zorunluluklar dışında üçüncü taraflarla 
                paylaşılmaz. Tüm veriler şifreli olarak saklanır ve güvenlik protokolleri ile 
                korunur. Çalışanlarımız gizlilik sözleşmesi imzalar ve düzenli güvenlik eğitimleri alır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">6. Fikri Mülkiyet Hakları</h3>
              <p className="text-gray-700 leading-relaxed">
                Web sitemizdeki tüm içerik, logo, tasarım, yazılım ve diğer materyaller firmamızın 
                fikri mülkiyetidir ve telif hakları ile korunmaktadır. İzinsiz kullanım, kopyalama, 
                çoğaltma veya dağıtım yasaktır. Hazırlanan raporlar ve analizler, müşteriye özel 
                olup sadece müşteri tarafından kullanılabilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">7. Sorumluluk Sınırlamaları</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Firmamız aşağıdaki durumlarda sorumluluk kabul etmemektedir:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Müşteri tarafından sağlanan yanlış, eksik veya yanıltıcı bilgilerden kaynaklanan sorunlar</li>
                <li>Belgelerinin geç veya eksik teslimi nedeniyle oluşan yasal yaptırımlar</li>
                <li>Mücbir sebepler (doğal afet, savaş, salgın hastalık vb.)</li>
                <li>Üçüncü taraf hizmet sağlayıcıların hataları</li>
                <li>Resmi kurumların sistem arızaları veya kesintileri</li>
                <li>Müşterinin talimatları doğrultusunda yapılan işlemler</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">8. Hizmet Kesintisi ve İptal</h3>
              <p className="text-gray-700 leading-relaxed">
                Bakım, güncelleme veya teknik sorunlar nedeniyle hizmetlerde geçici kesintiler 
                olabilir. Önemli kesintiler önceden duyurulur. Ödeme yapılmaması veya sözleşme 
                şartlarına uyulmaması durumunda hizmetler askıya alınabilir veya sonlandırılabilir. 
                Sözleşme iptali durumunda, teslim edilmiş belgeler iade edilir ve veri silme talepleri 
                KVKK kapsamında işleme alınır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">9. Yasal Uyumluluk</h3>
              <p className="text-gray-700 leading-relaxed">
                Tüm hizmetlerimiz Türkiye Cumhuriyeti yasalarına uygun olarak sunulur. 
                3568 sayılı SMMM ve YMM Kanunu, Vergi Usul Kanunu, Türk Ticaret Kanunu, 
                İş Kanunu, KVKK ve ilgili diğer mevzuat hükümlerine tam uyum sağlanır. 
                Meslek odası (TÜRMOB) etik kurallarına ve meslek standartlarına uyulur.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">10. Uyuşmazlık Çözümü</h3>
              <p className="text-gray-700 leading-relaxed">
                İşbu Kullanım Koşulları'ndan doğabilecek her türlü uyuşmazlıkta, öncelikle 
                dostane çözüm yolları denenecektir. Çözüme ulaşılamadığı takdirde, 
                İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir. Türk Hukuku uygulanır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">11. İletişim ve Bildirimler</h3>
              <p className="text-gray-700 leading-relaxed">
                Yasal bildirimler ve önemli duyurular, sözleşmede belirtilen e-posta adresine veya 
                yazılı olarak tebligat adresine gönderilir. İletişim bilgilerinizin güncel olması 
                sorumluluğu size aittir. Bildirimler gönderildiği tarihten itibaren 3 iş günü içinde 
                tebliğ edilmiş sayılır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">12. Değişiklikler</h3>
              <p className="text-gray-700 leading-relaxed">
                Bu Kullanım Koşulları'nı gerektiğinde güncelleme hakkımız saklıdır. Önemli 
                değişiklikler web sitesi üzerinden veya e-posta ile duyurulacaktır. Değişiklikler 
                yayınlandıktan sonra hizmetleri kullanmaya devam etmeniz, yeni koşulları kabul 
                ettiğiniz anlamına gelir. Düzenli olarak bu sayfayı kontrol etmeniz önerilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">13. İletişim Bilgileri</h3>
              <p className="text-gray-700 leading-relaxed">
                Kullanım Koşulları hakkında sorularınız için:
              </p>
              <div className="mt-2 text-gray-700">
                <p>E-posta: info@smmm.com</p>
                <p>Telefon: +90 (212) 123 45 67</p>
                <p>Adres: İstanbul, Türkiye</p>
                <p>Çalışma Saatleri: Hafta içi 09:00 - 18:00</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
