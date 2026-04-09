🏗 Алгоритм оцінки "Рівня Достовірності" (WMFA v2.0)
Загальна оцінка формується як середнє зважене 5 критеріїв. Розрахунок виконується гібридним методом: Gemini (семантичний аналіз) + Python (математичні формули).

1. 📡 Верифікація джерел (Source Verification)
Вага: 35%

Що змінилося: Додано захист від накрутки рейтингу внутрішніми посиланнями (Anti-SEO) та механізм пошуку текстових джерел (Fallback), якщо посилань немає.

Логіка роботи (Python):

Extract: Збираємо всі href з тексту.

Filter (Domain Check): Для кожного посилання визначаємо його "вагу" (W 
link
​	
 ).

Internal Link (посилання на той самий домен): W=0.2 (Майже не враховується).

Trusted Source (gov.ua, .edu, reuters, apnews): W=1.2 (Бонус за авторитетність).

Standard Link (інші зовнішні сайти): W=1.0.

Analyze: Gemini перевіряє зміст (Support/Contradict).

Fallback (План Б): Якщо посилань 0, запускаємо пошук текстових згадок.

Алгоритм (Псевдокод):

Python
async def calculate_source_score(article, links):
    if not links:
        # План Б: Немає посилань, шукаємо текстові згадки
        citations = await gemini.find_text_citations(article.text)
        # Якщо знайшли відомі організації (NASA, ЗСУ) - даємо 50 балів (половина довіри)
        if citations:
            return 50.0 
        else:
            return 0.0

    total_weighted_score = 0
    total_weight = 0
    current_domain = get_domain(article.url)

    for link in links:
        # Визначаємо вагу посилання (Anti-SEO)
        link_domain = get_domain(link.url)
        if link_domain == current_domain:
            weight = 0.2
        elif link_domain in TRUSTED_DOMAINS:
            weight = 1.2
        else:
            weight = 1.0
            
        # Отримуємо статус від AI (1.0, 0.5, -1.0)
        status = await gemini.verify_link(article_claim, link.text)
        
        total_weighted_score += status * weight
        total_weight += weight

    # Нормалізація до 100
    final_score = (total_weighted_score / total_weight) * 100
    return max(0, final_score)
2. ⚖️ Об'єктивність (Objectivity)
Вага: 20%

Що змінилося: Додано "Військовий контекст". Система більше не штрафує за слова "ворог", "окупант", "ліквідовано" в новинах про війну.

Оновлений Промпт для Gemini:

Plaintext
Analyze the text for subjectivity and emotional manipulation.

CONTEXT RULE: 
If the article discusses the Russia-Ukraine war or military conflicts, DO NOT count standard military and political terminology as "Toxic" or "Emotional".
- ALLOWED WORDS (Do not penalize): "aggressor", "occupier", "enemy", "eliminated", "terrorist state", "liberated", "offensive".
- PENALIZE ONLY: Excessive insults, slurs, dehumanizing labels (e.g., "scum", "filth", "pigs") or hyper-emotional adjectives ("miraculous", "satanic").

TASKS:
1. Count strict "Toxic Labels" (excluding war context).
2. Count highly emotional adjectives used to manipulate opinion.
3. Count sentences where the author inserts personal opinion without facts.

Return JSON with integer counts.
Формула розрахунку:

Score=100−(ToxicCount×2)−(OpinionCount×5)
3. 🎯 Релевантність заголовку (Headline Relevance)
Вага: 15%

Логіка: Залишається без змін, оскільки працювала ефективно. Аналіз клікбейту та невідповідності змісту.

Промпт для Gemini:

Plaintext
Compare the Headline with the Article Body.
1. Does the headline contain facts NOT present in the body? (Yes/No)
2. Is the headline exaggerating the scale of events? (0-10 scale)
3. Detect clickbait patterns (CAPSLOCK, multiple exclamations, "SHOCK").
Return JSON with penalty points.
Формула розрахунку:

Score=100−(ClickbaitTriggers×10)−(MismatchSeverity×20)
4. 📊 Фактологічна насиченість (Factual Density)
Вага: 15%

Що змінилося: Введено Адаптивний коефіцієнт довжини. Короткі новини більше не отримують низькі бали за малу кількість сутностей.

Логіка роботи (Python):

Extract: Gemini/NLP знаходить сутності (NER): Імена, Дати, Локації, Організації, Гроші.

Count: Рахуємо кількість унікальних сутностей.

Evaluate: Застосовуємо формулу залежно від кількості слів у статті.

Алгоритм (Псевдокод):

Python
def calculate_density_score(text, entity_count):
    word_count = len(text.split())
    
    if word_count == 0: return 0

    if word_count < 300:
        # Для коротких новин (<300 слів)
        # Щільність 5% (0.05) дасть 100 балів. 
        # Множник = 2000
        multiplier = 2000
    else:
        # Для стандартних статей та лонгрідів
        # Щільність 20% (0.20) дасть 100 балів.
        # Множник = 500
        multiplier = 500

    density_ratio = entity_count / word_count
    score = density_ratio * multiplier
    
    return min(100, score)
5. 🧠 Логічна цілісність (Logical Consistency)
Вага: 15%

Логіка: Пошук логічних помилок та дисбалансу думок.

Промпт для Gemini:

Plaintext
Analyze the logical structure of the text.
1. Identify logical fallacies (e.g., False Causality, Ad Hominem, Strawman).
2. Check for Imbalance: If the topic is controversial, is the opposing view presented or mentioned? (True/False)

Return JSON: {"fallacies_count": int, "imbalance_detected": bool}
Формула розрахунку:

Score=100−(FallacyCount×15)−(Imbalance×10)
🏁 Фінальна агрегація (The "Trust Score")
Бекенд збирає всі 5 оцінок і вираховує фінальний результат:

FinalScore=(S 
ver
​	
 ×0.35)+(S 
obj
​	
 ×0.20)+(S 
head
​	
 ×0.15)+(S 
dens
​	
 ×0.15)+(S 
log
​	
 ×0.15)