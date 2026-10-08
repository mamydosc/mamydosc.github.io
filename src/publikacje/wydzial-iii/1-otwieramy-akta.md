---
title: Wydział III pod lupą. Otwieramy akta
date: 2026-10-12
czesc: 1
lead: Przez ostatnie miesiące zbieraliśmy orzeczenia, zarządzenia i odpowiedzi sądów na wnioski o informację publiczną. Układają się w obraz, który chcemy pokazać publicznie – spokojnie, na dokumentach, z sygnaturami.
opisStrony: Zapowiedź cyklu dziewięciu tekstów o Wydziale III WSA w Warszawie. Tylko dokumenty, sygnatury i liczby.
obraz: /assets/img/wsa3-01.jpg
obrazAlt: "Grafika: „Wydział III pod lupą” – zapowiedź cyklu dziewięciu tekstów Fundacji MAMY DOŚĆ o Wojewódzkim Sądzie Administracyjnym w Warszawie, z listą tematów."
zrodla:
  - Postanowienia WSA w Warszawie (Wydział III) z 2026 r. – sygnatury w kolejnych częściach
  - Odpowiedzi WSA w Warszawie i 15 pozostałych WSA na wnioski o informację publiczną (kwiecień–październik 2026)
  - Pisma Zastępcy Rzecznika Dyscyplinarnego NSA z 23–25.09.2026
---
Fundacja MAMY DOŚĆ śledzi sprawy prowadzone przed Wydziałem III Wojewódzkiego Sądu Administracyjnego w Warszawie. To sprawy obywateli przeciwko administracji skarbowej: o dostęp do akt, o bezczynność urzędów, o zwrot podatku.

W 2026 r. zauważyliśmy w nich zjawiska, które się powtarzają – a których, jak wynika z odpowiedzi innych sądów, gdzie indziej nie odnotowano albo odnotowano pojedynczo. W sprawach, które wspieramy, złożono skargi do Rzecznika Dyscyplinarnego Naczelnego Sądu Administracyjnego, a do wszystkich 16 wojewódzkich sądów administracyjnych skierowano wnioski o informację publiczną. Większość odpowiedzi już mamy.

### Co opublikujemy

{%- set c = cykle | znajdz("id", "wydzial-iii") %}
<div class="series"><ol>
{%- for cz in c.czesci %}{% if not loop.first %}
<li><span class="n">CZ. {{ loop.index }}/{{ c.czesci.length }}</span><span>{{ cz.tytul }}</span><span class="d">{{ cz.data | data }}</span></li>
{%- endif %}{% endfor %}
</ol></div>

### Jak piszemy

Opieramy się wyłącznie na dokumentach: orzeczeniach dostępnych pod sygnaturami, odpowiedziach sądów i urzędów na wnioski o informację publiczną oraz pismach doręczonych w toku spraw. Nie podajemy nazwisk sędziów – interesuje nas mechanizm, nie osoby. Oceny i wnioski zawsze oznaczamy jako nasze. Piszemy też otwarcie, że część opisywanych spraw to sprawy, w których fundacja wspiera stronę. Dwie sprawy są w Naczelnym Sądzie Administracyjnym – ich wynik opiszemy bez względu na to, jaki będzie.
