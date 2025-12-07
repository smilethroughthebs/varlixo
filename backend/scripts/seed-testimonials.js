const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const testimonialSchema = new mongoose.Schema({
  name: String,
  role: String,
  location: String,
  image: String,
  content: String,
  profit: String,
  active: { type: Boolean, default: true },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

const testimonials = [
  // USA (4)
  { name: 'Ethan Miller', role: 'Consultant', location: '🇺🇸 USA', image: '👨‍💼', content: "I've grown my portfolio steadily. My last payout was $42,800, and withdrawals were smooth.", profit: '+$42,800' },
  { name: 'Sophia Turner', role: 'Analyst', location: '🇺🇸 USA', image: '👩‍💼', content: "I diversified lightly and still earned $58,400 in returns. Really impressive.", profit: '+$58,400' },
  { name: 'Logan Carter', role: 'Trader', location: '🇺🇸 USA', image: '👨‍💻', content: "Consistent profits. My two-month total reached $76,900.", profit: '+$76,900' },
  { name: 'Zoe Hernandez', role: 'Entrepreneur', location: '🇺🇸 USA', image: '👩‍💻', content: "Great customer support and real results. My best week ended with $34,200 profit.", profit: '+$34,200' },
  // UK (4)
  { name: 'Oliver Bennett', role: 'Manager', location: '🇬🇧 UK', image: '👨‍💼', content: "Solid performance overall. My recent return was £29,700.", profit: '+£29,700' },
  { name: 'Amelia Brooks', role: 'Director', location: '🇬🇧 UK', image: '👩‍💼', content: "I started small and scaled. Now averaging £41,300 monthly.", profit: '+£41,300' },
  { name: 'Harvey Collins', role: 'Executive', location: '🇬🇧 UK', image: '👨‍💻', content: "Fast payouts. Earned £52,900 last cycle.", profit: '+£52,900' },
  { name: 'Lily Parker', role: 'Advisor', location: '🇬🇧 UK', image: '👩‍💻', content: "Stable, reliable, and surprisingly profitable. Cleared £38,200 recently.", profit: '+£38,200' },
  // Germany (4)
  { name: 'Jonas Schmitt', role: 'Engineer', location: '🇩🇪 Germany', image: '👨‍💼', content: "Sehr zufrieden. Meine Rendite lag bei €44,500.", profit: '+€44,500' },
  { name: 'Mia Fischer', role: 'Analyst', location: '🇩🇪 Germany', image: '👩‍💼', content: "Professionell und zuverlässig. Zuletzt €62,800 verdient.", profit: '+€62,800' },
  { name: 'Luca Weber', role: 'Developer', location: '🇩🇪 Germany', image: '👨‍💻', content: "Top Plattform. Ich erhielt €71,400 in nur 3 Wochen.", profit: '+€71,400' },
  { name: 'Hannah Becker', role: 'Consultant', location: '🇩🇪 Germany', image: '👩‍💻', content: "Auszahlungen waren schnell. Gesamtgewinn €39,900.", profit: '+€39,900' },
  // Canada (4)
  { name: 'Jackson White', role: 'Trader', location: '🇨🇦 Canada', image: '👨‍💼', content: "Reached a milestone with $53,200 CAD returns.", profit: '+$53,200 CAD' },
  { name: 'Ava Scott', role: 'Manager', location: '🇨🇦 Canada', image: '👩‍💼', content: "Reliable platform. My last payout was $68,900 CAD.", profit: '+$68,900 CAD' },
  { name: 'Liam Morris', role: 'Executive', location: '🇨🇦 Canada', image: '👨‍💻', content: "Smooth deposits and withdrawals. Profit: $27,600 CAD.", profit: '+$27,600 CAD' },
  { name: 'Chloe Adams', role: 'Advisor', location: '🇨🇦 Canada', image: '👩‍💻', content: "I didn't expect this level of performance. Earned $84,000 CAD.", profit: '+$84,000 CAD' },
  // Australia (4)
  { name: 'Noah Wilson', role: 'Consultant', location: '🇦🇺 Australia', image: '👨‍💼', content: "Amazing results. My portfolio gained $31,700 AUD.", profit: '+$31,700 AUD' },
  { name: 'Isla Thompson', role: 'Analyst', location: '🇦🇺 Australia', image: '👩‍💼', content: "Returns exceeded expectations. $59,200 AUD earned.", profit: '+$59,200 AUD' },
  { name: 'Mason Reid', role: 'Trader', location: '🇦🇺 Australia', image: '👨‍💻', content: "Transparent process and good returns. Cleared $72,800 AUD.", profit: '+$72,800 AUD' },
  { name: 'Harper King', role: 'Manager', location: '🇦🇺 Australia', image: '👩‍💻', content: "Quick payments, strong gains. Profit: $44,600 AUD.", profit: '+$44,600 AUD' },
  // Brazil (4)
  { name: 'Gabriel Silva', role: 'Engineer', location: '🇧🇷 Brazil', image: '👨‍💼', content: "Excelente plataforma! Ganhei R$128.400.", profit: '+R$128.400' },
  { name: 'Mariana Souza', role: 'Analyst', location: '🇧🇷 Brazil', image: '👩‍💼', content: "Retornos consistentes. Meu lucro: R$84.900.", profit: '+R$84.900' },
  { name: 'Lucas Rocha', role: 'Developer', location: '🇧🇷 Brazil', image: '👨‍💻', content: "Muito confiável. Recebi R$143.200 em rendimentos.", profit: '+R$143.200' },
  { name: 'Ana Ribeiro', role: 'Executive', location: '🇧🇷 Brazil', image: '👩‍💻', content: "Fiquei impressionado com a velocidade dos saques. Ganhei R$66.800.", profit: '+R$66.800' },
  // France (4)
  { name: 'Louis Moreau', role: 'Trader', location: '🇫🇷 France', image: '👨‍💼', content: "Plateforme sérieuse. J'ai gagné €48,100.", profit: '+€48,100' },
  { name: 'Emma Lambert', role: 'Manager', location: '🇫🇷 France', image: '👩‍💼', content: "Retraits rapides, rendement solide: €71,300.", profit: '+€71,300' },
  { name: 'Chloé Dubois', role: 'Consultant', location: '🇫🇷 France', image: '👩‍💻', content: "Très satisfaite. Mes profits ont atteint €53,800.", profit: '+€53,800' },
  { name: 'Hugo Fournier', role: 'Advisor', location: '🇫🇷 France', image: '👨‍💻', content: "J'ai commencé petit. Maintenant je reçois €39,200 régulièrement.", profit: '+€39,200' },
  // Italy (4)
  { name: 'Marco Bianchi', role: 'Executive', location: '🇮🇹 Italy', image: '👨‍💼', content: "Piattaforma affidabile. Ho guadagnato €46,900.", profit: '+€46,900' },
  { name: 'Giulia Rossi', role: 'Analyst', location: '🇮🇹 Italy', image: '👩‍💼', content: "Buoni profitti e pagamenti veloci: €33,700.", profit: '+€33,700' },
  { name: 'Lorenzo Ricci', role: 'Trader', location: '🇮🇹 Italy', image: '👨‍💻', content: "Sono soddisfatto. Il mio rendimento totale è €72,400.", profit: '+€72,400' },
  { name: 'Sofia Greco', role: 'Manager', location: '🇮🇹 Italy', image: '👩‍💻', content: "Investimento sicuro. Ho ottenuto €54,100.", profit: '+€54,100' },
  // Spain (4)
  { name: 'Diego García', role: 'Engineer', location: '🇪🇸 Spain', image: '👨‍💼', content: "Muy buena plataforma. Gané €42,800.", profit: '+€42,800' },
  { name: 'Lucía Torres', role: 'Consultant', location: '🇪🇸 Spain', image: '👩‍💼', content: "Pagos sin problemas. Mi beneficio fue €63,400.", profit: '+€63,400' },
  { name: 'Sergio Ruiz', role: 'Developer', location: '🇪🇸 Spain', image: '👨‍💻', content: "Excelentes resultados: €57,900.", profit: '+€57,900' },
  { name: 'Elena Navarro', role: 'Advisor', location: '🇪🇸 Spain', image: '👩‍💻', content: "Ganancias constantes. Último retiro: €29,600.", profit: '+€29,600' },
  // Netherlands (4)
  { name: 'Daan de Vries', role: 'Trader', location: '🇳🇱 Netherlands', image: '👨‍💼', content: "Betrouwbaar en snel. Winst: €39,800.", profit: '+€39,800' },
  { name: 'Sanne Visser', role: 'Manager', location: '🇳🇱 Netherlands', image: '👩‍💼', content: "Goede rendementen. Ik verdiende €58,200.", profit: '+€58,200' },
  { name: 'Timo Bakker', role: 'Executive', location: '🇳🇱 Netherlands', image: '👨‍💻', content: "Professioneel platform. Mijn winst: €74,500.", profit: '+€74,500' },
  { name: 'Nina Willems', role: 'Consultant', location: '🇳🇱 Netherlands', image: '👩‍💻', content: "Uitstekende service. Ontving €48,700.", profit: '+€48,700' },
  // Belgium (4)
  { name: 'Thomas Leroy', role: 'Analyst', location: '🇧🇪 Belgium', image: '👨‍💼', content: "Très bon rendement: €36,400.", profit: '+€36,400' },
  { name: 'Camille Simon', role: 'Developer', location: '🇧🇪 Belgium', image: '👩‍💼', content: "Fiable et rapide. J'ai gagné €59,900.", profit: '+€59,900' },
  { name: 'Maxime Lambert', role: 'Trader', location: '🇧🇪 Belgium', image: '👨‍💻', content: "Service impeccable. Profit: €68,200.", profit: '+€68,200' },
  { name: 'Manon Dupont', role: 'Manager', location: '🇧🇪 Belgium', image: '👩‍💻', content: "J'ai reçu €47,300 sans problème.", profit: '+€47,300' },
  // Switzerland (4)
  { name: 'Nico Keller', role: 'Executive', location: '🇨🇭 Switzerland', image: '👨‍💼', content: "Exzellente Plattform. Gewinn: CHF 52,600.", profit: '+CHF 52,600' },
  { name: 'Lena Baumann', role: 'Consultant', location: '🇨🇭 Switzerland', image: '👩‍💼', content: "Sehr zuverlässig. Ich verdiente CHF 83,400.", profit: '+CHF 83,400' },
  { name: 'Tim Huber', role: 'Engineer', location: '🇨🇭 Switzerland', image: '👨‍💻', content: "Professionelle Unterstützung. Total: CHF 41,900.", profit: '+CHF 41,900' },
  { name: 'Aline Steiner', role: 'Advisor', location: '🇨🇭 Switzerland', image: '👩‍💻', content: "Schnelle Auszahlungen. CHF 68,200 erhalten.", profit: '+CHF 68,200' },
  // Austria (4)
  { name: 'Paul Hofer', role: 'Trader', location: '🇦🇹 Austria', image: '👨‍💼', content: "Verdiente €39,500 ohne Stress.", profit: '+€39,500' },
  { name: 'Julia Aigner', role: 'Manager', location: '🇦🇹 Austria', image: '👩‍💼', content: "Sehr zufrieden mit €61,100 Gewinn.", profit: '+€61,100' },
  { name: 'Felix Leitner', role: 'Executive', location: '🇦🇹 Austria', image: '👨‍💻', content: "Top-Service. Rückzahlung €72,600.", profit: '+€72,600' },
  { name: 'Sarah König', role: 'Consultant', location: '🇦🇹 Austria', image: '👩‍💻', content: "Stabile Rendite: €45,800.", profit: '+€45,800' },
  // Sweden (4)
  { name: 'Oscar Lindberg', role: 'Developer', location: '🇸🇪 Sweden', image: '👨‍💼', content: "Trygg plattform. Jag tjänade SEK 312,000.", profit: '+SEK 312,000' },
  { name: 'Ella Nyström', role: 'Analyst', location: '🇸🇪 Sweden', image: '👩‍💼', content: "Snabba uttag. Vinst: SEK 284,500.", profit: '+SEK 284,500' },
  { name: 'Lukas Berg', role: 'Trader', location: '🇸🇪 Sweden', image: '👨‍💻', content: "Höga avkastning: SEK 356,200.", profit: '+SEK 356,200' },
  { name: 'Freja Holm', role: 'Manager', location: '🇸🇪 Sweden', image: '👩‍💻', content: "Mycket nöjd. Tjänade SEK 198,700.", profit: '+SEK 198,700' },
  // Norway (4)
  { name: 'Aksel Hansen', role: 'Executive', location: '🇳🇴 Norway', image: '👨‍💼', content: "Stor avkastning. Fikk NOK 411,800.", profit: '+NOK 411,800' },
  { name: 'Ida Nilsen', role: 'Consultant', location: '🇳🇴 Norway', image: '👩‍💼', content: "Rask service. Totalt NOK 286,900.", profit: '+NOK 286,900' },
  { name: 'Tobias Johansen', role: 'Engineer', location: '🇳🇴 Norway', image: '👨‍💻', content: "Tjente NOK 332,700, veldig fornøyd.", profit: '+NOK 332,700' },
  { name: 'Selma Eriksen', role: 'Advisor', location: '🇳🇴 Norway', image: '👩‍💻', content: "Gode resultater: NOK 257,600.", profit: '+NOK 257,600' },
  // Denmark (4)
  { name: 'Mads Kristensen', role: 'Trader', location: '🇩🇰 Denmark', image: '👨‍💼', content: "Fremragende platform. Tjente DKK 172,400.", profit: '+DKK 172,400' },
  { name: 'Clara Madsen', role: 'Manager', location: '🇩🇰 Denmark', image: '👩‍💼', content: "Hurtige udbetalinger. Vinst: DKK 219,900.", profit: '+DKK 219,900' },
  { name: 'Andreas Lund', role: 'Executive', location: '🇩🇰 Denmark', image: '👨‍💻', content: "Stabile afkast: DKK 188,700.", profit: '+DKK 188,700' },
  { name: 'Sofie Mortensen', role: 'Consultant', location: '🇩🇰 Denmark', image: '👩‍💻', content: "Meget tilfreds. Tjente DKK 203,500.", profit: '+DKK 203,500' },
  // Poland (4)
  { name: 'Jakub Lewandowski', role: 'Developer', location: '🇵🇱 Poland', image: '👨‍💼', content: "Świetna platforma. Zysk: PLN 142,000.", profit: '+PLN 142,000' },
  { name: 'Martyna Zielinska', role: 'Analyst', location: '🇵🇱 Poland', image: '👩‍💼', content: "Wysoka stopa zwrotu: PLN 184,700.", profit: '+PLN 184,700' },
  { name: 'Kamil Kaczmarek', role: 'Trader', location: '🇵🇱 Poland', image: '👨‍💻', content: "Bardzo polecam. Zarobiłem PLN 121,500.", profit: '+PLN 121,500' },
  { name: 'Alicja Nowak', role: 'Manager', location: '🇵🇱 Poland', image: '👩‍💻', content: "Szybkie wypłaty. Zysk: PLN 163,900.", profit: '+PLN 163,900' },
  // Japan (4)
  { name: 'Hiroshi Tanaka', role: 'Executive', location: '🇯🇵 Japan', image: '👨‍💼', content: "とても信頼できます。利益は ¥4,280,000 でした。", profit: '+¥4,280,000' },
  { name: 'Yuki Sato', role: 'Consultant', location: '🇯🇵 Japan', image: '👩‍💼', content: "素晴らしい結果。合計 ¥3,670,000 稼ぎました。", profit: '+¥3,670,000' },
  { name: 'Daichi Suzuki', role: 'Engineer', location: '🇯🇵 Japan', image: '👨‍💻', content: "安定した利益で安心できます。¥2,930,000。", profit: '+¥2,930,000' },
  { name: 'Aiko Mori', role: 'Advisor', location: '🇯🇵 Japan', image: '👩‍💻', content: "出金も早いです。利益は ¥3,240,000。", profit: '+¥3,240,000' },
  // South Korea (4)
  { name: 'Kim Min-ho', role: 'Trader', location: '🇰🇷 South Korea', image: '👨‍💼', content: "아주 만족스럽습니다. 수익 ₩58,200,000.", profit: '+₩58,200,000' },
  { name: 'Seo Ji-woo', role: 'Manager', location: '🇰🇷 South Korea', image: '👩‍💼', content: "빠른 출금. 총 ₩42,700,000 벌었어요.", profit: '+₩42,700,000' },
  { name: 'Park Hyun', role: 'Executive', location: '🇰🇷 South Korea', image: '👨‍💻', content: "안정적인 수익: ₩63,400,000.", profit: '+₩63,400,000' },
  { name: 'Han Yuna', role: 'Consultant', location: '🇰🇷 South Korea', image: '👩‍💻', content: "신뢰할 수 있습니다. 최근 수익 ₩37,900,000.", profit: '+₩37,900,000' },
  // India (4)
  { name: 'Arjun Mehta', role: 'Developer', location: '🇮🇳 India', image: '👨‍💼', content: "Great experience. Earned ₹1,420,000.", profit: '+₹1,420,000' },
  { name: 'Priya Rao', role: 'Analyst', location: '🇮🇳 India', image: '👩‍💼', content: "Fast payments. Profit: ₹1,860,000.", profit: '+₹1,860,000' },
  { name: 'Rohan Patel', role: 'Trader', location: '🇮🇳 India', image: '👨‍💻', content: "Very reliable. Cleared ₹1,230,000.", profit: '+₹1,230,000' },
  { name: 'Aisha Khan', role: 'Manager', location: '🇮🇳 India', image: '👩‍💻', content: "Excellent platform. Made ₹2,040,000.", profit: '+₹2,040,000' },
  // China (4)
  { name: 'Wang Lei', role: 'Executive', location: '🇨🇳 China', image: '👨‍💼', content: "非常に信頼できます。稼いだ ¥146,000。", profit: '+¥146,000' },
  { name: 'Zhang Mei', role: 'Consultant', location: '🇨🇳 China', image: '👩‍💼', content: "提現快速，総収益 ¥189,500。", profit: '+¥189,500' },
  { name: 'Liu Chen', role: 'Engineer', location: '🇨🇳 China', image: '👨‍💻', content: "収益安定：¥158,700。", profit: '+¥158,700' },
  { name: 'Hua Jing', role: 'Advisor', location: '🇨🇳 China', image: '👩‍💻', content: "令人满足的平台，稼取 ¥172,400。", profit: '+¥172,400' },
  // Saudi Arabia (4)
  { name: 'Faisal Al-Harbi', role: 'Trader', location: '🇸🇦 Saudi Arabia', image: '👨‍💼', content: "ممتاز جدا. ربحت 52,400 ريال.", profit: '+52,400 ر.س' },
  { name: 'Noor Al-Zahrani', role: 'Manager', location: '🇸🇦 Saudi Arabia', image: '👩‍💼', content: "سحوبات سريعة. ربحت 68,900 ريال.", profit: '+68,900 ر.س' },
  { name: 'Omar Al-Saud', role: 'Executive', location: '🇸🇦 Saudi Arabia', image: '👨‍💻', content: "عائد ممتاز: 79,400 ريال.", profit: '+79,400 ر.س' },
  { name: 'Layla Al-Fahad', role: 'Consultant', location: '🇸🇦 Saudi Arabia', image: '👩‍💻', content: "تجربة رائعة. ربحت 44,600 ريال.", profit: '+44,600 ر.س' },
  // UAE (4)
  { name: 'Ahmed Sultan', role: 'Developer', location: '🇦🇪 UAE', image: '👨‍💼', content: "احترافية عالية. ربحت 32,700 درهم.", profit: '+32,700 د.إ' },
  { name: 'Mariam Khan', role: 'Analyst', location: '🇦🇪 UAE', image: '👩‍💼', content: "أفضل منصة استخدمتها. ربحت 56,900 درهم.", profit: '+56,900 د.إ' },
  { name: 'Yousef Nabil', role: 'Trader', location: '🇦🇪 UAE', image: '👨‍💻', content: "نتائج مبهرة: 74,300 درهم.", profit: '+74,300 د.إ' },
  { name: 'Zara Hassan', role: 'Manager', location: '🇦🇪 UAE', image: '👩‍💻', content: "سحوبات سهلة وسريعة. ربحت 41,200 درهم.", profit: '+41,200 د.إ' },
  // Mexico (4)
  { name: 'Carlos Díaz', role: 'Executive', location: '🇲🇽 Mexico', image: '👨‍💼', content: "Gran plataforma. Gané $142,000 MXN.", profit: '+$142,000 MXN' },
  { name: 'Sofía Ramos', role: 'Consultant', location: '🇲🇽 Mexico', image: '👩‍💼', content: "Rendimiento estable. Pagué $83,400 MXN.", profit: '+$83,400 MXN' },
  { name: 'Javier Cruz', role: 'Engineer', location: '🇲🇽 Mexico', image: '👨‍💻', content: "Buen retorno: $119,700 MXN.", profit: '+$119,700 MXN' },
  { name: 'Daniela Castillo', role: 'Advisor', location: '🇲🇽 Mexico', image: '👩‍💻', content: "Mi retiro llegó rápido. Gané $102,800 MXN.", profit: '+$102,800 MXN' },
  // South Africa (4)
  { name: 'Thabo Nkosi', role: 'Trader', location: '🇿🇦 South Africa', image: '👨‍💼', content: "Excellent results. Earned R91,400.", profit: '+R91,400' },
  { name: 'Zanele Dlamini', role: 'Manager', location: '🇿🇦 South Africa', image: '👩‍💼', content: "Very reliable platform. Profit: R128,900.", profit: '+R128,900' },
  { name: 'Sipho Khumalo', role: 'Executive', location: '🇿🇦 South Africa', image: '👨‍💻', content: "Quick payouts. Made R74,200.", profit: '+R74,200' },
  { name: 'Nandi Molefe', role: 'Consultant', location: '🇿🇦 South Africa', image: '👩‍💻', content: "Impressive returns: R102,600.", profit: '+R102,600' },
  // Philippines (4)
  { name: 'John Reyes', role: 'Developer', location: '🇵🇭 Philippines', image: '👨‍💼', content: "Great platform! Profit ₱192,400.", profit: '+₱192,400' },
  { name: 'Maria Santos', role: 'Analyst', location: '🇵🇭 Philippines', image: '👩‍💼', content: "Very satisfied. Earned ₱244,100.", profit: '+₱244,100' },
  { name: 'Carlos Dela Cruz', role: 'Trader', location: '🇵🇭 Philippines', image: '👨‍💻', content: "Fast withdrawals. Profit: ₱171,900.", profit: '+₱171,900' },
  { name: 'Angelica Lim', role: 'Manager', location: '🇵🇭 Philippines', image: '👩‍💻', content: "Amazing experience. Cleared ₱265,800.", profit: '+₱265,800' },
  // Turkey (4)
  { name: 'Emir Kaya', role: 'Executive', location: '🇹🇷 Turkey', image: '👨‍💼', content: "Güvenilir ve hızlı. ₺118,700 kazandım.", profit: '+₺118,700' },
  { name: 'Elif Yıldız', role: 'Consultant', location: '🇹🇷 Turkey', image: '👩‍💼', content: "Getiriler iyi. Toplam ₺153,900.", profit: '+₺153,900' },
  { name: 'Can Demir', role: 'Engineer', location: '🇹🇷 Turkey', image: '👨‍💻', content: "Profesyonel platform. ₺97,400 kazandım.", profit: '+₺97,400' },
  { name: 'Ayşe Arslan', role: 'Advisor', location: '🇹🇷 Turkey', image: '👩‍💻', content: "Hızlı ödeme. Kazancım ₺132,800.", profit: '+₺132,800' },
  // Portugal (4)
  { name: 'Tiago Santos', role: 'Trader', location: '🇵🇹 Portugal', image: '👨‍💼', content: "Ótimos retornos. Ganhei €42,700.", profit: '+€42,700' },
  { name: 'Mariana Gomes', role: 'Manager', location: '🇵🇹 Portugal', image: '👩‍💼', content: "Rápido e confiável. Lucro: €67,500.", profit: '+€67,500' },
  { name: 'Rafael Ferreira', role: 'Executive', location: '🇵🇹 Portugal', image: '👨‍💻', content: "Retorno estável: €39,900.", profit: '+€39,900' },
  { name: 'Inês Carvalho', role: 'Consultant', location: '🇵🇹 Portugal', image: '👩‍💻', content: "Serviço excelente. Ganhei €58,200.", profit: '+€58,200' },
  // Ireland (4)
  { name: 'Sean O\'Connor', role: 'Developer', location: '🇮🇪 Ireland', image: '👨‍💼', content: "Great platform. Earned €36,800.", profit: '+€36,800' },
  { name: 'Aoife Kelly', role: 'Analyst', location: '🇮🇪 Ireland', image: '👩‍💼', content: "Reliable and fast. Profit: €52,900.", profit: '+€52,900' },
  { name: 'Patrick Doyle', role: 'Trader', location: '🇮🇪 Ireland', image: '👨‍💻', content: "Strong returns: €61,400.", profit: '+€61,400' },
  { name: 'Niamh Walsh', role: 'Manager', location: '🇮🇪 Ireland', image: '👩‍💻', content: "Very smooth withdrawals. Made €44,300.", profit: '+€44,300' },
  // Singapore (4)
  { name: 'Marcus Tan', role: 'Executive', location: '🇸🇬 Singapore', image: '👨‍💼', content: "Excellent results. Profit $38,900 SGD.", profit: '+$38,900 SGD' },
  { name: 'Cheryl Lee', role: 'Consultant', location: '🇸🇬 Singapore', image: '👩‍💼', content: "Strong performance: $52,700 SGD.", profit: '+$52,700 SGD' },
  { name: 'Ryan Ho', role: 'Engineer', location: '🇸🇬 Singapore', image: '👨‍💻', content: "Very reliable. Cleared $79,400 SGD.", profit: '+$79,400 SGD' },
  { name: 'Natalie Ong', role: 'Advisor', location: '🇸🇬 Singapore', image: '👩‍💻', content: "Fast payouts. Earnings: $62,100 SGD.", profit: '+$62,100 SGD' },
];

async function seedTestimonials() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Removing existing testimonials...');
    await Testimonial.deleteMany({});
    console.log('✅ Cleaned up existing testimonials');

    console.log('📝 Seeding 120 testimonials...');
    const result = await Testimonial.insertMany(testimonials);
    console.log(`✅ Successfully seeded ${result.length} testimonials!`);

    console.log('\n📊 Summary:');
    console.log(`   Total testimonials: ${result.length}`);
    console.log(`   Countries: 25`);
    console.log(`   Testimonials per country: 4`);
    console.log(`   Currencies: 16+`);
    console.log(`   Languages: 10+`);

    await mongoose.connection.close();
    console.log('\n✅ Seeding complete! Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding testimonials:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedTestimonials();
