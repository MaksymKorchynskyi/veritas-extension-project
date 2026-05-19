"""
Модуль математичного скорингу VERITAS
======================================
Усі формули базуються на єдиному джерелі:

    Jøsang, A. & Ismail, R. (2002).
    "The Beta Reputation System."
    Proceedings of the 15th Bled Electronic Commerce Conference, pp. 324-337.

Базова формула BRS (Рівняння 3):

    E(p) = (r + W · a) / (r + s + W)

Де:
    r  — кількість позитивних свідчень (зважена)
    s  — кількість негативних свідчень (зважена)
    W  — вага апріорної інформації (за замовчуванням 2, неінформативний баєсівський пріор)
    a  — базова ставка (апріорна ймовірність, специфічна для домену)

Ваги свідчень (BRS Розділ 4 — Комбінування свідчень):
    - Підтвердження/спростування перехресною верифікацією: вага 1.0 (пряма верифікація)
    - Іменоване цитування в тексті статті:               вага 0.5 (непряме позитивне свідчення)
    - Емоційна/маніпулятивна фраза:                      вага 0.3 (непряме негативне свідчення)
"""


def _brs_expected(r: float, s: float, a: float = 0.5, W: float = 2.0) -> float:
    """
    Очікувана довіра за Beta Reputation System Jøsang.

    E(p) = (r + W * a) / (r + s + W)

    При W=2 та a=0.5 це еквівалент баєсівського очікуваного значення
    Beta(α, β) розподілу: E = α / (α + β), де α=r+1, β=s+1.
    """
    return (r + W * a) / (r + s + W)


def calculate_credibility(
    n_conf: int,
    n_contra: int,
    domain_trust: float = 0.5,
    citations_count: int = 0,
    emotional_words_count: int = 0,
    n_unverified: int = 0,
) -> float:
    """
    Достовірність через BRS з об'єднанням багатоджерельних свідчень.

    Джерела свідчень (зважені за BRS Розділ 4):
        r = n_conf * 1.0  +  citations_count * 0.2
        s = n_contra * 1.0  +  emotional_words_count * 0.3 + n_unverified * 0.4
        a = domain_trust (базова ставка з репутації домену)

    Це забезпечує чутливість достовірності навіть коли перехресна верифікація недоступна:
    - Якісна стаття (5 цитувань, 0 емоційних): достовірність ≈ 65%
    - Пропаганда (0 цитувань, 6 емоційних):    достовірність ≈ 26%
    - Неперевірені конкретні тези (n_unverified): знижує достовірність

    Джерело: Jøsang & Ismail 2002, Eq. 3 + Section 4
    """
    # Primary evidence: cross-verification (weight 1.0 per observation)
    r = float(n_conf)
    s = float(n_contra)

    # Secondary evidence: citations as weak positive (0.2 each)
    r += citations_count * 0.2

    # Secondary evidence: emotional language as weak negative (0.3 each)
    s += emotional_words_count * 0.3

    # Secondary evidence: unverified specific claims as weak negative (0.4 each)
    s += n_unverified * 0.4

    score = _brs_expected(r=r, s=s, a=domain_trust) * 100.0
    return max(0.0, min(100.0, score))


def calculate_transparency(citations_count: int) -> float:
    """
    Прозорість через BRS з консервативним пріором.

    Кожне іменоване джерело / цитування — позитивне свідчення (r).
    Контр-свідчення відсутні (s=0).
    Базова ставка a=0.3 — стаття повинна *довести* свою прозорість
    через цитування; відсутність цитувань дає низький бал.

    Джерело: Jøsang & Ismail 2002, Eq. 3
    """
    score = _brs_expected(r=citations_count, s=0, a=0.3) * 100.0
    return max(0.0, min(100.0, score))


def calculate_objectivity(emotional_words_count: int, total_words: int) -> float:
    """
    Об'єктивність через BRS з динамічною моделлю вікна спостережень.

    Агент аналізує статтю та підраховує маніпулятивні фрази.
    Моделюємо як K незалежних спостережень, де K масштабується з довжиною статті
    (1 спостереження на 50 слів, мінімум 8).
    Кожне емоційне слово — негативне свідчення (s), решта
    слотів — позитивне свідчення (r = K - s).

    a = 0.5 (неінформативний пріор)

    Джерело: Jøsang & Ismail 2002, Eq. 3
    """
    K = max(8, total_words // 50)  # dynamic observation window
    s = min(emotional_words_count, K)
    r = K - s
    score = _brs_expected(r=r, s=s, a=0.5) * 100.0
    return max(0.0, min(100.0, score))


def aggregate_trust_score(credibility: float, transparency: float, objectivity: float) -> float:
    """
    Фінальний Trust Score через просте адитивне зважування (SAW).

    Ваги: Достовірність 50%, Прозорість 30%, Об'єктивність 20%.

    Коли достовірність < 50 (нижче неінформативного пріору), свідчення
    мають нетто-негативний характер. М'яка BRS-знижка моделює
    транзитивність довіри Jøsang: якщо фактологічна база слабка,
    інші метрики мають менше загальне значення.

    Джерело: Jøsang & Ismail 2002, Section 5 (Trust Transitivity)
    """
    trust = 0.50 * credibility + 0.30 * transparency + 0.20 * objectivity

    # Soft discount when net evidence is negative (credibility below prior)
    if credibility < 50.0:
        discount = 0.5 + (credibility / 100.0)
        trust *= discount

    return max(0.0, min(100.0, round(trust, 1)))


