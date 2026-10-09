# Chara's Toolkit: guida in italiano

[Torna al README](../README.md)

Chara's Toolkit raccoglie 22 skill per gli agenti di programmazione: istruzioni specializzate per analizzare repository, correggere bug, rivedere codice, creare interfacce e verificare le modifiche. L'integrazione completa con Codex aggiunge la scelta del workflow, sei ruoli opzionali per i sottoagenti e gli aggiornamenti automatici.

## 1. Installa

Servono **Node.js 18 o successivo**, con `npm` e `npx`, e **Codex già configurato**. Puoi controllare Node e npm con:

```sh
node --version
npm --version
```

Per l'installazione personale completa, esegui nel terminale:

```sh
npx --yes github:cmdr-chara/chara-toolkit setup
```

Il comando installa:

- le skill nella cartella `skills` della home di Codex;
- i sei ruoli Mission Control nella cartella `agents`;
- il catalogo dei workflow e un blocco di istruzioni nel file globale `AGENTS.md`;
- un processo pianificato per gli aggiornamenti.

La home predefinita è `~/.codex`; il comando rispetta anche `CODEX_HOME`. Le istruzioni personali fuori dal blocco gestito vengono mantenute. I file gestiti modificati vengono salvati in `backups` prima della sostituzione.

Gli aggiornamenti pianificati seguono le **release pubblicate su GitHub**. Non installano automaticamente ogni nuovo commit di `main`.

## 2. Verifica l'installazione

```sh
npx --yes github:cmdr-chara/chara-toolkit mission-control check
```

Il controllo verifica i ruoli installati, i loro permessi dichiarati e lo stato delle istruzioni di routing presenti. Dopo il setup, **avvia una nuova attività Codex** nel tuo progetto: un'attività già aperta potrebbe non aver caricato le nuove skill.

## 3. Descrivi il risultato che vuoi

Non serve memorizzare i nomi delle skill. Scrivi la richiesta in linguaggio naturale, per esempio:

```text
Trova i bug importanti di questo repository, correggili e verifica le modifiche.
```

```text
Questa API è lenta. Misura il problema, migliorala e confronta i risultati.
```

```text
Aggiorna questa dipendenza mantenendo la compatibilità e controlla i test.
```

```text
Rivedi questa modifica all'autenticazione e segnala i problemi di sicurezza verificabili.
```

Le istruzioni di routing aiutano l'agente a scegliere lo specialista pertinente e a caricare gli approfondimenti quando servono. Puoi anche chiedere esplicitamente di usare una skill, per esempio `repository-intelligence` per orientarti in un progetto sconosciuto.

Le istruzioni `AGENTS.md` del progetto hanno priorità sulla guida generale del toolkit. Le skill non concedono permessi aggiuntivi: comandi, accesso ai file e azioni esterne dipendono dall'ambiente Codex e dalle tue autorizzazioni.

## Opzioni di installazione

Per vedere le operazioni previste senza installare nulla:

```sh
npx --yes github:cmdr-chara/chara-toolkit setup --dry-run
```

Per installare senza registrare l'updater automatico:

```sh
npx --yes github:cmdr-chara/chara-toolkit setup --no-auto-update
```

`--no-auto-update` non rimuove un updater già attivo. Per disattivarlo, usa `auto-update remove`, descritto sotto.

Per usare una home Codex diversa, sostituisci il percorso dell'esempio con quello effettivo:

```sh
npx --yes github:cmdr-chara/chara-toolkit setup --codex-home /percorso/codex
```

Anche i controlli successivi devono usare lo stesso `--codex-home` o `CODEX_HOME`.

Se preferisci avere il comando `chara` disponibile nel terminale:

```sh
npm install --global github:cmdr-chara/chara-toolkit
chara setup
chara mission-control check
```

Il vecchio comando `codex-toolkit` rimane un alias compatibile. L'installazione globale del pacchetto da sola non configura le skill: serve anche `chara setup`.

## Gestisci gli aggiornamenti

Controlla lo stato:

```sh
npx --yes github:cmdr-chara/chara-toolkit auto-update status
```

Disattiva gli aggiornamenti pianificati:

```sh
npx --yes github:cmdr-chara/chara-toolkit auto-update remove
```

Questo lascia installati skill, ruoli e routing. Per riattivare gli aggiornamenti:

```sh
npx --yes github:cmdr-chara/chara-toolkit auto-update install
```

Su Windows l'updater usa Utilità di pianificazione, su macOS un LaunchAgent e su Linux un timer utente systemd, con fallback a cron. I dettagli sono nella [guida agli aggiornamenti](auto-update.md).

## Installa soltanto una skill

Per vedere le skill disponibili:

```sh
npx skills add https://github.com/cmdr-chara/chara-toolkit --list
```

Per installare soltanto `repository-intelligence` in Codex a livello utente:

```sh
npx skills add https://github.com/cmdr-chara/chara-toolkit --skill repository-intelligence -g -a codex
```

Questa modalità non aggiunge il routing globale, i ruoli Mission Control o l'updater del toolkit. Le skill sono riutilizzabili anche in client compatibili con Agent Skills; l'integrazione completa resta specifica di Codex. Vedi la [guida alla portabilità](portable-skills.md).

## Se qualcosa non funziona

- **`node`, `npm` o `npx` non viene trovato:** controlla l'installazione di Node.js e riapri il terminale dopo aver aggiornato il `PATH`.
- **Le skill non compaiono:** avvia una nuova attività Codex e verifica di usare la stessa home indicata durante il setup.
- **`mission-control check` segnala file mancanti o modificati:** per un'installazione personale, riesegui `setup` con la stessa home. Prima controlla eventuali personalizzazioni che vuoi conservare.
- **Il setup segnala un blocco `AGENTS.md` malformato:** conserva una copia del file e controlla i marker `codex-toolkit:start` e `codex-toolkit:end`. Il toolkit si ferma per evitare di riscrivere istruzioni ambigue.
- **L'installazione è gestita dall'organizzazione:** segui la [guida enterprise](enterprise-deployment.md) e il pacchetto approvato dall'amministratore. Il setup personale non sostituisce l'approvazione firmata.

## Approfondimenti

- [Catalogo delle skill](../skills/llms.txt) e [workflow](../orchestration/workflows.md)
- [Responsabilità degli specialisti](responsibility-matrix.md) e [design del toolkit](skill-system-design.md)
- [Verifica di applicazioni reali](project-verification.md)
- [Sicurezza delle operazioni distruttive](destructive-operations-safety.md) e [segnalazioni di sicurezza](../SECURITY.md)
- [Prevenzione degli errori ricorrenti](recurring-agent-errors.md)
- [Valutazioni](../evaluations/README.md), [benchmark comportamentali](../evaluations/behavioral-benchmark.md) e [benchmark degli outcome](../evaluations/outcome-benchmarks.md)
- [Ricerca sulle skill](independent-skill-research-2026-10.md) e [nomi e compatibilità](branding-migration.md)
- [Contribuire](../CONTRIBUTING.md), [changelog](../CHANGELOG.md), [licenza](../LICENSE) e [crediti](../THIRD_PARTY_NOTICES.md)
