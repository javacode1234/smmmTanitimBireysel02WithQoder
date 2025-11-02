"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PrivacyPolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gizlilik Politikası
          </DialogTitle>
          <DialogDescription>
            Son Güncelleme: 28 Ekim 2024
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">1. Giriş</h3>
              <p className="text-gray-700 leading-relaxed">
                Bu Gizlilik Politikası, SMMM Mali Müşavirlik Hizmetleri ("Biz", "Bizim") olarak, 
                müşterilerimizin ve web sitemizi ziyaret edenlerin kişisel verilerinin nasıl toplandığını, 
                kullanıldığını, saklandığını ve korunduğunu açıklamaktadır. Hizmetlerimizi kullanarak, 
                bu politikada belirtilen uygulamaları kabul etmiş olursunuz.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">2. Toplanan Bilgiler</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Hizmetlerimizi sunabilmek için aşağıdaki bilgileri toplayabiliriz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Kimlik bilgileri (ad, soyad, T.C. kimlik numarası)</li>
                <li>İletişim bilgileri (e-posta adresi, telefon numarası, adres)</li>
                <li>Finansal bilgiler (banka hesap bilgileri, vergi numarası)</li>
                <li>Şirket bilgileri (unvan, faaliyet konusu, vergi dairesi)</li>
                <li>Teknik veriler (IP adresi, çerez bilgileri, tarayıcı türü)</li>
                <li>Kullanım verileri (site ziyaret istatistikleri, sayfa görüntülemeleri)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">3. Bilgilerin Kullanım Amaçları</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Topladığımız kişisel verilerinizi aşağıdaki amaçlarla kullanırız:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Mali müşavirlik hizmetlerinin sağlanması</li>
                <li>Muhasebe, vergi ve finansal danışmanlık işlemlerinin yürütülmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
                <li>Müşteri memnuniyetinin artırılması</li>
                <li>İletişim ve bilgilendirme faaliyetleri</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">4. Bilgilerin Paylaşımı</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Kişisel verileriniz, aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Yasal zorunluluklar (vergi dairesi, SGK, mahkeme kararları)</li>
                <li>Resmi kurum ve kuruluşlarla zorunlu bilgi paylaşımları</li>
                <li>Hizmet sağlayıcılar (bulut depolama, yazılım hizmetleri)</li>
                <li>Açık rızanızın bulunduğu durumlar</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">5. Veri Güvenliği</h3>
              <p className="text-gray-700 leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri 
                kullanıyoruz. Verileriniz 256-bit SSL şifreleme ile korunur. Fiziksel, elektronik ve 
                idari güvenlik tedbirleri ile yetkisiz erişim, kullanım veya ifşaya karşı korunmaktadır. 
                Tüm çalışanlarımız gizlilik sözleşmesi imzalamıştır ve düzenli güvenlik eğitimleri almaktadır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">6. Veri Saklama Süresi</h3>
              <p className="text-gray-700 leading-relaxed">
                Kişisel verileriniz, hizmet sözleşmesi süresince ve yasal saklama yükümlülükleri 
                (Vergi Usul Kanunu'na göre 10 yıl) boyunca saklanır. Saklama süresinin sonunda 
                verileriniz güvenli bir şekilde silinir veya anonim hale getirilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">7. Çerezler (Cookies)</h3>
              <p className="text-gray-700 leading-relaxed">
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
                Çerezler, tarayıcınız tarafından cihazınızda saklanan küçük metin dosyalarıdır. 
                Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak, çerezleri 
                devre dışı bırakmanız durumunda bazı site özellikleri düzgün çalışmayabilir.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">8. Haklarınız</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                KVKK kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
                <li>Verilerin silinmesini veya yok edilmesini talep etme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle 
                aleyhinize bir sonuç doğması durumunda itiraz etme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">9. İletişim</h3>
              <p className="text-gray-700 leading-relaxed">
                Gizlilik politikamız hakkında sorularınız veya talepleriniz için bizimle iletişime 
                geçebilirsiniz:
              </p>
              <div className="mt-2 text-gray-700">
                <p>E-posta: info@smmm.com</p>
                <p>Telefon: +90 (212) 123 45 67</p>
                <p>Adres: İstanbul, Türkiye</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">10. Politika Değişiklikleri</h3>
              <p className="text-gray-700 leading-relaxed">
                Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler 
                olduğunda, web sitemiz üzerinden veya e-posta yoluyla bilgilendirileceksiniz. 
                Değişikliklerin yürürlüğe girmesinden sonra hizmetlerimizi kullanmaya devam etmeniz, 
                güncellenmiş politikayı kabul ettiğiniz anlamına gelir.
              </p>
            </section>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Kapat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}