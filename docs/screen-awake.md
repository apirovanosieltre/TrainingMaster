# Mantieni schermo acceso

L'opzione si trova nella pagina Timer ed è inizialmente disattivata. Le preferenze vengono conservate localmente nella chiave `forma-screen-awake-v1`, senza salvare il riferimento del blocco del sistema.

## Modalità

- **Solo con il timer in corso:** mantiene acceso lo schermo quando conto alla rovescia o cronometro sono in esecuzione. Funziona anche navigando alle altre sezioni. Pausa, azzeramento e fine del timer rilasciano la richiesta.
- **Finché uso l'app:** mantiene acceso lo schermo mentre l'app è visibile, anche senza timer, per esempio durante la lettura della scheda. Il blocco viene rilasciato spegnendo l'opzione, uscendo dalla pagina o passando in background. La fine del timer non lo disattiva in questa modalità esplicita.

In entrambi i casi il blocco manuale del telefono rimane disponibile. Al ritorno in primo piano l'app prova a riacquisire la funzione se l'opzione e la modalità la richiedono ancora.

## Stati

L'interfaccia distingue attivazione in corso, funzione attiva, attesa del timer, sospensione, interruzione da parte del sistema, richiesta rifiutata e mancanza di supporto. Lo stato “Attivo” viene mostrato soltanto dopo che il browser ha concesso una `WakeLockSentinel` non rilasciata.

Dopo un rifiuto o un'interruzione non ci sono tentativi periodici: è possibile premere “Riprova ad attivare”. Nuovi tentativi sono consentiti anche con avvio/ripresa del timer, cambio dell'opzione/modalità e ritorno visibile nell'app. Le richieste concorrenti vengono accorpate; una concessione tardiva, dopo lo spegnimento dell'opzione o il passaggio in background, viene rilasciata immediatamente.

## Limiti e verifica

La Screen Wake Lock API richiede un contesto sicuro (HTTPS o localhost) e può essere limitata da browser, risparmio energetico e Permissions Policy. Non garantisce audio, notifiche o esecuzione in background e non modifica le impostazioni di blocco del telefono. Nessun trucco video o audio viene usato come ripiego.

Riferimenti: [MDN: Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) e [request()](https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request).

Test automatici: attivazione per modalità, rilascio in pausa/fine timer e background, riacquisizione, errori, supporto mancante, richieste pendenti invalidate e persistenza delle preferenze. Verifica UI nel browser con concessione reale dell'API e stato attivo, pausa e cambio modalità. Il blocco fisico e il comportamento energetico su un iPhone o Android reale richiedono verifica sul dispositivo.

## Segnali del timer

Le opzioni sonore sono indipendenti: **Segnale sonoro al termine** produce tre toni brevi, mentre **Beep negli ultimi 5 secondi** produce un tono a 5, 4, 3, 2 e 1 secondi. Il cronometro non ha un conto alla rovescia e non usa questi ultimi segnali. I cinque secondi finali vengono evidenziati anche visivamente.

I suoni sono sintetizzati localmente con Web Audio, senza file o richieste di rete. L'avvio del timer o l'attivazione di un'opzione sonora prova a sbloccare il contesto audio. Le preferenze vengono conservate tra le sessioni; una preferenza silenziosa già esistente mantiene disabilitati anche i nuovi beep, salvo scelta esplicita. Non si riproducono segnali arretrati dopo il ritorno dal background.
