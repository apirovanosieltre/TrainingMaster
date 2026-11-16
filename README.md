# TrainingMaster · Forma

PWA mobile-first per preparatori atletici e atleti. Prototipo interattivo senza dipendenze di compilazione.

## Avvio locale

Richiede Node.js 18 o successivo.

```sh
npm start
npm test
```

Aprire `http://localhost:4173`. Per aprire l'app da un telefono sulla stessa rete usare l'indirizzo LAN del computer; installazione PWA e service worker richiedono HTTPS, salvo localhost.

La cartella pubblicabile è `dist/`. Su hosting statico servire `index.html` e gli asset dalla radice del dominio.

## Funzioni disponibili

- Vista dimostrativa atleta/preparatore, con selettore del ruolo. Non è autenticazione.
- Programmi di esempio e consultazione delle singole sessioni.
- Caricamento e assegnazione locale di PDF e documenti, conservati in IndexedDB.
- Richieste schede e diario allenamenti, conservati in localStorage.
- Calendario mensile con disponibilità pubblicate dal preparatore, prenotazione di slot liberi e annullamento. Le nuove prenotazioni sono confermate subito nella demo.
- Comandi distinti per ruolo: il preparatore carica schede e gestisce gli orari; l’atleta consulta e registra i propri allenamenti. I controlli sono locali, non autenticazione.
- Guide visuali per gli 11 esercizi/movimenti delle schede di esempio, pulsanti “i”, ricerca e illustrazioni SVG incluse nella cache offline.
- Timer di lavoro e recupero preimpostati negli esercizi, conto alla rovescia libero e cronometro.
- Timer persistente con scadenza assoluta: navigazione, refresh e sospensione della pagina non riavviano il conteggio. Il segnale audio richiede una pagina attiva; non è garantito con schermo bloccato o app chiusa.
- Opzione “Mantieni schermo acceso” nella pagina Timer: durante il timer oppure per tutto l’uso visibile dell’app; stato effettivo e gestione delle interruzioni del sistema.
- Tema automatico secondo il sistema, con scelta manuale chiaro/scuro salvata sul dispositivo.
- Manifest PWA, icone e cache offline dell'interfaccia. Le font Google richiedono rete alla prima apertura; sono previsti font di riserva.

## Stato del progetto

È una demo locale, non ancora un servizio multiutente. Non sono implementati account reali, API, database condiviso, calendario condiviso multiutente, notifiche push e importazione automatica delle schede. Il cambio di ruolo serve a provare i flussi sullo stesso dispositivo.

I documenti caricati sono consultabili ma non vengono ancora analizzati per estrarne esercizi e tempi. I timer delle schede provengono dai programmi dimostrativi strutturati nell'app.

## Formati di importazione proposti

La specifica in [docs/import-formats.md](docs/import-formats.md) definisce un possibile formato v1, con esempi in `templates/`. Sono proposte e fixture di esempio; non esiste ancora un importatore nell'app.

## Pubblicazione Sites

L'anteprima privata è pubblicata tramite Sites. `.openai/hosting.json` contiene l'identità del Site e non contiene segreti. Per una pubblicazione su un proprio host statico è sufficiente `dist/`; non è necessario il manifest di Sites.
