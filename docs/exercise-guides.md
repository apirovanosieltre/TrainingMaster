# Guida agli esercizi

Le schede dimostrative usano identificativi stabili per collegare la prescrizione alla guida, evitando di associare per errore nomi simili o varianti diverse.

Il pulsante `i` apre un secondo dialogo: la scheda sottostante conserva lo scorrimento e il timer non viene modificato. Alla chiusura, il focus torna al pulsante che ha aperto la guida. La libreria completa si apre da **Le mie schede → Esplora gli esercizi** e consente ricerche per nome, gruppo e attrezzatura.

## Copertura iniziale

| ID | Guida |
| --- | --- |
| `riscaldamento_generale` | Riscaldamento generale |
| `riscaldamento_anche_caviglie` | Mobilità di anche e caviglie |
| `squat_bilanciere` | Squat con bilanciere |
| `panca_piana` | Panca piana |
| `rematore_manubri` | Rematore con due manubri a busto inclinato |
| `affondi_alternati` | Affondi alternati in avanti |
| `plank_frontale` | Plank sugli avambracci |
| `stacco_rumeno` | Stacco rumeno con bilanciere |
| `split_squat` | Split squat con piede posteriore a terra |
| `leg_curl_prono` | Leg curl da sdraiati |
| `dead_bug` | Dead bug |

Le guide includono due illustrazioni schematiche originali, passaggi, respirazione, errori comuni e una frase da ricordare. Negli esercizi statici le immagini evidenziano appoggi e allineamento della medesima posizione, non due ripetizioni.

Le illustrazioni SVG sono generate da `dist/exercise-figures.js`: non dipendono da immagini o servizi esterni. Catalogo, stili e generatore sono inseriti nella cache del service worker. I link ai riferimenti esterni richiedono una connessione.

## Contenuti e varianti

`dist/exercise-guides.js` contiene istruzioni generali redatte in italiano. I riferimenti ACE, NASM e NHS sono consultabili nella sezione **Riferimento tecnico** di ogni guida. I riferimenti allo schema di squat, tirata e affondo riguardano il principio del movimento e non equivalgono alla descrizione di ogni variante con attrezzatura.

Le indicazioni individuali del preparatore, compresi carichi, varianti e adattamenti, restano distinte dalla guida generale. I tempi visualizzati nella sezione **Nella tua scheda** provengono dalla sessione corrente; la guida non li sovrascrive. La libreria mostra soltanto le varianti elencate sopra: non riconosce automaticamente qualsiasi esercizio futuro.

Per aggiungere un esercizio, creare un nuovo ID nel catalogo, definire una posa illustrata appropriata e usare lo stesso ID nella prescrizione. In futuro, l'importatore JSON potrà usare questi ID; l'importazione non fa parte di questa modifica.

## Verifica

Test automatici sulla copertura delle schede, ricerca, ID sconosciuti e generazione SVG. Controllo UI su viewport da 390 e 320 pixel, temi chiaro/scuro, apertura e chiusura sopra la scheda e ritorno ai risultati di ricerca.
