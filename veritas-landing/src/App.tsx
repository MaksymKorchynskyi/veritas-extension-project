import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, BrainCircuit, GlobeLock, ChevronDown } from 'lucide-react';
import './index.css';

function App() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityPos = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="app-container">
      {/* Navigation removed as requested */}

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background Decorative Circles */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(197, 137, 64, 0.1)', filter: 'blur(60px)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(51, 105, 30, 0.08)', filter: 'blur(80px)', zIndex: 0 }} />

        <motion.div 
          style={{ y: yPos, opacity: opacityPos, textAlign: 'center', zIndex: 10, width: '100%' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="huge-italic-logo">Veritas</h1>

        </motion.div>

        <motion.div 
          style={{ position: 'absolute', bottom: '40px', left: '50%', x: '-50%', opacity: opacityPos }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown size={32} color="var(--text-secondary)" />
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: '1px solid rgba(141, 110, 99, 0.1)' }}>
        <div className="container">
          <div className="grid" style={{ alignItems: 'center' }}>
            <motion.div 
              className="col-span-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
            >
              <h2 style={{ fontSize: '3.5rem', marginBottom: '24px', color: 'var(--text-primary)' }}>
                Епідемія <span style={{ color: 'var(--score-low)', fontStyle: 'italic' }}>Фейкових Новин</span>
              </h2>
              <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '20px' }}>
                Щодня у світі генеруються мільйони недостовірних статей, маніпулятивних заголовків та згенерованих ШІ фейків. Вони впливають на ваші рішення, емоції та світосприйняття.
              </p>
              <p style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.8 }}>
                Veritas — це ваша персональна лінія захисту. Ми автоматично аналізуємо кожне слово, щоб ви завжди знали правду.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'var(--card-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '4rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Чому саме <span style={{ fontStyle: 'italic' }}>Veritas</span>?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', fontSize: '1.3rem', lineHeight: 1.6 }}>
              Ми поєднуємо новітні технології штучного інтелекту з перевіреними методологіями OSINT, щоб забезпечити вас найточнішою інформацією.
            </p>
          </div>

          <div className="grid">
            {[
              {
                icon: <BrainCircuit size={50} color="var(--score-high)" />,
                title: "Штучний Інтелект",
                desc: "Глибокий семантичний аналіз тексту, виявлення маніпуляцій, клікбейту та емоційного забарвлення за секунди."
              },
              {
                icon: <GlobeLock size={50} color="var(--score-mid)" />,
                title: "OSINT Інтеграція",
                desc: "Автоматизований пошук відкритими джерелами для підтвердження або спростування фактів у реальному часі."
              },
              {
                icon: <ShieldCheck size={50} color="var(--text-primary)" />,
                title: "Jøsang Beta System",
                desc: "Математично обґрунтована система репутації джерел, що самонавчається на основі достовірності їх публікацій."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                className="col-span-4 glass" 
                style={{ padding: '40px 30px', textAlign: 'center' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', border: '1px solid var(--border-accent)' }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.15rem' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="container">
          <div className="grid" style={{ alignItems: 'center' }}>
            <motion.div 
              className="col-span-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{ fontSize: '4rem', marginBottom: '30px' }}>Як це <span style={{ fontStyle: 'italic', color: 'var(--score-mid)' }}>працює</span></h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {[
                  { step: "01", title: "Відкрийте новину", desc: "Просто читайте новини як завжди. Veritas працює у фоновому режимі на будь-якому новинному сайті." },
                  { step: "02", title: "Запустіть аналіз", desc: "Один клік на іконку розширення, і наші алгоритми починають перевірку фактів та джерел." },
                  { step: "03", title: "Отримайте оцінку", desc: "Veritas видає загальний бал довіри (від 0 до 100), виділяє підозрілі фрагменти та пояснює свій вердикт." }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 800, color: 'var(--border-accent)', opacity: 0.5, lineHeight: 1 }}>
                      {item.step}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '1.15rem' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="col-span-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              {/* Mockup of Extension */}
              <div className="glass" style={{ width: '380px', height: '480px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: '2rem' }}>Veritas</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence</div>
                </div>
                
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '4px solid var(--score-high)', margin: '0 auto 24px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--score-high)', lineHeight: 1 }}>87</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Достовірно</span>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Фактчекінг</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--score-high)' }}>92/100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Емоційність</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--score-mid)' }}>45/100</span>
                  </div>
                </div>
                
                <div style={{ width: '100%', height: '40px', background: 'var(--text-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-color)', fontSize: '0.9rem', fontWeight: 600 }}>
                  Детальний звіт
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0 40px 0', borderTop: '1px solid rgba(141, 110, 99, 0.2)' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 800, fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Veritas
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '400px' }}>
            Захистіть себе від дезінформації та маніпуляцій в інтернеті за допомогою інтелектуального аналізу.
          </p>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            <a href="#" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Встановити</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Документація</a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</a>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Veritas Intelligence. Усі права захищені.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
