# Arcitai Software and Security Factory

**Business first. Security and quality built in.**

Giv din eksisterende app en fast arbejdsgang fra **issue til verificeret ændring og review**. Pakken samler skills, udvikling i vertical slices og security-checks. Du bruger din valgte agent og beholder appens repository, CI og hosting.

```text
Issue → afgrænsning → byg og test → security/review → PR
```

## Kom i gang med én app

### 1. Hent pakken

Kræver adgang til dette repo, Git og Node.js 22.13+. Kør i den mappe, hvor du vil have factory-kilden:

```sh
git clone https://github.com/arcitai/software-factory.git
cd software-factory
node scripts/export-kit.mjs ../my-app-factory-kit
```

Det laver en lille pakke i en **ny mappe**. Din app ændres først i næste trin. Har du allerede klonet repoet, kan du nøjes med eksportkommandoen.

### 2. Lad din agent tilslutte appen

Åbn **appens eget repo** i din sædvanlige agent. Giv den stien til `my-app-factory-kit` og denne besked:

> Tilslut denne app til factory-pakken. Følg pakkens START-HERE.md. Bevar eksisterende instruktioner, arkitektur, CI og deployment. Brug mine kendte valg, udfyld installationsarket, og vis ændringen på en branch. Markér manglende adgang. Start manuelt med én lille opgave, som kan testes og reviewes.

[Opsætning og første opgave →](kit/README.md)

### 3. Prøv en rigtig opgave

Vælg én lille fejl eller forbedring fra appens backlog. Bed agenten om at løse den med pakkens metode. Review ændringen, de faktiske checks og registreret tid/forbrug. **Første milepæl er én verificeret vertical slice afleveret til review.**

Når den vej virker, tilsluttes automatisk start fra issues i det valgte agentmiljø. GitHub kan være hele kontrolpanelet.

**Produktmålet:** én færdigsamlet factory på Machinist til VPS eller egen maskine, med fælles dashboard for software, security og valgfrie Defense-forløb. Forbind repo/model, afprøv miljøet og send første issue. Den samlede udgivelse skal stadig bygges; trinene ovenfor bruger det eksisterende metodekit. [Kort review](docs/review.html) · [Byggeretning](docs/platform.md).

## Det følger med

- **Seks skills:** afgrænsning, specifikation, implementering, review, security og evaluering.
- **Projektets opsætning:** ét installationsark, en issue-form og et inaktivt CI-eksempel.
- **Dokumenteret kvalitet og værdi:** checks, afleveringskort samt pris, tid og menneskelig indsats.
- **Valgfrit dashboard og lokal runner:** [prøv demoen](docs/setup.md#prøv-demoen).

**Status: v0.1.** Pakken og den lokale starter er afprøvet med syntetiske cases. En rigtig app-/modelpilot mangler endnu. Skills installerer ikke værktøjer eller cloudautomation; den valgte integration skal afprøves. Der er intet obligatorisk Arcitai-abonnement.

[Læs mere efter behov](docs/README.md) · [Warp, BuilderIO og vores produktform](docs/product-experience.md) · [Security](SECURITY.md)

MIT. Agent-, model- og hostingvalg er åbne. [Defense deler platformen](docs/adoption.md#produktnavn-og-grænsen-til-defense-factory) med egne workflows, beviser og rettigheder.
