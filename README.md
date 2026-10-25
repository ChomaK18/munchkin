# Munchkin Zombie — licznik walki

Instalowalna aplikacja PWA zbudowana w React i Vite. Pozwala rozpocząć nową grę, ustawić skład i poziomy graczy, a następnie rozpocząć walkę wybranym graczem. W trakcie gry skład jest zablokowany, a poziomy można aktualizować. Licznik walki sumuje siłę gracza i potwora wraz z nazwanymi bonusami oraz karami (np. klątwą `-2`). Dane są zapisywane lokalnie w przeglądarce.

Interfejs nawiązuje kolorami do pudełka **Munchkin Zombie**: wykorzystuje postarzone beże, zielenie, czerwień i turkusowe akcenty.

## Uruchomienie lokalne

Wymagany jest Node.js 20 lub nowszy.

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

Gotowa aplikacja znajduje się w katalogu `dist/`. PWA wymaga bezpiecznego połączenia HTTPS; `localhost` działa lokalnie bez HTTPS.

## Publikacja przez GitHub Pages

Workflow w `.github/workflows/deploy.yml` publikuje aplikację automatycznie po wypchnięciu zmian na gałąź `main`.

1. Wypchnij repozytorium na GitHuba.
2. W repozytorium otwórz **Settings → Pages** i jako źródło wybierz **GitHub Actions**.
3. Po zakończeniu workflow adres strony będzie widoczny w ustawieniach Pages.

Build używa ścieżek względnych, więc działa zarówno na domenie GitHub Pages, jak i pod ścieżką repozytorium. Po pierwszym otwarciu przez HTTPS aplikację można dodać do ekranu głównego; licznik będzie działał również offline.
