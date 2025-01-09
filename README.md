# Krzywomator
>monorepo

[Wypróbuj online](https://github.com)

## I. Znane problemy

- Edytor lubi mieć prolemy z odświeżaniem stanu, zazwyczaj nie wpływa to na doświadczenie jakoś znacząco

- Przesuwania pierwszego punktu kontrolnego po przeskalowaniu i rotowaniu obiektu powoduje problemy... TODO: Wyłączyć taką możliwość

- Aplikacja jest w miare responsywna... aczkolwiek najresponsywniejsza to ona nie jest, w razie czego wszelakie błędy naprawi zwykłe odświeżenie karty (aplikacja robi ciągły autozapis)

## II. Poradnik użytkownika [PL]

Aby rozpocząc prace z narzędziem nalerzy utworzyć nowy projekt lub dołączyć do istniejącego projektu poprzez url w formacie `host/editor?p={id projektu}`. 

Po utworzeniu projektu spotka nas ekran podzielony na kilka sekcji

1. Ekran roboczy (na środku)
2. Oś czasu (na dole)
3. Edytor klatek (na dole pod osią czasu)
4. Lista obiektów (po lewej)
5. Lista narzędzi (po lewej nad listą obiektów)

### 1. Tworzenie krzywych i okno robocze

Aby utworzyć pierwszy animowalny obiekt, należy wybrać narzędzie Rysowania krzywych klikając w ostatnią ikone na liście lub klikając skrót klawiszowy `B` - a nastepnie kliknąć w dowolne miejsce na ekranie roboczym by rozpocząc rysowanie krzywej

Możemy dodawać 2 rodzaje punktów, punkty "proste" i punkty "kluczowe Beziera".Trzymając klawisz `shift` zmieniamy tryb rysowania, a podgląd powinien pokazać jaka krzywa utworzy się po naciśnięciu lewego przycisku myszy

Po zakończeniu rysowania krzywej możemy zmienić narzędzie na dowolne inne, najlepiej narzędzie zaznaczania (pod skrótem klawiszowym `S` lub pierwszą od lewej ikoną na liście narzędzi)

Teraz możemy odznaczyć naszą krzywą (klikając w tło ekranu roboczego gdzie nie znajduje się żadna inna krzywa), aby narysować następną lub kontynuować prace na tej pierwszej

### 2. Lista obiektów i narzędzia

Po utworzeniu naszej krzywej możemy zauważyć że pojawiła się na naszej liście obiektów po lewej stronie z losowo wygenerowaną nazwą. Klikając ikonke ołówka obok niej, możemy te nazwe edytować. Z kolei klikając w ikonke śmietnika, możemy ją usunąć


Nad listą obiektów, znajduje się lista narzędzi. Poznaliśmy już edytor krzywych i narzędzie zaznaczania, ale poza nimi mamy jeszcze 4 inne narzędzia

Pod skrótem klawiszowym `T`, `R` i `S`, kryją się kolejno narzędzie przesuwania, obracania i skalowania naszych krzywych

Przedostatnim narzędziem, pod skrótem klawiszowym `C` jest narzędzie edycji punktów kontrolnych. Za pomocą tego narzędzia możemy przesuwać punkty kontrolnej naszej krzywej

### 3. Oś czasu i tworzenie klatek animacji

Głównym celem naszego programu jest oczywiście tworzenie animacji poklatkowych

Po zaznaczeniu dowolnego obiektu, możemy zauważyć że na dole ekranu pojawia nam się masa różnych "parametrów"

Do każdego z tych parametrów na osi możemy dodawać `klatki kluczowe` w `czasie`.

Aby dodać klatke kluczową, należy wybrać odpowiedni moment animacji, w którym chcemy aby dana wartość danego parametru została osiągnięta a następnie edytować te wartość (klikając w liczbe po prawej stronie etykiety z parametrem lub ręcznie przesuwając, obracając itd. obiekt przy użyciu narzędzi)

Dla obiektów typu krzywe Beziera możemy edytować

`x` - pierwsza współrzędna przesunięcia punktów kluczowych obiektu 

`y` - druga współrzędna przesunięcia punktów kluczowych obiektu 

`scale` - skalowanie obiektu względem pierwszego punktu kontrolnego

`rotation` - obrót obiektu względem pierwszego punktu kontrolnego

`color` - wartości `R`,`G`,`B`,`A`  w formacie 32 bitowym `rgba` koloru krzywej

`Stroke progress` - "ile % krzywej jest narysowane od pierwszego punktu kontrolnego do końca"

`Stroke thickness` - grubość krzywej

`Control Points` - wartości `x`, `y` dla pojedyńczych punktów kluczowych krzywej

Pomiędzy następnymi klatkami program wykonuje liniową interpolacje, dzięki czemu nie musimy tworzyć sześciuset klatek dla 10 sekundowego przesunięcia

### 4. Eksportowanie projektu

Gdy uznamy że nasza animacja jest już dostatecznie dobra by pokazać ją światu, należy kliknąć guzik "Eksportuj" w lewym górnym rogu, a następnie odpowiednio wybrać birtrate i zakres czasu eksportowania


### 5. Ustawianie okna roboczego pod siebie

Rozmiar każdej sekcji można zmieniać przeciągając granice sekcji 

Oś OY między listą obiektów a ekranem roboczym a oś OX między ekranem roboczym a linią czasu

Możemy także edytować zakres wyświetlanego zakresu na osi czasu jeżeli uznamy że nie potrzebujemy widzieć całych 60-ciu sekund

Aby edytować zakres wyświetlanego zakresu, należy odpowiednio przeciągnąć czerwone paski na tym małym okienku po lewej od osi czasu, pod listą obiektów i nad listą parametrów obiektu

### 6. Kolaboracja

Dowolna osoba z dowolnego miejsca na świecie może dołączyć do ciebie w trakcie pracy jeżeli podzielisz się z nią linkiem! Wystarczy że wyślesz swój aktualny URL (funkcja w aktualnym stanie nie jest najstabilniejsza i najbardziej zabezpieczona aczkolwiek synchronizacja działa solidnie)
