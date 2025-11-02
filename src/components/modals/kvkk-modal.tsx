"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface KVKKModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KVKKModal({ open, onOpenChange }: KVKKModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Kişisel Verilerin Korunması (KVKK) Aydınlatma Metni
          </DialogTitle>
          <DialogDescription>
            6698 Sayılı Kişisel Verilerin Korunması Kanunu
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">1. Veri Sorumlusu</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; 
                veri sorumlusu olarak SMMM Mali Müşavirlik Hizmetleri tarafından aşağıda açıklanan 
                kapsamda işlenebilecektir.
              </p>
              <div className="mt-2 text-gray-700 bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold">Veri Sorumlusu:</p>
                <p>SMMM Mali Müşavirlik Hizmetleri</p>
                <p>Adres: İstanbul, Türkiye</p>
                <p>E-posta: kvkk@smmm.com</p>
                <p>Telefon: +90 (212) 123 45 67</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mb-3">
                <li>Web sitesi üzerinden yapılan başvurular ve iletişim formları</li>
                <li>E-posta, telefon veya fiziksel ortamda iletilen belgeler</li>
                <li>Sözleşme imzalama sürecinde alınan bilgiler</li>
                <li>Hizmet sunumu sırasında oluşan veriler</li>
                <li>Resmi kurumlardan alınan bilgiler</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-2">
                KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki hukuki sebeplere dayanarak 
                kişisel verileriniz işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Açık rızanızın bulunması</li>
                <li>Sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması</li>
                <li>Kanunlarda açıkça öngörülmesi (Vergi Usul Kanunu, SGK mevzuatı vb.)</li>
                <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması</li>
                <li>Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması</li>
                <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, 
                veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">3. İşlenen Kişisel Veriler</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Aşağıdaki kategorilerdeki kişisel verileriniz işlenebilmektedir:
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">Kimlik Bilgileri:</p>
                  <p className="text-gray-700">Ad, soyad, T.C. kimlik numarası, doğum tarihi, nüfus cüzdanı bilgileri</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">İletişim Bilgileri:</p>
                  <p className="text-gray-700">Telefon numarası, e-posta adresi, adres bilgileri</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">Finansal Bilgiler:</p>
                  <p className="text-gray-700">Banka hesap bilgileri, IBAN, vergi numarası, gelir belgeleri</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">Mesleki Bilgiler:</p>
                  <p className="text-gray-700">Çalışma durumu, şirket unvanı, faaliyet konusu, ticaret sicil bilgileri</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">İşlem Güvenliği Bilgileri:</p>
                  <p className="text-gray-700">IP adresi, çerez kayıtları, log kayıtları, giriş saatleri</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">4. Kişisel Verilerin İşlenme Amaçları</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Mali müşavirlik hizmetlerinin sunulması ve sözleşme yükümlülüklerinin yerine getirilmesi</li>
                <li>Muhasebe, vergi, SGK ve diğer yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Resmi kurumlara yapılması gereken bildirimlerin gerçekleştirilmesi</li>
                <li>Hizmet kalitesinin geliştirilmesi ve müşteri memnuniyetinin artırılması</li>
                <li>İletişim faaliyetlerinin yürütülmesi</li>
                <li>Finans ve muhasebe işlemlerinin yürütülmesi</li>
                <li>Bilgi güvenliği süreçlerinin yürütülmesi</li>
                <li>Hukuki işlemlerin takibi ve yerine getirilmesi</li>
                <li>İş süreçlerinin iyileştirilmesi ve raporlanması</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">5. Kişisel Verilerin Aktarılması</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak 
                aşağıdaki kişi ve kurumlara aktarılabilir:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Resmi Kurumlar:</strong> Gelir İdaresi Başkanlığı, SGK, Ticaret Sicil, 
                mahkemeler ve diğer resmi kurumlar</li>
                <li><strong>Hizmet Sağlayıcılar:</strong> Bulut depolama, yazılım hizmetleri, 
                veri merkezi hizmetleri sunan firmalar</li>
                <li><strong>İş Ortakları:</strong> Bağımsız denetim firmaları, hukuk danışmanları</li>
                <li><strong>Meslek Kuruluşları:</strong> TÜRMOB ve bağlı odalar</li>
                <li><strong>Yurtdışına Aktarım:</strong> Yalnızca yeterli koruma bulunan ülkelere 
                veya açık rızanız dahilinde</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">6. Kişisel Veri Sahibinin Hakları</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Kişisel veri işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp 
                kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların 
                düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin 
                silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme ve yok edilme işlemlerinin, kişisel verilerin aktarıldığı 
                üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi 
                suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması 
                hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">7. Haklarınızı Kullanma Yöntemi</h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-gray-900">Başvuru Yöntemleri:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Yazılı Başvuru:</strong> İstanbul, Türkiye adresine elden teslim veya 
                  noter kanalıyla</li>
                  <li><strong>Kayıtlı Elektronik Posta:</strong> kvkk@smmm.com adresine 
                  KEP ile gönderim</li>
                  <li><strong>Güvenli Elektronik İmza:</strong> Başvuru formunu imzalayarak 
                  kvkk@smmm.com adresine</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  <strong>Başvuru Süreci:</strong> Başvurularınız en geç 30 gün içinde 
                  ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi 
                  hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki 
                  ücret alınabilir.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">8. Veri Güvenliği Tedbirleri</h3>
              <p className="text-gray-700 leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki önlemler alınmıştır:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>256-bit SSL şifreleme ile veri iletimi</li>
                <li>Güvenlik duvarı ve saldırı tespit sistemleri</li>
                <li>Düzenli güvenlik testleri ve denetimleri</li>
                <li>Erişim yetkilendirme ve kimlik doğrulama sistemleri</li>
                <li>Veri yedekleme ve kurtarma planları</li>
                <li>Personel gizlilik sözleşmeleri ve eğitimleri</li>
                <li>Fiziksel güvenlik tedbirleri (kamera, alarm, erişim kartı)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">9. Veri Saklama ve İmha</h3>
              <p className="text-gray-700 leading-relaxed">
                Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatta 
                öngörülen süreler kadar (Vergi Usul Kanunu'na göre 10 yıl) saklanır. Saklama 
                süresinin sonunda, kişisel veriler KVKK'nın 7. maddesinde öngörülen şartlar 
                dahilinde silinir, yok edilir veya anonim hale getirilir. İmha işlemleri güvenli 
                yöntemlerle gerçekleştirilir ve kayıt altına alınır.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2 text-gray-900">10. İletişim</h3>
              <p className="text-gray-700 leading-relaxed">
                KVKK Aydınlatma Metni hakkında sorularınız için:
              </p>
              <div className="mt-2 text-gray-700">
                <p><strong>KVKK Birimi E-posta:</strong> kvkk@smmm.com</p>
                <p><strong>Genel İletişim:</strong> info@smmm.com</p>
                <p><strong>Telefon:</strong> +90 (212) 123 45 67</p>
                <p><strong>Adres:</strong> İstanbul, Türkiye</p>
              </div>
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