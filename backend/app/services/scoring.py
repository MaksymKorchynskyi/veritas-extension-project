"""Модуль математичного скорингу VERITAS.

Усі формули базуються на єдиному джерелі:

    Jøsang, A. & Ismail, R. (2002).
    "The Beta Reputation System."
    Proceedings of the 15th Bled Electronic Commerce Conference, pp. 324-337.

Базова формула BRS (Рівняння 3)::

    E(p) = (r + W · a) / (r + s + W)

Де:
    r  — кількість позитивних свідчень (зважена)
    s  — кількість негативних свідчень (зважена)
    W  — вага апріорної інформації (за замовчуванням 2, неінформативний баєсівський пріор)
    a  — базова ставка (апріорна ймовірність, специфічна для домену)

Ваги свідчень у Достовірності (див. `calculate_credibility`):
    - підтверджена перехресною верифікацією теза:   вага 1.0 (r)
    - спростована перехресною верифікацією теза:    вага 1.0 (s)
    - іменоване цитування в тексті статті:          вага 0.2 (r)
    - емоційна/маніпулятивна фраза:                 вага 0.3 (s)
    - неперевірена конкретна теза:                  вага 0.4 (s)

Прозорість та Об'єктивність використовують ту саму формулу зі своїми свідченнями.
"""


def _brs_expected(r: float, s: float, a: float = 0.5, prior_weight: float = 2.0) -> float:
    """Очікувана довіра за Beta Reputation System Jøsang.

    E(p) = (r + W * a) / (r + s + W)

    При W=2 та a=0.5 це еквівалент баєсівського очікуваного значення
    Beta(α, β) розподілу: E = α / (α + β), де α=r+1, β=s+1.
    """
    return (r + prior_weight * a) / (r + s + prior_weight)


def calculate_credibility(
    n_conf: int,
    n_contra: int,
    domain_trust: float = 0.5,
    citations_count: int = 0,
    emotional_words_count: int = 0,
    n_unverified: int = 0,
) -> float:
    """Достовірність через BRS з об'єднанням багатоджерельних свідчень.

    Джерела свідчень (зважені за BRS Розділ 4):
        r = n_conf * 1.0  +  citations_count * 0.2
        s = n_contra * 1.0  +  emotional_words_count * 0.3 + n_unverified * 0.4
        a = domain_trust (базова ставка з репутації домену)

    Це забезпечує чутливість достовірності навіть коли перехресна верифікація недоступна:
    - Якісна стаття (5 цитувань, 0 емоційних): достовірність ≈ 67%
    - Пропаганда (0 цитувань, 6 емоційних):    достовірність ≈ 26%
    - Неперевірені конкретні тези (n_unverified): знижує достовірність

    Джерело: Jøsang & Ismail 2002, Eq. 3 + Section 4
    """
    r = n_conf + citations_count * 0.2
    s = n_contra + emotional_words_count * 0.3 + n_unverified * 0.4

    score = _brs_expected(r=r, s=s, a=domain_trust) * 100.0
    return max(0.0, min(100.0, score))


def calculate_transparency(citations_count: int) -> float:
    """Прозорість через BRS з консервативним пріором.

    Кожне іменоване джерело / цитування — позитивне свідчення (r).
    Контр-свідчення відсутні (s=0).
    Базова ставка a=0.3 — стаття повинна *довести* свою прозорість
    через цитування; відсутність цитувань дає низький бал.

    Джерело: Jøsang & Ismail 2002, Eq. 3
    """
    score = _brs_expected(r=citations_count, s=0, a=0.3) * 100.0
    return max(0.0, min(100.0, score))


def calculate_objectivity(emotional_words_count: int, total_words: int) -> float:
    """Об'єктивність через BRS з динамічною моделлю вікна спостережень.

    Агент аналізує статтю та підраховує маніпулятивні фрази.
    Моделюємо як K незалежних спостережень (`window`), де K масштабується
    з довжиною статті (1 спостереження на 50 слів, мінімум 8).
    Кожне емоційне слово — негативне свідчення (s), решта
    слотів — позитивне свідчення (r = K - s).

    a = 0.5 (неінформативний пріор)

    Джерело: Jøsang & Ismail 2002, Eq. 3
    """
    window = max(8, total_words // 50)
    s = min(emotional_words_count, window)
    r = window - s
    score = _brs_expected(r=r, s=s, a=0.5) * 100.0
    return max(0.0, min(100.0, score))


def aggregate_trust_score(credibility: float, transparency: float, objectivity: float) -> float:
    """Фінальний Trust Score через просте адитивне зважування (SAW).

    Ваги: Достовірність 50%, Прозорість 30%, Об'єктивність 20%.

    Коли достовірність < 50 (нижче неінформативного пріору), свідчення
    мають нетто-негативний характер. Тоді підсумок множиться на знижку
    `0.5 + достовірність / 100`: якщо фактологічна база слабка, інші метрики
    мають менше значення. Це евристика VERITAS, ідейно близька до
    транзитивності довіри в роботі Jøsang & Ismail (2002).
    """
    trust = 0.50 * credibility + 0.30 * transparency + 0.20 * objectivity

    if credibility < 50.0:
        discount = 0.5 + (credibility / 100.0)
        trust *= discount

    return max(0.0, min(100.0, round(trust, 1)))
