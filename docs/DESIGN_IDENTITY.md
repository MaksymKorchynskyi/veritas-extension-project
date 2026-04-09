🎨 Design Identity: VERITAS
Theme: "The Coffee Edition" (Boutique Luxury) Philosophy: Intellectual Elegance, Warm Minimalism, Quiet Luxury.

Цей документ визначає візуальну мову продукту VERITAS. Дизайн відходить від стандартної "айтішної" стилістики в бік преміального, "журнального" вигляду. Інтерфейс має нагадувати сторінки глянцевого видання або атмосферу дорогої кав'ярні: тепло, затишок, читабельність та високий статус.

🎨 1. Кольорова Палітра (Color Palette)
Ми використовуємо теплу, натуральну гаму. Жодного стерильного білого чи агресивного чорного.

🧱 Основні кольори (Core Colors)

Колір	Hex	Назва	Опис та Використання
#EFE9E1	Latte Cream	Основний Фон. Колір вершків у каві. Теплий, м'який, "обволікаючий". Не жовтий і не сірий.
#3E2723	Dark Mocha	Основний Текст. Глибокий коричневий. На кремовому фоні виглядає м'якше і гармонійніше за чорний.
#8D6E63	Bronze / Cinnamon	Деталі та Лінії. Використовується для тонких розділювачів, рамок та іконок.
#FFFFFF	Pure Milk	Фон карток. Використовується для виділення блоків на кремовому фоні (з прозорістю 40-60%).
🚦 Кольори Оцінювання (Functional Colors)

Кольори для індикації рейтингу мають бути природними, "землистими", щоб не руйнувати загальну естетику.

🟢 High Trust: #33691E (Лісовий зелений / Forest Green).

🟡 Moderate: #C58940 (Карамель / Caramel).

🔴 Low Trust: #8D2D24 (Вишневий / Burnt Cherry).

🔡 2. Типографіка (Typography)
Шрифтова пара побудована на контрасті: "Закручена" класика для емоцій vs. Чітка геометрія для даних.

🅰️ Логотип та Акценти: "Boutique Style"

Font Family: Playfair Display.

Style: Italic (Курсив).

Usage: Тільки для назви VERITAS та великих заголовків.

Вайб: Vogue, Chanel, люксові бренди. Витончені засічки, високий контраст ліній.

🔢 Цифри та Дані: "Crystal Clear"

Font Family: Manrope.

Style: Regular / Bold.

Usage: Для головної оцінки (наприклад, 98.5), статистики та дрібних підписів.

Вайб: Сучасний гротеск. Цифри ідеально круглі, чіткі, без "зайвого шуму". Легко зчитуються миттєво.

📄 Основний текст: "Editorial"

Font Family: Tenor Sans (або Manrope).

Usage: Для пояснень та основного тексту аналізу.

Вайб: Фешн-журналістика. Унікальний характер, але висока читабельність.

🖼 3. Елементи Інтерфейсу (UI Components)
Логотип

Текстовий логотип Veritas, написаний курсивом (Playfair Display Italic). Може мати легку тінь (Letterpress effect), ніби він витиснений на дорогому папері.

Форми та Лінії

Рамки: Дуже тонкі (1px), кольору кориці (#8D6E63).

Кути: Легке заокруглення (border-radius: 8px-12px). Не гострі квадрати, але й не повні овали.

Тіні: Відсутність жорстких чорних тіней. Замість них — легкі "сяйва" або напівпрозорі підкладки.

Popup Layout

Header: Мінімалістичний, "повітряний". Назва бренду великим шрифтом.

Hero Score: Центральний елемент. Велика, жирна цифра (Manrope) на чистому фоні. Жодних складних графіків, тільки суть.

List Items: Картки з напівпрозорим білим фоном (rgba(255,255,255, 0.5)), що лежать на кремовому фоні.

💻 4. Implementation Guide (CSS)
Використовуйте цей код для налаштування змінних у проєкті.

CSS
/* IMPORT FONTS via Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&family=Playfair+Display:ital,wght@1,500;1,700&family=Tenor+Sans&display=swap');

:root {
  /* --- PALETTE: LATTE CREAM --- */
  --bg-color: #EFE9E1;        /* Latte Cream */
  --text-primary: #3E2723;    /* Dark Mocha */
  --text-secondary: #795548;  /* Cocoa (для підписів) */
  --border-accent: #8D6E63;   /* Bronze/Cinnamon */
  --card-bg: rgba(255, 255, 255, 0.6); /* Напівпрозорий білий */

  /* --- SCORING COLORS --- */
  --score-high: #33691E;
  --score-mid: #C58940;
  --score-low: #8D2D24;

  /* --- TYPOGRAPHY --- */
  /* Logo & Headlines (Swirly, Boutique) */
  --font-display: 'Playfair Display', serif; 
  /* Body Text (Editorial) */
  --font-body: 'Tenor Sans', sans-serif;
  /* Numbers & UI Data (Clean, Sans-serif) */
  --font-digits: 'Manrope', sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* EXAMPLE USAGE */
.logo {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  color: var(--text-primary);
}

.score-number {
  font-family: var(--font-digits);
  font-weight: 800;
  color: var(--text-primary);
}